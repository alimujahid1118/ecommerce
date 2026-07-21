import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAppContext } from "../context/AppContext";

export default function Header() {

    const { menuOpen, setMenuOpen, profileOpen, setProfileOpen, isAuthenticated, setIsAuthenticated, setUserData } = useAppContext();
    const [ formData, setFormData ] = useState({
        'email' : '',
        'password' : ''
    })
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const isDesktop = window.innerWidth >= 768; // md breakpoint

        if (menuOpen && !isDesktop) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [menuOpen]);

    useEffect(() => {
        const isProfile = window.innerWidth >= 768; // md breakpoint

        if (profileOpen && !isProfile) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [profileOpen]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name] : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post("/auth/login", formData);
            localStorage.setItem("accessToken", response.data.accessToken)
            const user = response.data.user
            setUserData(user)
            setSuccessMessage(response.data.message)
            setErrorMessage(null)
            setIsAuthenticated(true)
            setProfileOpen(false)
            navigate('/dashboard')
            
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Something went wrong. Please try again."
            );
            setSuccessMessage(null)
        }
    }

    const handleLogout = async () => {
        try {
            const response = await api.post("/auth/logout");
            localStorage.removeItem("accessToken")
            setIsAuthenticated(false)
            setProfileOpen(false)
            navigate('/')
        } catch (err) {
            console.log(err)
        }
    }

    return(
        <>
            <div className="flex flex-row w-full bg-[#132A36] px-6 py-1 md:py-3 text-white justify-between">
                <div className="flex flex-row gap-3">
                    <i className="fi fi-brands-facebook"></i>
                    <i className="fi fi-brands-instagram"></i>
                    <i className="fi fi-brands-youtube"></i>
                </div>
                {/* Mobile */}
                <div className="flex flex-row gap-2 md:hidden">
                    <i className="fi fi-rr-phone-flip"></i>
                    <p className="text-sm">+92 325 8706115</p>
                </div>
                {/* Desktop */}
                <div className="md:flex md:flex-row md:gap-6 hidden">
                    <div className="md:flex md:flex-row md:gap-2">
                        <i className="fi fi-rr-marker"></i>
                        <p className="text-sm">AIT Lahore Pakistan</p>
                    </div>
                    <div className="md:flex md:flex-row md:gap-2">
                        <i className="fi fi-rr-phone-flip"></i>
                        <p className="text-sm">+92 325 8706115</p>
                    </div>
                    <div className="md:flex md:flex-row md:gap-2">
                        <i className="fi fi-rr-envelope"></i>
                        <p className="text-sm">alimujahid1118@gmail.com</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-row items-center justify-between px-6 sticky top-0 z-40 bg-white">
                <div className="md:mt-2">
                    <i onClick={() => setMenuOpen(true)} className="fi fi-rr-menu-burger text-3xl text-[#104185] hover:cursor-pointer"></i>
                </div>
                <Link to='/'>
                    <img src="/web-logo.png" alt="E-Store website logo" className="w-36 h-24" />
                </Link>

                {/* Search Bar - Desktop */}
                <div className="md:flex md:flex-row mt-2 md:items-center md:justify-center hidden">
                    <input className="text-lg border-[1px] border-[#90acd3] py-2 pl-4 pr-52 rounded-l-md" type="text" placeholder="Search for products.." />
                    <button className="bg-[#104185] border-[1px] border-slate-500 py-[10px] px-4 text-white rounded-r-md">
                        <i className="fi fi-rr-search"></i>
                    </button>
                </div>

                <div className="flex flex-row gap-2 md:mt-2">
                    <i onClick={() => setProfileOpen(true)} className="fi fi-rr-user text-2xl text-[#104185] hover:cursor-pointer"></i>
                    <i className="fi fi-rr-shopping-cart text-2xl text-[#104185] hover:cursor-pointer"></i>
                </div>
            </div>
            
            {/* Menu */}
            {menuOpen && (
                <div className="fixed inset-0 md:w-80 z-50 bg-white overflow-y-auto overscroll-none">
                    <div className="p-10 font-bold text-xl flex flex-row justify-between text-[#132A36]">
                        <p>All Categories</p>
                    </div>
                    <i onClick={() => setMenuOpen(false)} className="fi fi-rr-cross-small text-4xl fixed top-0 right-0 md:left-60 px-4 py-4 text-[#132A36] hover:cursor-pointer"></i>
                    <div className="flex flex-col px-10 gap-4 text-lg font-semibold">
                        <div className="py-4 border-b-[1px] border-slate-300 text-[#104185]">
                            <p>Cameras</p>
                        </div>
                        <div className="py-4 border-b-[1px] border-slate-300 text-[#104185]">
                            <p>Keyboard</p>
                        </div>
                        <div className="py-4 border-b-[1px] border-slate-300 text-[#104185]">
                            <p>Headphones</p>
                        </div>
                        <div className="py-4 border-b-[1px] border-slate-300 text-[#104185]">
                            <p>Phone</p>
                        </div>
                        <div className="py-4 border-b-[1px] border-slate-300 text-[#104185]">
                            <p>Smart Watches</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile / Login */}
            {
                profileOpen && (
                    <>
                        {
                            !isAuthenticated ? (
                                <div className="bg-white fixed inset-y-0 right-0 w-96 z-50 overflow-y-auto overscroll-none">
                                    <div className="flex flex-col px-10 pb-10 pt-6">
                                        <div className="text-[#132A36] flex flex-row gap-2">
                                            <i onClick={() => setProfileOpen(false)} className="fi fi-rr-cross-small text-4xl md:left-60 text-[#132A36] hover:cursor-pointer"></i>
                                        </div>
                                        <div className="flex flex-col gap-6 pl-6 py-10 text-[#132A36] items-center">
                                            <h1 className="text-3xl font-semibold">LOGIN</h1>
                                            <p className="text-sm">Enter credentials to access your account</p>
                                            <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full md:max-w-[500px]">
                                                <div className="flex flex-col gap-4">
                                                    <p className="font-semibold">Email</p>
                                                    <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="eg. johndoe@gmail.com" className="border-[1px] border-slate-300 px-4 py-2 rounded-lg"/>
                                                </div>
                                                <div className="flex flex-col gap-4">
                                                    <p className="font-semibold">Password</p>
                                                    <input name="password" value={formData.password} onChange={handleChange} type="password" placeholder="********" className="border-[1px] border-slate-300 px-4 py-2 rounded-lg"/>
                                                </div>
                                                <button type="submit" className="bg-[#132A36] text-white font-semibold mt-5 py-2 rounded-lg">LOG IN</button>
                                            </form>

                                            {/* Response Messages */}
                                            <div className="flex flex-col items-center pb-4">
                                                {
                                                    errorMessage && (
                                                        <div className="text-white whitespace-pre-line text-start font-semibold bg-red-600 flex flex-col gap-2 px-2 w-full md:max-w-[500px] py-2 border-[1px] rounded-lg">
                                                            {errorMessage}
                                                        </div>
                                                    )
                                                }
                                            </div>

                                            <p className="text-md">
                                                Doesn't have an account?
                                            </p>
                                            <Link onClick={() => setProfileOpen(false)} to='/accounts/register' className="bg-white border-[1px] border-[#132A36] w-full md:max-w-[500px] text-[#132A36] font-semibold py-2 rounded-lg text-center">
                                                CREATE ACCOUNT
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="fixed top-0 z-50 md:w-60 md:top-28 md:border-[1px] md:border-slate-400 md:right-12 md:rounded-lg w-full bg-slate-100 shadow-xl">
                                    <div className="flex flex-col px-10 pt-2">
                                        <div className="text-[#132A36] flex flex-row gap-2">
                                            <i onClick={() => setProfileOpen(false)} className="fi fi-rr-cross-small text-4xl text-[#132A36] hover:cursor-pointer"></i>
                                        </div>
                                        <div className="flex flex-col items-center py-6">
                                            <div className="flex flex-col gap-4">
                                                <div className="flex flex-row gap-2 items-start">
                                                    <i className="fi fi-rr-settings mt-[2px]"></i>
                                                    <Link to='/dashboard' onClick={() => setProfileOpen(false)}>Dashboard</Link>
                                                </div>
                                                <p className="bg-slate-200 w-full py-[1px]"></p>
                                                <div className="flex flex-row gap-2 items-start">
                                                    <i className="fi fi-rr-settings mt-[2px]"></i>
                                                    <p>Profile Settings</p>
                                                </div>
                                                <p className="bg-slate-200 w-full py-[1px]"></p>
                                                <div className="flex flex-row gap-2 items-start">
                                                    <i className="fi fi-rr-leave mt-[2px]"></i>
                                                    <button type="button" onClick={handleLogout}>Logout</button>
                                                </div>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </div>
                                
                            )
                        }
                    </>
                )
            }
            
        </>
    )
}