import { useState } from "react";
import { useAppContext } from "../context/AppContext"
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";

const productImageList = (product) => product?.imageUrls?.length ? product.imageUrls : (product?.imageUrl ? [product.imageUrl] : []);

export default function AllProducts() {

    const { category, totalPages, setTotalPages, isAuthenticated, showToast, refreshCartCount } = useAppContext();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchParams] = useSearchParams();

    const paramsCategory = searchParams.get("category")
    const paramsSort = searchParams.get("sort")
    const paramsName = searchParams.get("search")
    const paramsPage = Number(searchParams.get("page")) || 1;

    const [filter, setFilter] = useState({
        category: paramsCategory || "",
        sort: paramsSort || ""
    });
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState(null);

    useEffect(() => {
        setFilter({
            category: paramsCategory || "",
            sort: paramsSort || "",
        });
    }, [paramsCategory, paramsSort]);

    useEffect(() => {
        setLoading(true);
        const fetchFilteredProducts = async () => {

            try {
                const response = await api.get("/auth/get-products", {
                    params: {
                        category: paramsCategory,
                        sort: paramsSort,
                        search: paramsName,
                        page: paramsPage,
                        limit: 3
                    },
                });

                setProducts(response.data.products);
                setTotalPages(response.data.totalPages)
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredProducts();
    }, [paramsCategory, paramsSort, paramsName, paramsPage]);

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

    const filterUrl = (() => {
        const params = new URLSearchParams();

        if (filter.category) {
            params.set("category", filter.category);
        }

        if (filter.sort) {
            params.set("sort", filter.sort);
        }

        // Preserve the search term
        if (paramsName) {
            params.set("search", paramsName);
        }

        return `/products${params.toString() ? `?${params.toString()}` : ""}`;
    })();

    const pageNumbers = Array.from(
        { length: totalPages || 0 },
        (_, index) => index + 1
    );

    const prevParams = new URLSearchParams(searchParams);
    prevParams.set("page", Math.max(paramsPage - 1, 1));

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", Math.min(paramsPage + 1, totalPages));

    const handleSubmit = async (product) => {
        if (product.stock < 1) return showToast("This product is out of stock.", "error");
        setAddingId(product._id);

        try {
            if (isAuthenticated) {
            const item = {
                productId: product._id,
                quantity: 1
            }
                const response = await api.post("/create-cart", item);
                showToast(`${response.data?.quantity > 1 ? "Product quantity updated in cart" : "Product added to cart"}: ${product.name}`);
                await refreshCartCount();
                return;
            }

        const item = {
            productId: product._id,
            name: product.name,
            image: product.imageUrl,
            price: product.price,
            category: product.category.slug,
            quantity: 1,
        };

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push(item);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
            showToast(`${existingItem ? "Product quantity updated in cart" : "Product added to cart"}: ${product.name}`);
            await refreshCartCount();
        } catch (error) {
            showToast(error.response?.data?.message || "Unable to add product to cart.", "error");
        } finally { setAddingId(null); }
    };

    return (
        <>
        <h1 className="text-center font-bold text-2xl pt-6 text-[#132A36]">BROWSE PRODUCTS</h1>
        <div className="flex flex-col bg-white md:flex-row items-start gap-6">
            {/* Desktop */}
                {/* Filters */}
                <aside className="hidden md:block md:w-72 shrink-0 px-4 py-6">
                    <div className="sticky top-24 flex flex-col gap-7 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#104185]">Refine results</p><h2 className="mt-1 text-2xl font-black text-[#132A36]">Filters</h2></div><span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">{[filter.category, filter.sort].filter(Boolean).length} active</span></div>

                        {/* Category */}
                        <div className="flex flex-col gap-3">
                            <p className="text-[#132A36] font-semibold">
                                By Category
                            </p>

                            <select
                                value={filter.category}
                                onChange={(e) =>
                                    setFilter({
                                        ...filter,
                                        category: e.target.value,
                                    })
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-[#104185] outline-none transition focus:border-[#104185] focus:ring-2 focus:ring-[#104185]/15"
                            >
                                <option value="" disabled>
                                    All categories
                                </option>

                                {category?.map((eachCategory) => (
                                    <option
                                        key={eachCategory._id}
                                        value={eachCategory.slug}
                                    >
                                        {eachCategory.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price */}
                        <div className="flex flex-col gap-3">
                            <p className="text-[#132A36] font-semibold">
                                By Price
                            </p>

                            <button
                                onClick={() =>
                                    setFilter((prev) => ({
                                        ...prev,
                                        sort: "asc",
                                    }))
                                }
                                className={`flex items-center justify-center gap-2 rounded-xl border py-3 transition focus:outline-none focus:ring-2 focus:ring-[#104185]/20 ${
                                    filter.sort === "asc"
                                        ? "bg-[#132A36] text-white"
                                        : "bg-white border-slate-300 text-[#132A36]"
                                }`}
                            >
                                <i className="fi fi-rr-sort-amount-down mt-[2px]"></i>
                                <span className="font-semibold">
                                    Price: low to high
                                </span>
                            </button>

                            <button
                                onClick={() =>
                                    setFilter((prev) => ({
                                        ...prev,
                                        sort: "desc",
                                    }))
                                }
                                className={`flex items-center justify-center gap-2 rounded-xl border py-3 transition focus:outline-none focus:ring-2 focus:ring-[#104185]/20 ${
                                    filter.sort === "desc"
                                        ? "bg-[#132A36] text-white"
                                        : "bg-white border-slate-300 text-[#132A36]"
                                }`}
                            >
                                <i className="fi fi-rr-sort-amount-up mt-[2px]"></i>
                                <span className="font-semibold">
                                    Price: high to low
                                </span>
                            </button>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-3">
                            <Link
                                to={filterUrl}
                                className="text-center rounded-xl bg-[#132A36] py-3 font-semibold text-white transition hover:bg-[#104185]"
                            >
                                Apply Filter
                            </Link>

                            <Link
                                to="/products"
                                onClick={() =>
                                    setFilter({
                                        category: "",
                                        sort: "",
                                    })
                                }
                                className="text-center rounded-xl border border-[#132A36] py-3 font-semibold text-[#132A36] transition hover:bg-white"
                            >
                                Reset Filter
                            </Link>
                        </div>

                    </div>
                </aside>

            {/* Mobile */}
            <button type="button" aria-label="Open product filters" onClick={() => setMenuOpen(true)} className="flex w-full justify-end pr-8 pt-4 gap-2 md:hidden">
                <p className="text-[#132A36] font-semibold text-lg">Filters</p>
                <i className="fi fi-rr-filter mt-[3px] text-[#104185]"></i>
            </button>

            {/* Filters */}
            {
                menuOpen && (
                    <div className="fixed inset-0 z-50 bg-[#132A36]/60 p-3 backdrop-blur-[2px]">
                        <div className="ml-auto flex h-full w-full max-w-sm flex-col gap-7 overflow-y-auto rounded-2xl bg-slate-50 p-5 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#104185]">Refine results</p><h2 className="mt-1 text-2xl font-black text-[#132A36]">Filters</h2></div><button type="button" aria-label="Close product filters" onClick={() => setMenuOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl text-[#132A36] transition hover:border-[#104185]">×</button></div>
                        <div className="flex flex-col gap-12">
                            <div className="flex flex-col gap-4">
                                <p className="text-[#132A36] font-semibold">By Category</p>
                                <select name="category" value={filter.category} onChange={(e) => setFilter({...filter, category: e.target.value})} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-[#104185] outline-none focus:border-[#104185] focus:ring-2 focus:ring-[#104185]/15">
                                    <option value="" disabled>Select Category..</option>
                                    {
                                        category?.map((eachCategory) => (
                                            <option key={eachCategory._id} value={eachCategory.slug}>{eachCategory.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-[#132A36] font-semibold">By Price</p>
                                    <button onClick={() => setFilter(prev => ({ ...prev, sort: "asc" }))} className={`flex flex-row gap-2 justify-center rounded-xl border py-3 transition ${ filter.sort === "asc" ? "text-white bg-[#132A36]" : "bg-white border-slate-300 text-[#132A36]"}`}>
                                        <i className="fi fi-rr-sort-amount-down mt-[2px]"></i>
                                        <p className="font-semibold">Price: low to high</p>
                                    </button>
                                    <button onClick={() => setFilter(prev => ({ ...prev, sort: "desc" }))} className={`flex flex-row gap-2 justify-center rounded-xl border py-3 transition ${ filter.sort === "desc" ? "text-white bg-[#132A36]" : "bg-white border-slate-300 text-[#132A36]"}`}>
                                        <i className="fi fi-rr-sort-amount-up mt-[2px]"></i>
                                        <p className="font-semibold">Price: high to low</p>
                                    </button>
                                </div>
                            </div>
                            <div className="mt-auto flex flex-col gap-3"><Link to={filterUrl} onClick={() => setMenuOpen(false)} className="rounded-xl bg-[#132A36] py-3 text-center font-semibold text-white">Apply filters</Link>
                                <Link
                                    to="/products"
                                    onClick={() => {
                                        setFilter({
                                            category: "",
                                            sort: "",
                                        });
                                        setMenuOpen(false);
                                    }}
                                    className="rounded-xl border border-[#132A36] py-3 text-center font-semibold text-[#132A36]"
                                >
                                    Reset Filter
                                </Link>
                            </div>
                        </div></div>
                    </div>
                )
            }

            {/* Products */}
                {loading ? (
                <div className="flex-1 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:py-8 px-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex flex-col gap-2 p-4 border shadow-lg rounded-lg animate-pulse"
                            >
                                {/* Image */}
                                <div className="w-60 h-48 bg-gray-200 rounded-lg mx-auto" />

                                {/* Product name */}
                                <div className="mt-3 h-5 w-48 bg-gray-200 rounded mx-auto" />

                                {/* Price */}
                                <div className="h-5 w-20 bg-gray-200 rounded mx-auto" />

                                {/* Buttons */}
                                <div className="mt-auto flex flex-col gap-2">
                                    <div className="h-10 w-full bg-gray-200 rounded-lg" />
                                    <div className="h-10 w-full bg-gray-200 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                ) : products.length === 0 ? (
                    <div className="w-full flex justify-center items-center pt-24 pb-36 md:flex-1 md:py-44">
                        <p className="text-xl text-[#132A36]">
                            No products found.
                        </p>
                    </div>
                ) : (
            <div className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:py-8 px-2">
                {products?.map((product) => (
                    <div
                        key={product._id}
                        className="flex flex-col gap-2 items-center p-4 border shadow-lg rounded-lg h-full"
                    >
                        <img src={productImageList(product)[0]} alt={product.name} className="h-48 w-60 rounded-lg object-cover" />

                        <p
                            className="mt-3 text-[#132A36] font-bold text-center w-full"
                        >
                            {product.name.length > 30
                            ? `${product.name.slice(0, 30)}..`
                            : product.name}
                        </p>
                        <div className="mt-auto w-full">
                            <p className="text-[#104185] text-md font-semibold text-center mb-2">
                                ${product.price}
                            </p>
                            
                            <div className="flex flex-col gap-2">
                                <Link to={`/product/${product.slug}`} className="flex w-full text-[#132A36] py-2 justify-center rounded-lg bg-white border-[1px] border-[#132A36]">
                                    View details
                                </Link>
                                <button disabled={addingId === product._id} onClick={() => handleSubmit(product)} className="w-full bg-[#132A36] border-[1px] py-2 rounded-lg text-white disabled:opacity-60">
                                    {addingId === product._id ? "Adding..." : "Add to Cart"}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 py-8">
                {paramsPage === 1 ? <span className="rounded-lg bg-gray-300 px-3 py-1 text-gray-500">Previous</span> : <Link to={`/products?${prevParams.toString()}`} className="rounded-lg bg-[#132A36] px-3 py-1 text-white">Previous</Link>}
                <div className="flex flex-wrap items-center gap-2">{pageNumbers.map((page) => { const params = new URLSearchParams(searchParams); params.set("page", page); return <Link to={`/products?${params.toString()}`} key={page} className={`flex h-8 w-8 items-center justify-center rounded-lg ${paramsPage === page ? "bg-[#132A36] text-white" : "border border-[#132A36] text-[#132A36]"}`}>{page}</Link>; })}</div>
                {paramsPage === totalPages ? <span className="rounded-lg bg-gray-300 px-4 py-1 text-gray-500">Next</span> : <Link to={`/products?${nextParams.toString()}`} className="rounded-lg bg-[#132A36] px-4 py-1 text-white">Next</Link>}
            </div>
            </div>
            )}
        </div>
        </>
    )
}