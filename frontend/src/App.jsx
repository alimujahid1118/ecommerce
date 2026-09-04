import { Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";

const Homepage = lazy(() => import("./pages/Hompage")) 
const Register = lazy(() => import("./pages/Register"))
const Dashboard = lazy(() => import("./pages/Dashboard")) 
const VerifyEmail = lazy(() => import("./pages/VerifyEmail")) 
const Category = lazy(() => import("./pages/Category")) 

import Header from "./components/Header";
import Footer from "./components/Footer";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import Orders from "./pages/Orders";
import ManageUsers from "./pages/ManageUsers";
import NotificationPermissionPopup from "./components/NotificationPermissionPopup";
import NotificationToast from "./components/NotificationToast";
import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase/firebase";
import { useAppContext } from "./context/AppContext";
import ChatWidget from "./chat/ChatWidget";
import Cursor from "./components/Cursor";
import SEO from "./components/SEO";
import NotFound from "./pages/NotFound";
const UpdateCategory = lazy(() => import("./pages/UpdateCategory"))
const AdminChat = lazy(() => import("./pages/AdminChat"))
const Product = lazy(() => import("./pages/Product"))
const AllProducts = lazy(() => import("./pages/AllProducts"))
const UpdateProduct = lazy(() => import("./pages/UpdateProduct"))
const ProductDetails = lazy(() => import("./pages/ProductDetails"))
const Cart = lazy(() => import("./pages/Cart"))
const Promotions = lazy(() => import("./pages/Promotions"))

function App() {
    const [toasts, setToasts] = useState([]);
    const { refreshNotifications } = useAppContext();
    const location = useLocation();

    const privateRoute = location.pathname.startsWith("/dashboard") ||
        ["/cart", "/checkout", "/payment-success", "/verify-email", "/accounts/register"].includes(location.pathname);
    const productListing = location.pathname === "/products";
    const hasListingFilters = productListing && Boolean(location.search);
    const pageMeta = productListing
        ? {
            title: hasListingFilters ? "Product Search | E Shop" : "Shop Products | E Shop",
            description: hasListingFilters
                ? "Browse product search and filter results from E Shop."
                : "Browse tech accessories, home upgrades, and everyday essentials from E Shop.",
            canonicalPath: "/products",
            noindex: hasListingFilters,
        }
        : location.pathname === "/"
            ? {
                title: "E Shop | Smart Essentials for Everyday Life",
                description: "Shop premium tech accessories, home upgrades, and everyday essentials from E Shop.",
                canonicalPath: "/",
                noindex: false,
            }
            : {
                title: privateRoute ? "E Shop Account" : "E Shop",
                description: privateRoute
                    ? "Manage your E Shop account and orders."
                    : "Shop products from E Shop.",
                canonicalPath: location.pathname,
                noindex: privateRoute,
            };

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    useEffect(() => {
        const unsubscribe = onMessage(messaging, (payload) => {
            setToasts((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    title: payload.notification?.title,
                    body: payload.notification?.body,
                },
            ]);

            refreshNotifications();
        })

        return () => unsubscribe()
    }, [refreshNotifications])

    return (
        <>
        <Cursor />
        <SEO {...pageMeta} />
        <div className="min-h-screen flex flex-col">
            <Header />

            <NotificationPermissionPopup />
            <NotificationToast toasts={toasts} onDismiss={dismissToast} />

            <main className="flex-1">
                <Suspense>
                    <Routes>
                        <Route path="/" element={<Homepage />} />
                        <Route path="/accounts/register" element={<Register />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/dashboard/category" element={<Category />} />
                        <Route path="/dashboard/update-category/:slug" element={<UpdateCategory />} />
                        <Route path="/dashboard/product" element={<Product />} />
                        <Route path="/products" element={<AllProducts />} />
                        <Route path="/dashboard/update-product/:slug" element={<UpdateProduct />} />
                        <Route path="/product/:slug" element={<ProductDetails />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/payment-success" element={<PaymentSuccess />} />
                        <Route path="/dashboard/orders" element={<Orders />} />
                        <Route path="/dashboard/users" element={<ManageUsers />} />
                        <Route path="/dashboard/promotions" element={<Promotions />} />
                        <Route path="/dashboard/chat" element={<AdminChat />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </main>

            <Footer />

            <ChatWidget />
        </div>
        </>
    );
}

export default App;