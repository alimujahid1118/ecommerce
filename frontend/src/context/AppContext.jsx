import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AppContext = createContext();

export function AppProvider({ children }) {

    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    const [userData, setUserData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
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
                });
            } finally {
                setIsAuthChecked(true);
            }
        };

        getMe();
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
                isAuthChecked,

                userData,
                setUserData,

                categoryData,
                setCategoryData,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}