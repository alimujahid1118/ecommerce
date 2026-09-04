import { useEffect, useState } from "react";
import discountBanner from "../assets/discount-banner.webp";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import api from "../api/axios";

const features = [
    {
        icon: "fi fi-rr-shipping-fast",
        title: "Express Delivery",
        description: "Fast nationwide shipping",
    },
    {
        icon: "fi fi-rr-feedback-alt",
        title: "Happy Customers",
        description: "99% satisfaction rate",
    },
    {
        icon: "fi fi-rr-restock",
        title: "Easy Returns",
        description: "Hassle-free support",
    },
    {
        icon: "fi fi-rr-chart-mixed-up-circle-dollar",
        title: "Value First",
        description: "Smart prices every day",
    },
];

const heroStats = [
    { label: "New arrivals", value: "250+" },
    { label: "Fast shipping", value: "24h" },
    { label: "Ratings", value: "4.9/5" },
];

export default function Homepage() {
    const { category } = useAppContext();
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get("/auth/get-products", {
                    params: {
                        limit: 4,
                    },
                });

                setProducts(response.data.products);
            } catch (error) {
                console.log(error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="bg-slate-50 text-slate-800">
            <section className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-r from-[#112b3a] via-[#173d57] to-[#0d4a7f] shadow-[0_24px_60px_rgba(19,42,54,0.18)]">
                    <div className="grid items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-12">
                        <div className="text-white">
                            <div className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-100">
                                New season arrivals
                            </div>
                            <h1 className="max-w-lg text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                                Smart essentials for everyday life.
                            </h1>
                            <p className="mt-4 max-w-xl text-sm text-slate-200 sm:text-base">
                                Discover premium tech, home upgrades, and everyday essentials built for comfort, style, and efficiency.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    to="/products"
                                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#132A36] transition hover:bg-slate-100"
                                >
                                    Shop now
                                </Link>
                                <Link
                                    to="/products?category=all"
                                    className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                                >
                                    Browse categories
                                </Link>
                            </div>

                            <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
                                {heroStats.map((stat) => (
                                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm">
                                        <div className="text-xl font-bold text-white">{stat.value}</div>
                                        <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-slate-200">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -left-8 top-8 h-20 w-20 rounded-full bg-[#7dd3fc]/30 blur-2xl"></div>
                            <div className="absolute -right-6 bottom-6 h-24 w-24 rounded-full bg-[#dbeafe]/20 blur-2xl"></div>
                            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
                                <img
                                    src={discountBanner}
                                    alt="discount-banner"
                                    className="h-[360px] w-full rounded-[1.15rem] object-cover sm:h-[420px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#104185]">Shop by category</p>
                        <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#132A36] sm:text-3xl">
                            Curated collections for every lifestyle
                        </h2>
                    </div>
                    <Link
                        to="/products"
                        className="hidden text-sm font-semibold text-[#104185] transition hover:text-[#132A36] sm:inline-flex"
                    >
                        View all products
                    </Link>
                </div>

                <div className="scrollbar-hide overflow-x-auto pb-2">
                    <div className="flex min-w-max gap-4">
                        {category?.length === 0 ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex w-36 flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:w-40">
                                    <div className="h-24 w-full rounded-xl bg-slate-200 animate-pulse" />
                                    <div className="h-3 w-16 rounded bg-slate-200 animate-pulse" />
                                </div>
                            ))
                        ) : (
                            category?.map((eachCategory) => (
                                <Link
                                    to={`/products?category=${eachCategory.slug}`}
                                    key={eachCategory._id}
                                    className="group flex w-36 flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#104185]/30 hover:shadow-md sm:w-40"
                                >
                                    <div className="overflow-hidden rounded-xl bg-slate-100">
                                        <img
                                            src={eachCategory.imageUrl}
                                            alt={eachCategory.name}
                                            className="h-24 w-full object-cover transition duration-200 group-hover:scale-105 sm:h-28"
                                        />
                                    </div>
                                    <p className="text-sm font-semibold text-[#132A36]">{eachCategory.name}</p>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {features.map((item) => (
                        <div
                            key={item.title}
                            className="flex min-h-[170px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf3ff] text-2xl text-[#104185]">
                                <i className={item.icon}></i>
                            </div>
                            <p className="text-base font-bold text-[#132A36]">{item.title}</p>
                            <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#104185]">Featured</p>
                        <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#132A36] sm:text-3xl">
                            Best sellers this week
                        </h2>
                    </div>

                    <Link
                        to="/products"
                        className="inline-flex items-center justify-center rounded-full border border-[#132A36] px-4 py-2 text-sm font-semibold text-[#132A36] transition hover:bg-[#132A36] hover:text-white"
                    >
                        All Products
                    </Link>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {products?.length === 0
                        ? Array.from({ length: 4 }).map((_, i) => (
                              <div
                                  key={i}
                                  className="flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse"
                              >
                                  <div className="h-52 w-full rounded-xl bg-slate-200" />
                                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                                  <div className="h-4 w-1/4 rounded bg-slate-200" />
                                  <div className="mt-auto h-11 rounded-xl bg-slate-200" />
                              </div>
                          ))
                        : products?.map((product) => (
                              <div
                                  key={product._id}
                                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#104185]/30 hover:shadow-lg"
                              >
                                  <div className="overflow-hidden bg-slate-100">
                                      <img
                                          src={product.imageUrl}
                                          alt={product.name}
                                          className="h-52 w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                                      />
                                  </div>

                                  <div className="flex flex-1 flex-col p-4">
                                      <p className="min-h-[48px] text-base font-bold leading-6 text-[#132A36]">
                                          {product.name.length > 30 ? `${product.name.slice(0, 30)}...` : product.name}
                                      </p>

                                      <div className="mt-4 flex items-center justify-between gap-3">
                                          <p className="text-lg font-bold text-[#104185]">
                                              {Number(product.price || 0).toLocaleString("en-US", {
                                                  style: "currency",
                                                  currency: "USD",
                                              })}
                                          </p>
                                          <span className="rounded-full bg-[#edf4ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#104185]">
                                              In stock
                                          </span>
                                      </div>

                                      <Link
                                          to={`/product/${product.slug}`}
                                          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#132A36] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f2330]"
                                      >
                                          View details
                                      </Link>
                                  </div>
                              </div>
                          ))}
                </div>
            </section>
        </div>
    );
}