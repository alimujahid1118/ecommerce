import { useState } from "react";
import { useAppContext } from "../context/AppContext"
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";

export default function AllProducts() {

    const { category, totalPages, setTotalPages } = useAppContext();
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

    useEffect(() => {
        setFilter({
            category: paramsCategory || "",
            sort: paramsSort || "",
        });
    }, [paramsCategory, paramsSort]);

    useEffect(() => {
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

    return (
        <>
        <h1 className="text-center font-bold text-2xl pt-6 text-[#132A36]">BROWSE PRODUCTS</h1>
        <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Desktop */}
                {/* Filters */}
                <aside className="hidden md:block md:w-72 shrink-0 px-4 py-6">
                    <div className="sticky top-24 flex flex-col gap-8 border rounded-lg shadow-lg p-5 bg-white">

                        <h2 className="text-xl font-bold text-[#132A36]">
                            Filters
                        </h2>

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
                                className="px-4 py-2 border border-slate-300 rounded-lg text-[#104185]"
                            >
                                <option value="" disabled>
                                    Select Category..
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
                                className={`flex items-center justify-center gap-2 border rounded-lg py-2 ${
                                    filter.sort === "asc"
                                        ? "bg-[#132A36] text-white"
                                        : "bg-white border-slate-300 text-[#132A36]"
                                }`}
                            >
                                <i className="fi fi-rr-sort-amount-down mt-[2px]"></i>
                                <span className="font-semibold">
                                    Asc to desc
                                </span>
                            </button>

                            <button
                                onClick={() =>
                                    setFilter((prev) => ({
                                        ...prev,
                                        sort: "desc",
                                    }))
                                }
                                className={`flex items-center justify-center gap-2 border rounded-lg py-2 ${
                                    filter.sort === "desc"
                                        ? "bg-[#132A36] text-white"
                                        : "bg-white border-slate-300 text-[#132A36]"
                                }`}
                            >
                                <i className="fi fi-rr-sort-amount-up mt-[2px]"></i>
                                <span className="font-semibold">
                                    Desc to asc
                                </span>
                            </button>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-3">
                            <Link
                                to={filterUrl}
                                className="text-center bg-[#132A36] text-white py-2 rounded-lg font-semibold"
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
                                className="text-center border border-[#132A36] text-[#132A36] py-2 rounded-lg font-semibold"
                            >
                                Reset Filter
                            </Link>
                        </div>

                    </div>
                </aside>

            {/* Mobile */}
            <button onClick={() => setMenuOpen(true)} className="flex w-full justify-end pr-8 pt-4 gap-2 md:hidden">
                <p className="text-[#132A36] font-semibold text-lg">Filters</p>
                <i className="fi fi-rr-filter mt-[3px] text-[#104185]"></i>
            </button>

            {/* Filters */}
            {
                menuOpen && (
                    <div className="fixed top-0 z-50 w-full h-full bg-white">
                        <div>
                            <i onClick={() => setMenuOpen(false)} className="fi fi-rr-cross-small text-4xl fixed top-0 right-0 md:left-60 px-4 py-4 text-[#132A36] hover:cursor-pointer"></i>
                        </div>
                        <div className="flex flex-col gap-12 py-24 px-4">
                            <div className="flex flex-col gap-4">
                                <p className="text-[#132A36] font-semibold">By Category</p>
                                <select name="category" value={filter.category} onChange={(e) => setFilter({...filter, category: e.target.value})} className="px-4 w-full border-[1px] border-slate-300 py-2 rounded-lg text-[#104185]">
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
                                    <p className="text-[#132A36] font-semibold">By Price:</p>
                                    <button onClick={() => setFilter(prev => ({ ...prev, sort: "asc" }))} className={`flex flex-row gap-2 justify-center border-[1px] py-2 rounded-lg ${ filter.sort === "asc" ? "text-white bg-[#132A36]" : "bg-white border-slate-300 text-[#132A36]"}`}>
                                        <i className="fi fi-rr-sort-amount-down mt-[2px]"></i>
                                        <p className="font-semibold">Asc to desc</p>
                                    </button>
                                    <button onClick={() => setFilter(prev => ({ ...prev, sort: "desc" }))} className={`flex flex-row gap-2 justify-center border-[1px] py-2 rounded-lg ${ filter.sort === "desc" ? "text-white bg-[#132A36]" : "bg-white border-slate-300 text-[#132A36]"}`}>
                                        <i className="fi fi-rr-sort-amount-up mt-[2px]"></i>
                                        <p className="font-semibold">Desc to asc</p>
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-row gap-4 justify-center">
                                <Link to={filterUrl} onClick={() => setMenuOpen(false)} className="font-semibold text-[#132A36] underline">Apply filter</Link>
                                <Link
                                    to="/products"
                                    onClick={() => {
                                        setFilter({
                                            category: "",
                                            sort: "",
                                        });
                                        setMenuOpen(false);
                                    }}
                                    className="font-semibold text-[#132A36] underline"
                                >
                                    Reset Filter
                                </Link>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Products */}
            {products.length === 0 ? (
                <div className="w-full flex justify-center items-center pt-24 pb-36 md:flex-1 md:py-44">
                    <p className="text-xl text-[#132A36]">
                        No products found.
                    </p>
                </div>
            ) : (
            <div className="flex-1 w-full">
                <div className="flex justify-center items-center gap-4 py-6 md:pt-10 md:pb-6">
                    {paramsPage === 1 ? (
                        <span className="px-3 py-1 rounded-lg bg-gray-300 cursor-not-allowed">
                            Previous
                        </span>
                    ) : (
                        <Link
                            to={`/products?${prevParams.toString()}`}
                            className="px-3 py-1 rounded-lg bg-[#132A36] text-white"
                        >
                            Previous
                        </Link>
                    )}

                <div className="flex items-center gap-2">
                    {pageNumbers.map((page) => {
                        const params = new URLSearchParams(searchParams);
                        params.set("page", page);
                        return(
                        <Link
                            to={`/products?${params.toString()}`}
                            key={page}
                            className={`flex w-8 h-8 items-center justify-center rounded-lg ${
                                paramsPage === page
                                    ? "bg-[#132A36] text-white"
                                    : "border border-[#132A36] text-[#132A36]"
                            }`}
                        >
                            {page}
                        </Link>)
                })}
                </div>

                {paramsPage === totalPages ? (
                    <span className="px-4 py-1 rounded-lg bg-gray-300 cursor-not-allowed">
                        Next
                    </span>
                ) : (
                    <Link
                        to={`/products?${nextParams.toString()}`}
                        className="px-4 py-1 rounded-lg bg-[#132A36] text-white"
                    >
                        Next
                    </Link>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:py-8 px-2">
                {products?.map((product) => (
                    <div
                        key={product._id}
                        className="flex flex-col gap-2 items-center p-4 border shadow-lg rounded-lg h-full"
                    >
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-60 h-48 object-cover rounded-lg"
                        />

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
                                <button className="w-full bg-[#132A36] border-[1px] py-2 rounded-lg text-white">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            </div>
            )}
        </div>
        </>
    )
}