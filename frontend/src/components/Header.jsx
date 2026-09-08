import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useLocation } from "react-router-dom";
import NotificationMenu from "./NotificationMenu";
import ProfileMenu from "./ProfileMenu";
import api from "../api/axios";

export default function Header() {

    const { menuOpen, setMenuOpen, isAuthenticated, category, cartCount } = useAppContext();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [ searchValue, setSearchValue ] = useState(searchParams.get("search") || "")
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const desktopSearchRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const closeSuggestions = (event) => {
            const insideDesktop = desktopSearchRef.current?.contains(event.target);
            const insideMobile = mobileSearchRef.current?.contains(event.target);
            if (!insideDesktop && !insideMobile) setSuggestions([]);
        };
        const closeOnEscape = (event) => { if (event.key === "Escape") setSuggestions([]); };
        document.addEventListener("mousedown", closeSuggestions);
        document.addEventListener("keydown", closeOnEscape);
        return () => { document.removeEventListener("mousedown", closeSuggestions); document.removeEventListener("keydown", closeOnEscape); };
    }, []);

    useEffect(() => {
        const query = searchValue.trim();
        if (query.length < 2) { setSuggestions([]); return undefined; }
        setSuggestionsLoading(true);
        const timer = setTimeout(async () => {
            try { const response = await api.get("/auth/get-products", { params: { search: query, limit: 5, page: 1 } }); setSuggestions(response.data.products || []); }
            catch { setSuggestions([]); }
            finally { setSuggestionsLoading(false); }
        }, 350);
        return () => clearTimeout(timer);
    }, [searchValue]);

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

    const selectSuggestion = (product) => {
        setSuggestions([]);
        setSearchValue("");
        navigate(`/product/${product.slug}`);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (location.pathname !== "/products" || !searchValue.trim()) {
                return;
            }
            handleSearch();
            }, 300)
        return () => {
            clearTimeout(timer)
        }
    }, [searchValue, location.pathname])

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
                    <div ref={desktopSearchRef} className="relative hidden md:flex flex-1 max-w-xl mx-10">
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
                        {suggestions.length > 0 || suggestionsLoading || (searchValue.trim().length >= 2) ? <SuggestionList suggestions={suggestions} loading={suggestionsLoading} onSelect={selectSuggestion} /> : null}
                    </div>

                    <div className="flex gap-3 items-center relative">
                        {isAuthenticated && <NotificationMenu />}
                        <ProfileMenu />
                        <Link to="/cart" aria-label={`View shopping cart, ${cartCount} items`} className="relative">
                            <i className="fi fi-rr-shopping-cart text-2xl text-[#104185] hover:cursor-pointer"></i>
                            {cartCount > 0 && <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#104185] px-1 text-[11px] font-bold leading-none text-white">{cartCount > 99 ? "99+" : cartCount}</span>}
                        </Link>
                    </div>
                </div>

                {/* Mobile Search */}
                <div ref={mobileSearchRef} className="relative md:hidden px-4 pb-3">
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
                    {suggestions.length > 0 || suggestionsLoading || (searchValue.trim().length >= 2) ? <SuggestionList suggestions={suggestions} loading={suggestionsLoading} onSelect={selectSuggestion} /> : null}
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
                        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full text-3xl leading-none text-[#132A36] hover:bg-slate-100 hover:cursor-pointer"
                    >
                        <span aria-hidden="true">×</span>
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

function SuggestionList({ suggestions, loading, onSelect }) {
    return <div className="absolute left-4 right-4 top-full z-50 max-h-80 overflow-y-auto rounded-b-xl border border-slate-200 bg-white p-2 shadow-xl md:left-0 md:right-0">
        {loading ? <p className="px-3 py-4 text-sm text-slate-500">Searching...</p> : suggestions.length ? suggestions.map((product) => <button type="button" key={product._id} onClick={() => onSelect(product)} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-slate-50"><img src={product.imageUrl} alt="" className="h-10 w-10 rounded object-cover" /><span className="min-w-0 truncate text-sm font-semibold text-[#132A36]">{product.name}</span></button>) : <p className="px-3 py-4 text-sm text-slate-500">No products found</p>}
    </div>;
}
