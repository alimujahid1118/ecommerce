import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AppContext = createContext();

export function AppProvider({ children }) {

    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [category, setCategory] = useState([])
    const [getProducts, setGetProducts] = useState([])

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

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
                setUserData({
                    firstName: "",
                    lastName: "",
                    username: "",
                    email: "",
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
        const getAllProducts = async() => {
            const response = await api.get("/auth/get-products");
            setGetProducts(response.data)
        }

        getAllProducts()
    }, [])

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

                getProducts,
                setGetProducts
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}