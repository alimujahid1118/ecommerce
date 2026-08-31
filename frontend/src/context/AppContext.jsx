import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AppContext = createContext();

export function AppProvider({ children }) {

    const [menuOpen, setMenuOpen] = useState(false);
    const [category, setCategory] = useState([])
    const [ordersLoading, setOrdersLoading] = useState(true);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    const [totalPages, setTotalPages] = useState(null)

    const [orders, setOrders] = useState(null)

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

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
    }, [])

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

    return (
        <AppContext.Provider
            value={{
                menuOpen,
                setMenuOpen,

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
                markAllNotificationsRead
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}