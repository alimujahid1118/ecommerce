import { useState } from "react";
import { useAppContext } from "../context/AppContext"
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";

export default function AllProducts() {

    const { getProducts, category } = useAppContext();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const paramsCategory = searchParams.get("category")
    const paramsSort = searchParams.get("sort")
    const [filter, setFilter] = useState({
        category: paramsCategory || "",
        sort: paramsSort || "",
    });
    
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchFilteredProducts = async () => {
            if (!paramsCategory && !paramsSort) {
                setProducts(getProducts);
                return;
            }

            try {
                const response = await api.get("/auth/get-products", {
                    params: {
                        category: paramsCategory,
                        sort: paramsSort,
                    },
                });
                setProducts(response.data.products);
            } catch (error) {
                console.log(error);
            }
        };

        fetchFilteredProducts();
    }, [paramsCategory, paramsSort, getProducts]);

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
        if (filter.category && filter.sort) {
            return `/products?category=${filter.category}&sort=${filter.sort}`;
        }

        if (filter.category) {
            return `/products?category=${filter.category}`;
        }

        if (filter.sort) {
            return `/products?sort=${filter.sort}`;
        }

        if (!filter.category && !filter.sort) {
            return "/products";
        }
    })();

    return (
        <>
        <h1 className="text-center font-bold text-2xl pt-2 text-[#132A36]">BROWSE PRODUCTS</h1>
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
            <button onClick={() => setMenuOpen(true)} className="flex flex-row justify-end pr-8 gap-2 md:hidden">
                <p className="text-[#132A36] font-semibold">Filters</p>
                <i className="fi fi-rr-filter mt-[2px] text-[#104185]"></i>
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
                                <Link onClick={() => setFilter({sort: '', category: ''})} className="font-semibold text-[#132A36] underline">Reset filter</Link>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Products */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:py-14 px-2">
                {products?.map((product) => (
                    <div
                        key={product._id}
                        className="flex flex-col gap-2 items-center p-4 border shadow-lg rounded-lg h-full"
                    >
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-40 h-40 object-contain"
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
        </>
    )
}