import { Route, Routes } from "react-router-dom";
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
const UpdateCategory = lazy(() => import("./pages/UpdateCategory"))
const Product = lazy(() => import("./pages/Product"))
const AllProducts = lazy(() => import("./pages/AllProducts"))
const UpdateProduct = lazy(() => import("./pages/UpdateProduct"))
const ProductDetails = lazy(() => import("./pages/ProductDetails"))
const Cart = lazy(() => import("./pages/Cart"))
const Promotions = lazy(() => import("./pages/Promotions"))

function App() {
    const [toasts, setToasts] = useState([]);
    const { refreshNotifications } = useAppContext();

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
                    </Routes>
                </Suspense>
            </main>

            <Footer />
        </div>
    );
}

export default App;