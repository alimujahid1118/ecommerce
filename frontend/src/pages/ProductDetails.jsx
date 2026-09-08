import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import SEO from "../components/SEO";
import { useAppContext } from "../context/AppContext";

const imagesFor = (product) => product?.imageUrls?.length ? product.imageUrls : (product?.imageUrl ? [product.imageUrl] : []);

export default function ProductDetails() {
    const { isAuthenticated, setProfileOpen, showToast, refreshCartCount } = useAppContext();
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);
    const [commentImages, setCommentImages] = useState([]);
    const [commentImagePreviews, setCommentImagePreviews] = useState([]);
    const commentPreviewUrls = useRef([]);
    const [canReview, setCanReview] = useState(false);
    const [reviewEligibilityLoading, setReviewEligibilityLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => () => {
        commentPreviewUrls.current.forEach((preview) => URL.revokeObjectURL(preview));
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const requests = [
                    api.get(`/auth/get-product/${slug}`),
                    api.get(`/auth/get-product/${slug}/comments`)
                ];
                if (isAuthenticated) {
                    setReviewEligibilityLoading(true);
                    requests.push(api.get(`/auth/get-product/${slug}/review-eligibility`));
                }
                const [productResponse, commentsResponse, eligibilityResponse] = await Promise.all(requests);
                setProduct(productResponse.data);
                setComments(commentsResponse.data || []);
                setCanReview(Boolean(eligibilityResponse?.data?.canReview));
            } catch (error) {
                showToast(error.response?.data?.message || "Unable to load product.", "error");
            } finally { setLoading(false); setReviewEligibilityLoading(false); }
        };
        load();
    }, [slug, isAuthenticated, showToast]);

    const addToCart = async () => {
        if (!product || product.stock < 1) return showToast("This product is out of stock.", "error");
        setAdding(true);
        try {
            if (isAuthenticated) {
                const response = await api.post("/create-cart", { productId: product._id, quantity: 1 });
                showToast(`${response.data?.quantity > 1 ? "Product quantity updated in cart" : "Product added to cart"}: ${product.name}`);
            } else {
                const cart = JSON.parse(localStorage.getItem("cart")) || [];
                const existing = cart.find((item) => item.productId === product._id);
                if (existing) { existing.quantity += 1; showToast(`Product quantity updated in cart: ${product.name}`); }
                else { cart.push({ productId: product._id, name: product.name, image: imagesFor(product)[0], price: product.price, category: product.category?.slug, quantity: 1 }); showToast(`Product added to cart: ${product.name}`); }
                localStorage.setItem("cart", JSON.stringify(cart));
            }
            await refreshCartCount();
        } catch (error) { showToast(error.response?.data?.message || "Unable to add product to cart.", "error"); }
        finally { setAdding(false); }
    };

    const submitComment = async (event) => {
        event.preventDefault();
        if (!isAuthenticated) { showToast("Please log in to add a comment.", "error"); navigate("/"); setProfileOpen(true); return; }
        if (!canReview) return showToast("Please purchase this item to add a comment.", "error");
        if (!comment.trim()) return showToast("Comment cannot be empty.", "error");
        if (!rating) return showToast("Please select a rating from 1 to 5 stars.", "error");
        setSubmittingComment(true);
        try {
            const formData = new FormData();
            formData.append("body", comment);
            formData.append("rating", String(rating));
            commentImages.forEach((image) => formData.append("images", image));
            const response = await api.post(`/auth/get-product/${slug}/comments`, formData);
            setComments((prev) => [response.data, ...prev]);
            setComment("");
            commentPreviewUrls.current.forEach((preview) => URL.revokeObjectURL(preview));
            commentPreviewUrls.current = [];
            setRating(0);
            setCommentImages([]);
            setCommentImagePreviews([]);
            showToast("Review added successfully.");
        } catch (error) { showToast(error.response?.data?.message || "Unable to add review.", "error"); }
        finally { setSubmittingComment(false); }
    };

    const handleCommentImagesChange = (event) => {
        const selectedFiles = Array.from(event.target.files || []);
        const sizeValidFiles = selectedFiles.filter((file) => file.size <= 5 * 1024 * 1024);
        const remainingSlots = Math.max(0, 4 - commentImages.length);
        const validFiles = sizeValidFiles.slice(0, remainingSlots);
        if (validFiles.length !== selectedFiles.length) showToast("Only 4 photos up to 5MB each can be attached.", "error");
        const previews = validFiles.map((file) => URL.createObjectURL(file));
        commentPreviewUrls.current = [...commentPreviewUrls.current, ...previews];
        setCommentImages((previous) => [...previous, ...validFiles]);
        setCommentImagePreviews((previous) => [...previous, ...previews]);
        event.target.value = "";
    };

    const removeCommentImage = (indexToRemove) => {
        URL.revokeObjectURL(commentPreviewUrls.current[indexToRemove]);
        commentPreviewUrls.current = commentPreviewUrls.current.filter((_, index) => index !== indexToRemove);
        setCommentImages((previous) => previous.filter((_, index) => index !== indexToRemove));
        setCommentImagePreviews((previous) => previous.filter((_, index) => index !== indexToRemove));
    };

    if (loading) return <div className="flex min-h-screen items-center justify-center font-semibold text-[#132A36]">Loading product...</div>;
    if (!product) return <div className="flex min-h-screen items-center justify-center">Product not found.</div>;
    const images = imagesFor(product);
    const currentImage = images[selectedImage] || images[0];
    const ratedComments = comments.filter((item) => Number.isInteger(item.rating) && item.rating >= 1 && item.rating <= 5);
    const averageRating = ratedComments.length ? (ratedComments.reduce((total, item) => total + item.rating, 0) / ratedComments.length).toFixed(1) : "0.0";

    return <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8"><SEO title={`${product.name} | E Shop`} description={`Shop ${product.name} from E Shop for $${product.price}.`} canonicalPath={`/product/${slug}`} />
        <div className="mx-auto max-w-6xl"><div className="mb-6 flex items-center gap-2 text-sm text-slate-500"><Link to="/products">Products</Link><span>/</span><span className="truncate text-slate-800">{product.name}</span></div>
            <section className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]"><div className="flex flex-col gap-4 bg-[#f1f5f8] p-5 sm:p-8"><div className="flex aspect-square w-full max-w-[480px] items-center justify-center self-center overflow-hidden rounded-2xl bg-white"><img src={currentImage} alt={product.name} className="h-full w-full object-contain" /></div><div className="flex gap-3 overflow-x-auto">{images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setSelectedImage(index)} className={`aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white ${selectedImage === index ? "border-[#104185]" : "border-transparent"}`}><img src={image} alt={`${product.name} view ${index + 1}`} className="h-full w-full object-contain" /></button>)}</div></div>
                <div className="flex flex-col justify-center p-6 sm:p-10"><span className="w-fit rounded-full bg-[#eaf3ff] px-3 py-1 text-xs font-bold uppercase text-[#104185]">{product.category?.name || "Product"}</span><h1 className="mt-5 text-3xl font-black text-[#132A36] sm:text-4xl">{product.name}</h1><p className="mt-5 border-b border-slate-200 pb-6 text-3xl font-black text-[#104185]">${product.price}</p><p className={`mt-5 text-sm font-semibold ${product.stock > 0 ? "text-emerald-700" : "text-red-600"}`}>{product.stock > 0 ? `${product.stock} units available` : "Out of stock"}</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><button disabled={adding || product.stock < 1} onClick={addToCart} className="min-h-12 flex-1 rounded-xl bg-[#132A36] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{adding ? "Adding..." : "Add to cart"}</button><Link to="/cart" className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-[#132A36] px-5 text-sm font-bold text-[#132A36]">View cart</Link></div></div></section>
            <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-2xl font-black text-[#132A36]">Customer reviews</h2><p className="mt-1 text-sm text-slate-500">Share your experience and help others make the right choice.</p></div><div className="flex items-center gap-2"><span className="text-2xl tracking-[0.12em] text-amber-500">★★★★★</span><strong className="text-sm text-[#132A36]">{averageRating}</strong><span className="text-xs text-slate-500">({comments.length} {comments.length === 1 ? "review" : "reviews"})</span></div></div>
                <form onSubmit={submitComment} className="mt-5 flex flex-col gap-3">
                    <div><p className="text-xs font-bold text-[#132A36]">Your Rating</p><div className="mt-1 flex gap-1">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} disabled={submittingComment || !isAuthenticated || reviewEligibilityLoading || !canReview} aria-label={`${value} star${value > 1 ? "s" : ""}`} className={`text-2xl leading-none transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 ${value <= rating ? "text-amber-500" : "text-slate-300"}`}>{value <= rating ? "★" : "☆"}</button>)}</div></div>
                    <p className="text-xs font-bold text-[#132A36]">Your Comment</p>
                    <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder={!isAuthenticated ? "Log in to review this product" : !canReview && !reviewEligibilityLoading ? "Purchase this product to leave a review" : "Share your experience..."} disabled={submittingComment || !isAuthenticated || reviewEligibilityLoading || !canReview} className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60" />
                    {commentImagePreviews.length > 0 && (
                        <div className="grid grid-cols-4 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-8 sm:gap-4">
                            {commentImagePreviews.map((preview, index) => (
                                <div key={preview} className="relative h-28 w-full max-w-36 sm:h-32 sm:max-w-40">
                                    <img src={preview} alt={`Selected review photo ${index + 1}`} className="h-full w-full rounded-lg object-cover" />
                                    <button type="button" onClick={() => removeCommentImage(index)} disabled={submittingComment} aria-label={`Remove review photo ${index + 1}`} className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#132A36] text-lg leading-none text-white shadow">×</button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className={`flex min-h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-center text-sm text-[#132A36] transition hover:border-[#104185] hover:bg-slate-50 sm:w-56 ${(!isAuthenticated || !canReview || reviewEligibilityLoading) ? "pointer-events-none opacity-50" : ""}`}><span className="text-2xl text-[#104185]">▣</span><span className="mt-1 font-semibold">Add Photos <span className="font-normal text-slate-500">(Up to 4)</span></span><span className="text-xs text-slate-400">JPG, PNG, max 5MB each</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleCommentImagesChange} disabled={!isAuthenticated || !canReview || reviewEligibilityLoading || submittingComment} className="sr-only" /></label>
                        <span className="text-xs text-slate-500">{commentImages.length ? `${commentImages.length} photo${commentImages.length > 1 ? "s" : ""} selected` : "Up to 4 photos"}</span>
                        <button disabled={submittingComment || !isAuthenticated || reviewEligibilityLoading || !canReview} className="min-h-12 rounded-xl bg-[#132A36] px-7 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{reviewEligibilityLoading ? "Checking purchase..." : submittingComment ? "Posting..." : !isAuthenticated ? "Log in to review" : !canReview ? "Purchase to review" : "Post review"}</button>
                    </div>
                </form>
                <div className="mt-6 space-y-3"><h3 className="text-lg font-bold text-[#132A36]">Customer Reviews <span className="text-slate-500">({comments.length})</span></h3>{comments.length ? comments.map((item) => <article key={item._id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center gap-2"><p className="font-bold text-[#132A36]">{item.user?.firstName} {item.user?.lastName}</p>{item.rating && <span className="text-sm tracking-wide text-amber-500">{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</span>}</div><p className="mt-2 text-sm leading-6 text-slate-700">{item.body}</p>{item.imageUrls?.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{item.imageUrls.map((image, index) => <img key={`${image}-${index}`} src={image} alt={`Review photo ${index + 1}`} className="aspect-square w-full rounded-xl object-cover" />)}</div>}<p className="mt-3 text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p></article>) : <p className="py-6 text-sm text-slate-500">No reviews yet.</p>}</div>
            </section>
        </div></div>;
}
