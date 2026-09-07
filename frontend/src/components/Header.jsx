import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useLocation } from "react-router-dom";
import NotificationMenu from "./NotificationMenu";
import ProfileMenu from "./ProfileMenu";

export default function Header() {

    const { menuOpen, setMenuOpen, isAuthenticated, category } = useAppContext();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [ searchValue, setSearchValue ] = useState(searchParams.get("search") || "")
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

    const handleSearch = async () => {
        try {
            if (searchValue) {
                navigate(`/products?search=${searchValue}`);
            } else {
                navigate('/products')
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (location.pathname !== "/products") {
                return;
            }
            handleSearch();
            }, 300)
        return () => {
            clearTimeout(timer)
        }
    }, [searchValue])

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
            <div className="sticky top-0 z-40 bg-white shadow-sm">
                {/* Top Row */}
                <div className="flex items-center justify-between px-6">
                    <div>
                        <button
                            type="button"
                            aria-label="Open categories menu"
                            onClick={() => setMenuOpen(true)}
                            className="text-3xl text-[#104185] hover:cursor-pointer"
                        >
                            <i className="fi fi-rr-menu-burger" aria-hidden="true"></i>
                        </button>
                    </div>

                    <Link to="/">
                        <img
                            src="/web-logo-header-144.webp"
                            srcSet="/web-logo-header-144.webp 1x, /web-logo-header-288.webp 2x"
                            sizes="144px"
                            alt="E-Store website logo"
                            width="144"
                            height="102"
                            decoding="async"
                            className="h-auto w-36"
                        />
                    </Link>

                    {/* Desktop Search */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-10">
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search for products..."
                            className="w-full border border-[#90acd3] py-2 px-4 rounded-l-md"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                        />
                        <button type="button" aria-label="Search products" onClick={handleSearch} className="bg-[#104185] border border-[#104185] px-4 text-white rounded-r-md">
                            <i className="fi fi-rr-search"></i>
                        </button>
                    </div>

                    <div className="flex gap-3 items-center relative">
                        {isAuthenticated && <NotificationMenu />}
                        <ProfileMenu />
                        <Link to="/cart" aria-label="View shopping cart">
                            <i className="fi fi-rr-shopping-cart text-2xl text-[#104185] hover:cursor-pointer"></i>
                        </Link>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden px-4 pb-3">
                    <div className="flex">
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                            placeholder="Search for products..."
                            className="flex-1 border border-[#90acd3] py-2 px-3 rounded-l-md"
                        />
                        <button type="button" aria-label="Search products" onClick={handleSearch} className="bg-[#104185] border border-[#104185] px-4 text-white rounded-r-md">
                            <i className="fi fi-rr-search"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Menu */}
            {menuOpen && (
                <div className="fixed inset-0 md:w-80 z-50 bg-white overflow-y-auto overscroll-none">
                    <div className="p-10 font-bold text-xl flex flex-row justify-between text-[#132A36]">
                        <p>All Categories</p>
                    </div>
                    <button
                        type="button"
                        aria-label="Close categories menu"
                        onClick={() => setMenuOpen(false)}
                        className="text-4xl fixed top-0 right-0 md:left-60 px-4 py-4 text-[#132A36] hover:cursor-pointer"
                    >
                        <i className="fi fi-rr-cross-small" aria-hidden="true"></i>
                    </button>
                    <div className="flex flex-col px-10 gap-4 text-lg font-semibold">
                        {
                            category?.map((eachCategory)=> (
                                <Link onClick={() => setMenuOpen(false)} to={`/products?category=${eachCategory.slug}`} key={eachCategory._id} className="py-4 border-b-[1px] border-slate-300 text-[#104185]">
                                    <p>{eachCategory.name}</p>
                                </Link>
                            ))
                        }
                    </div>
                </div>
            )}
        </>
    )
}
