import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom"
import api from "../api/axios.js"
import { useAppContext } from "../context/AppContext"
import SEO from "../components/SEO";

export default function ProductDetails() {

    const { isAuthenticated } = useAppContext();
    const [ getProductBySlug, setGetProductBySlug] = useState(null);
    const [loading, setLoading] = useState(true);
    const { slug } = useParams();
    const productTitle = getProductBySlug
        ? `${getProductBySlug.name} | E Shop`
        : "Product Details | E Shop";
    const productDescription = getProductBySlug
        ? `Shop ${getProductBySlug.name} from E Shop for $${getProductBySlug.price}.`
        : "View product details, pricing, and availability at E Shop.";
    const structuredData = getProductBySlug
        ? {
            "@context": "https://schema.org",
            "@type": "Product",
            name: getProductBySlug.name,
            image: [getProductBySlug.imageUrl],
            category: getProductBySlug.category?.name,
            offers: {
                "@type": "Offer",
                priceCurrency: "USD",
                price: getProductBySlug.price,
                availability: getProductBySlug.stock > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                url: new URL(`/product/${slug}`, window.location.origin).href,
            },
        }
        : undefined;

    useEffect(() => {
        const getProduct = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/auth/get-product/${slug}`)
                setGetProductBySlug(response.data)
            } catch (error) {
                console.log(error)
            } finally {
            setLoading(false);
        }
        } 

        getProduct();
    }, [slug])

    const handleSubmit = async (getProductBySlug) => {

        if (isAuthenticated) {
            const item = {
                productId: getProductBySlug._id,
                quantity: 1
            }
            try {
                await api.post("/create-cart", item);
            } catch (error) {
                console.log(error)
            }
        }

        const item = {
            productId: getProductBySlug._id,
            name: getProductBySlug.name,
            image: getProductBySlug.imageUrl,
            price: getProductBySlug.price,
            category: getProductBySlug.category.slug,
            quantity: 1,
        };

        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        const existingItem = cart.find(
            (product) => product.productId === item.productId
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push(item);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
                <div className="mx-auto max-w-6xl space-y-10">
                    <div className="h-4 w-40 rounded bg-slate-200" />
                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="aspect-square rounded-3xl bg-slate-200" />
                        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
                            <div className="h-4 w-24 rounded bg-slate-200" />
                            <div className="h-12 w-4/5 rounded bg-slate-200" />
                            <div className="h-10 w-32 rounded bg-slate-200" />
                            <div className="grid grid-cols-2 gap-3"><div className="h-16 rounded bg-slate-200" /><div className="h-16 rounded bg-slate-200" /></div>
                            <div className="h-12 rounded bg-slate-200" />
                        </div>
                    </div>
                    <div className="h-56 rounded-3xl bg-slate-200" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
            <SEO
                title={productTitle}
                description={productDescription}
                canonicalPath={`/product/${slug}`}
                structuredData={structuredData}
            />
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                    <Link to="/products" className="transition hover:text-[#104185]">Products</Link>
                    <i className="fi fi-rr-angle-small-right text-xs" />
                    {getProductBySlug?.category?.slug && (
                        <Link to={`/products?category=${getProductBySlug.category.slug}`} className="transition hover:text-[#104185]">
                            {getProductBySlug.category.name}
                        </Link>
                    )}
                    <i className="fi fi-rr-angle-small-right text-xs" />
                    <span className="truncate text-slate-800">{getProductBySlug?.name}</span>
                </div>

                <section className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(19,42,54,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="flex min-h-[360px] items-center justify-center bg-[#f1f5f8] p-6 sm:min-h-[520px] sm:p-10">
                        <img src={getProductBySlug?.imageUrl} alt={getProductBySlug?.name} className="max-h-[430px] w-full object-contain mix-blend-multiply transition duration-500 hover:scale-[1.03]" />
                    </div>
                    <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#eaf3ff] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#104185]">{getProductBySlug?.category?.name}</span>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> In stock</span>
                        </div>
                        <h1 className="mt-5 text-3xl font-black leading-tight tracking-[-0.035em] text-[#132A36] sm:text-4xl">{getProductBySlug?.name}</h1>
                        <div className="mt-5 flex items-end gap-3 border-b border-slate-200 pb-6">
                            <p className="text-3xl font-black text-[#104185]">${getProductBySlug?.price}</p>
                            <p className="pb-1 text-sm text-slate-500">Ready to ship</p>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.12em] text-slate-500">Available</p><p className="mt-1 font-bold text-[#132A36]">{getProductBySlug?.stock} units</p></div>
                            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.12em] text-slate-500">Seller</p><p className="mt-1 truncate font-bold text-[#132A36]">{getProductBySlug?.author?.firstName} {getProductBySlug?.author?.lastName}</p></div>
                        </div>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <button onClick={() => handleSubmit(getProductBySlug)} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#132A36] px-5 text-sm font-bold text-white transition hover:bg-[#104185] focus:outline-none focus:ring-2 focus:ring-[#104185] focus:ring-offset-2"><span>Add to cart</span><i className="fi fi-rr-shopping-cart-add" /></button>
                            <Link to="/cart" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#132A36] px-5 text-sm font-bold text-[#132A36] transition hover:bg-slate-100"><span>View cart</span><i className="fi fi-rr-eye" /></Link>
                        </div>
                        <div className="mt-7 flex items-center gap-2 text-xs text-slate-500"><i className="fi fi-rr-shield-check text-base text-[#104185]" /> Secure checkout and reliable delivery</div>
                    </div>
                </section>

            {/* Comment Section */}
            <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <div className="flex flex-col justify-between gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
                    <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#104185]">Customer voice</p><h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-[#132A36]">What customers are saying</h2></div>
                    <p className="text-sm text-slate-500">Share your experience with this product</p>
                </div>

                <div className="py-5">
                    <form className="flex flex-col gap-3 sm:flex-row">
                        <input type="text" placeholder="Add a comment..." className="min-h-12 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#104185] focus:bg-white focus:ring-2 focus:ring-[#104185]/10" />
                        <button className="min-h-12 rounded-xl bg-[#132A36] px-7 text-sm font-bold text-white transition hover:bg-[#104185]">Send</button>
                    </form>
                </div>

                {/* Static Comment */}
                <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <p className="text-sm leading-6 text-slate-700">I love this product so much.</p>
                    <p className="mt-3 text-right text-xs font-bold text-slate-500">By Ali Mujahid</p>
                </div>
                <div className="mt-3 rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <p className="text-sm leading-6 text-slate-700">I love this product so much. Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi repellat quos dignissimos maxime natus impedit expedita odit dolores, necessitatibus sequi nam nobis accusamus neque porro deleniti hic, vel omnis veniam.</p>
                    <p className="mt-3 text-right text-xs font-bold text-slate-500">By Ali Mujahid</p>
                </div>
            </section>
            </div>
        </div>
    )
}