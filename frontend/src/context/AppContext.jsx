import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AppContext = createContext();

export function AppProvider({ children }) {

    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [category, setCategory] = useState([])
    const [ordersLoading, setOrdersLoading] = useState(true);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    const [totalPages, setTotalPages] = useState(null)

    const [orders, setOrders] = useState([])

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [toasts, setToasts] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    const [userData, setUserData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        is_admin: false
    });

    const [categoryData, setCategoryData] = useState({
        name: "",
        image: null,
    });

    useEffect(() => {

        const getMe = async () => {
            try {
                const response = await api.get("/auth/get-me");
                setUserData(response.data.user);
                setIsAuthenticated(true);
            } catch {
                setIsAuthenticated(false);
                setUserData({
                    firstName: "",
                    lastName: "",
                    username: "",
                    email: "",
                    is_admin: false
                });
            } finally {
            setIsAuthLoading(false);
        }
        };

        getMe();
    }, []);

    useEffect(()=> {
            const getCategory = async () => {
                try {
                    const response = await api.get("/auth/get-category");
                    setCategory(response.data)
                } catch (error) {
                    console.log(error)
                }
            }
    
            getCategory()
        }, [])

    useEffect(() => {
        if (!isAuthenticated) return;

        const getOrders = async() => {
            setOrdersLoading(true);
            try {
                const response = await api.get("/get-orders");
                setOrders(response.data)
            } catch (error) {
                console.log(error)
            } finally {
                setOrdersLoading(false);
            }
        }
        getOrders()
    }, [isAuthenticated])

    const refreshNotifications = useCallback(async () => {
        try {
            const response = await api.get("/notifications");
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        const getNotifications = async () => {
            try {
                const response = await api.get("/notifications");
                setNotifications(response.data.notifications);
                setUnreadCount(response.data.unreadCount);
            } catch (error) {
                console.log(error);
            }
        };

        getNotifications();
    }, [isAuthenticated]);

    useEffect(() => {
        const loadCartCount = async () => {
            if (isAuthenticated) {
                try {
                    const response = await api.get("/get-cart");
                    setCartCount((response.data || []).reduce((total, item) => total + (item.quantity || 0), 0));
                } catch {
                    setCartCount(0);
                }
                return;
            }

            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            setCartCount(cart.reduce((total, item) => total + (item.quantity || 0), 0));
        };

        loadCartCount();
    }, [isAuthenticated]);

    const markNotificationRead = useCallback(async (id) => {
        setNotifications((prev) => {
            const target = prev.find((notification) => notification._id === id);
            if (!target || target.read) return prev;

            setUnreadCount((count) => Math.max(0, count - 1));
            return prev.map((notification) =>
                notification._id === id ? { ...notification, read: true } : notification
            );
        });

        try {
            await api.patch(`/notifications/${id}/read`);
        } catch (error) {
            console.log(error);
        }
    }, []);

    const markAllNotificationsRead = useCallback(async () => {
        setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
        setUnreadCount(0);

        try {
            await api.patch("/notifications/read-all");
        } catch (error) {
            console.log(error);
        }
    }, []);

    const showToast = useCallback((message, type = "success") => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, title: type === "error" ? "Something went wrong" : "Success", body: message, type }]);
        window.setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 5000);
    }, []);

    const refreshCartCount = useCallback(async () => {
        try {
            if (isAuthenticated) {
                const response = await api.get("/get-cart");
                setCartCount((response.data || []).reduce((total, item) => total + (item.quantity || 0), 0));
                return;
            }

            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            setCartCount(cart.reduce((total, item) => total + (item.quantity || 0), 0));
        } catch {
            // Keep the last known badge value when the refresh request fails.
        }
    }, [isAuthenticated]);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <AppContext.Provider
            value={{
                menuOpen,
                setMenuOpen,
                profileOpen,
                setProfileOpen,

                isAuthenticated,
                setIsAuthenticated,

                userData,
                setUserData,

                categoryData,
                setCategoryData,

                category,
                setCategory,

                isAuthLoading,

                totalPages,
                setTotalPages,

                orders,
                setOrders,

                ordersLoading,

                notifications,
                unreadCount,
                refreshNotifications,
                markNotificationRead,
                markAllNotificationsRead,
                toasts,
                showToast,
                dismissToast,
                cartCount,
                refreshCartCount
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}