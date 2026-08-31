import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAppContext } from "../context/AppContext";
import { removeCurrentToken, syncTokenIfGranted } from "../firebase/tokenSync";

export default function ProfileMenu() {
    const { isAuthenticated, setIsAuthenticated, setUserData } = useAppContext();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errorMessage, setErrorMessage] = useState(null);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post("/auth/login", formData);
            setUserData(response.data.user);
            setErrorMessage(null);
            setIsAuthenticated(true);

            // Promote an already-granted, anonymously-registered FCM token
            // to this account so personal notifications can reach it too.
            syncTokenIfGranted();

            const cart = JSON.parse(localStorage.getItem("cart")) || [];

            if (cart.length > 0) {
                await api.post("/cart-sync", { items: cart });
                localStorage.removeItem("cart");
            }

            setOpen(false);
            navigate("/dashboard");
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Something went wrong. Please try again.");
        }
    };

    const handleLogout = async () => {
        try {
            await removeCurrentToken();
            await api.post("/auth/logout");
            setIsAuthenticated(false);
            setOpen(false);
            navigate("/");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div ref={menuRef}>
            <button onClick={() => setOpen((prev) => !prev)} aria-label="Account">
                <i className="fi fi-rr-user text-2xl text-[#104185] hover:cursor-pointer"></i>
            </button>

            {open && (
                <div className="absolute right-0 top-10 z-50 w-80 max-w-[90vw] rounded-lg border border-slate-200 bg-white shadow-xl">
                    {isAuthenticated ? (
                        <>
                            <div className="border-b border-slate-100 px-4 py-3">
                                <p className="font-semibold text-[#132A36]">My Account</p>
                            </div>
                            <div className="flex flex-col gap-1 p-2">
                                <Link
                                    to="/dashboard"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[#132A36] hover:bg-slate-50"
                                >
                                    <i className="fi fi-rr-settings"></i>
                                    Dashboard
                                </Link>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#132A36] hover:bg-slate-50"
                                >
                                    <i className="fi fi-rr-settings"></i>
                                    Profile Settings
                                </button>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#132A36] hover:bg-slate-50"
                                >
                                    <i className="fi fi-rr-leave"></i>
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="p-4">
                            <p className="font-semibold text-[#132A36]">Login</p>
                            <p className="mt-1 text-xs text-slate-500">Enter credentials to access your account</p>

                            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-[#132A36]">Email</label>
                                    <input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email"
                                        placeholder="eg. johndoe@gmail.com"
                                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-[#132A36]">Password</label>
                                    <input
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        type="password"
                                        placeholder="********"
                                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <button type="submit" className="mt-1 rounded-lg bg-[#132A36] py-2 text-sm font-semibold text-white">
                                    LOG IN
                                </button>
                            </form>

                            {errorMessage && (
                                <div className="mt-3 whitespace-pre-line rounded-lg border bg-red-600 px-3 py-2 text-xs font-semibold text-white">
                                    {errorMessage}
                                </div>
                            )}

                            <p className="mt-4 text-center text-xs text-slate-500">
                                Doesn't have an account?{" "}
                                <Link onClick={() => setOpen(false)} to="/accounts/register" className="font-semibold text-[#104185]">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
