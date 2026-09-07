import { Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import Homepage from "./pages/Hompage";

const Register = lazy(() => import("./pages/Register"))
const Dashboard = lazy(() => import("./pages/Dashboard")) 
const VerifyEmail = lazy(() => import("./pages/VerifyEmail")) 
const Category = lazy(() => import("./pages/Category")) 

import Header from "./components/Header";
import Footer from "./components/Footer";
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Orders = lazy(() => import("./pages/Orders"));
const ManageUsers = lazy(() => import("./pages/ManageUsers"));
const NotificationPermissionPopup = lazy(() => import("./components/NotificationPermissionPopup"));
import NotificationToast from "./components/NotificationToast";
import { useAppContext } from "./context/AppContext";
const ChatWidget = lazy(() => import("./chat/ChatWidget"));
const Cursor = lazy(() => import("./components/Cursor"));
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
    const [idleEnhancementsReady, setIdleEnhancementsReady] = useState(false);
    const [desktopCursorReady, setDesktopCursorReady] = useState(false);
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
        let idleHandle;
        let timeoutHandle;

        const enableIdleEnhancements = () => {
            setIdleEnhancementsReady(true);
            setDesktopCursorReady(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
        };

        if ("requestIdleCallback" in window) {
            idleHandle = window.requestIdleCallback(enableIdleEnhancements, { timeout: 2000 });
        } else {
            timeoutHandle = window.setTimeout(enableIdleEnhancements, 1000);
        }

        return () => {
            if (idleHandle) window.cancelIdleCallback(idleHandle);
            if (timeoutHandle) window.clearTimeout(timeoutHandle);
        };
    }, []);

    useEffect(() => {
        let unsubscribe;
        let idleHandle;
        let timeoutHandle;

        const startMessaging = () => import("firebase/messaging")
            .then(async ({ onMessage }) => {
                const { getMessagingInstance } = await import("./firebase/firebase");
                const messaging = await getMessagingInstance();

                unsubscribe = onMessage(messaging, (payload) => {
                    setToasts((prev) => [
                        ...prev,
                        {
                            id: crypto.randomUUID(),
                            title: payload.notification?.title,
                            body: payload.notification?.body,
                        },
                    ]);

                    refreshNotifications();
                });
            })
            .catch(() => {
                // Messaging is optional and should not delay the storefront.
            });

        if ("requestIdleCallback" in window) {
            idleHandle = window.requestIdleCallback(startMessaging, { timeout: 3000 });
        } else {
            timeoutHandle = window.setTimeout(startMessaging, 2000);
        }

        return () => {
            unsubscribe?.();
            if (idleHandle) window.cancelIdleCallback(idleHandle);
            if (timeoutHandle) window.clearTimeout(timeoutHandle);
        };
    }, [refreshNotifications])

    return (
        <>
        {desktopCursorReady && (
            <Suspense fallback={null}>
                <Cursor />
            </Suspense>
        )}
        <SEO {...pageMeta} />
        <div className="min-h-screen flex flex-col">
            <Header />

            {idleEnhancementsReady && (
                <Suspense fallback={null}>
                    <NotificationPermissionPopup />
                </Suspense>
            )}
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

            {idleEnhancementsReady && (
                <Suspense fallback={null}>
                    <ChatWidget />
                </Suspense>
            )}
        </div>
        </>
    );
}

export default App;