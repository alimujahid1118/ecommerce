import { Link, Navigate } from "react-router-dom";
import api from "../api/axios";
import DashboardAside from "../components/DashboardAside";
import { useAppContext } from "../context/AppContext";
import { useState } from "react";
import { useEffect } from "react";
import ConfirmationModal from "../components/ConfirmationModal";

const MAX_PRODUCT_IMAGES = 10;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const productImageList = (product) => product?.imageUrls?.length ? product.imageUrls : (product?.imageUrl ? [product.imageUrl] : []);

export default function Product () {

    const { isAuthenticated, setIsAuthenticated, isAuthLoading, category, showToast } = useAppContext();
    const [getProducts, setGetProducts] = useState([])
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleteSlug, setDeleteSlug] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [csvInputKey, setCsvInputKey] = useState(0);
    const [imageInputKey, setImageInputKey] = useState(0);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [createProduct, setCreateProduct] = useState({
        'name': '',
        'images': [],
        'price': null,
        'stock': null,
        'category': ''
    });

    useEffect(() => {
        const previews = createProduct.images.map((file) => URL.createObjectURL(file));
        setImagePreviews(previews);
        return () => previews.forEach((preview) => URL.revokeObjectURL(preview));
    }, [createProduct.images]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                const response = await api.get("/auth/get-products");

                setGetProducts(response.data.products);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false)
            }
        };

        fetchProducts();
    }, []);

    const handleChange = (e) => {
        const { name, files, type ,value } = e.target;
        if (type === 'file') {
            const validFiles = Array.from(files || []).filter((file) => {
                if (!file.type.startsWith("image/")) {
                    showToast(`${file.name} is not a supported image file.`, "error");
                    return false;
                }
                if (file.size > MAX_IMAGE_SIZE) {
                    showToast(`${file.name} is larger than 10 MB.`, "error");
                    return false;
                }
                return true;
            });
            setCreateProduct((prev) => {
                const existing = new Set(prev.images.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
                const additions = validFiles.filter((file) => !existing.has(`${file.name}-${file.size}-${file.lastModified}`));
                if (prev.images.length + additions.length > MAX_PRODUCT_IMAGES) {
                    showToast(`You can select up to ${MAX_PRODUCT_IMAGES} images.`, "error");
                }
                return { ...prev, images: [...prev.images, ...additions].slice(0, MAX_PRODUCT_IMAGES) };
            });
            e.target.value = "";
            return;
        }
        setCreateProduct(
            (prev) => (
                {...prev, [name] : value }
            )
        )
    }

    const removeImage = (index) => {
        setCreateProduct((prev) => ({ ...prev, images: prev.images.filter((_, imageIndex) => imageIndex !== index) }));
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        if (!createProduct.name.trim() || createProduct.price === "" || createProduct.stock === "" || !createProduct.category || createProduct.images.length === 0) {
            return showToast("Name, image, price, stock and category are required.", "error");
        }

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append("name", createProduct.name);
            createProduct.images.forEach((image) => data.append("image", image));
            data.append("price", createProduct.price);
            data.append("stock", createProduct.stock);
            data.append("category", createProduct.category);

            const response = await api.post("/auth/create-product", data);
            setGetProducts((prev) => [...prev, response.data])
            setCreateProduct({
                'name': '',
                'images': [],
                'price': '',
                'stock': '',
                'category': ''
            })
            setImageInputKey((key) => key + 1);
            showToast("Product added successfully.");
        } catch (error) { showToast(error.response?.data?.message || "Unable to add product.", "error"); }
        finally { setSubmitting(false); }

    }

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/auth/delete-product/${deleteSlug}`)
            setGetProducts((prev) => prev.filter(
                (product) => product.slug !== deleteSlug
            ))
            showToast("Product deleted successfully.");
        } catch (error) { showToast(error.response?.data?.message || "Unable to delete product.", "error"); }
        finally { setDeleting(false); setDeleteSlug(null); }

    }

    const downloadTemplate = () => {
        const blob = new Blob(["name,price,stock,category,imageUrl\nExample product,19.99,10,category-slug,https://example.com/image.jpg\n"], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "products-template.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    const importCsv = async () => {
        if (!csvFile) return showToast("Select a CSV file first.", "error");
        setImporting(true);
        try {
            const data = new FormData();
            data.append("file", csvFile);
            const response = await api.post("/auth/import-products", data);
            const errorSummary = response.data.errors?.length
                ? ` ${response.data.errors.map((item) => `Row ${item.row}: ${item.errors.join(", ")}`).join("; ")}`
                : "";
            showToast(`${response.data.imported} products imported. ${response.data.failed} rows failed.${errorSummary}`, response.data.failed ? "error" : "success");
            if (response.data.imported > 0 && response.data.failed === 0) {
                setCsvFile(null);
                setCsvInputKey((key) => key + 1);
            }
            const refreshed = await api.get("/auth/get-products");
            setGetProducts(refreshed.data.products);
        } catch (error) { showToast(error.response?.data?.message || "Unable to import products.", "error"); }
        finally { setImporting(false); }
    };

    if (isAuthLoading) {
        return <div className="flex flex-col min-h-screen font-semibold text-xl text-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to='/' replace />;
    }

    return (
        <div className="flex flex-col md:flex-row border-t-[1px] border-slate-300 py-4 bg-slate-100 min-h-screen">
            <DashboardAside setIsAuthenticated={setIsAuthenticated} />
            <main className="flex flex-col">
                <div className="flex flex-col gap-4 px-6">
                    <h1 className="text-2xl font-semibold text-center md:text-start md:pl-4 text-[#132A36]">MANAGE PRODUCTS</h1>
                    <p className="text-sm text-[#104185] px-2 md:px-4">You can create, update and delete categories on this page.</p>
                </div>
                <section className="mx-4 mt-6 rounded-xl border border-slate-200 bg-white p-4 md:mx-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="font-bold text-[#132A36]">Import Products</h2><p className="text-xs text-slate-500">CSV columns: name, price, stock, category, imageUrl</p></div><button type="button" onClick={downloadTemplate} className="text-sm font-semibold text-[#104185] underline">Download CSV Template</button></div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"><input key={csvInputKey} type="file" accept=".csv,text/csv" onChange={(event) => setCsvFile(event.target.files?.[0] || null)} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" /><button type="button" disabled={importing} onClick={importCsv} className="rounded-lg bg-[#132A36] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{importing ? "Importing..." : "Import Products"}</button></div>
                </section>
                {/* Mobile */}  
                {loading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="md:hidden flex flex-col gap-4 mt-6 px-6 animate-pulse">
                            <div className="bg-white border rounded-lg py-4 px-8 space-y-4">

                                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                                <div className="h-5 w-48 bg-gray-200 rounded"></div>

                                <div className="w-60 h-48 bg-gray-200 rounded-lg"></div>

                                <div className="grid grid-cols-2 gap-4">
                                    {Array.from({ length: 4 }).map((_, j) => (
                                        <div key={j} className="space-y-2">
                                            <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
                                    <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
                                </div>

                            </div>
                        </div>
                    ))
                    :
                    getProducts?.map((product) => (
                        <div key={product._id} className="md:hidden flex flex-col gap-4 mt-6 px-6">
                            <div className="bg-white border rounded-lg py-4 px-8 space-y-3">
                                <div>
                                    <p className="text-xs text-slate-500">Name</p>
                                    <p className="font-medium">{product.name}</p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <p className="text-xs text-slate-500">Image</p>
                                    <div className="flex flex-wrap gap-2">{productImageList(product).map((image) => <img key={image} src={image} className="w-20 h-20 object-cover rounded-lg" />)}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pb-2">
                                    <div>
                                        <p className="text-xs text-slate-500">Price</p>
                                        <p className="font-medium">${product.price}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Uploaded by</p>
                                        <p className="font-medium">{product.author.firstName} {product.author.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Stock</p>
                                        <p className="font-medium">{product.stock}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Category</p>
                                        <p className="font-medium">{product.category.name}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Link to={`/dashboard/update-product/${product.slug}`} className="bg-white text-[#132A36] border-[1px] border-[#132A36] px-3 py-2 rounded-lg">
                                        Update
                                    </Link>

                                    <button onClick={() => setDeleteSlug(product.slug)} className="bg-[#132A36] border-[1px] text-white px-3 py-2 rounded-lg">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                }
                

                {/* Desktop */}
                        <div className="hidden md:block px-6 mt-6">
                            <table className="w-full table-fixed right-0 bg-white border border-slate-300">
                                <thead className="bg-slate-200">
                                    <tr>
                                        <th className="p-4 text-left w-1/4">Name</th>
                                        <th className="p-4 text-left w-1/4">Image</th>
                                        <th className="p-4 text-left w-1/4">Price</th>
                                        <th className="p-4 text-left w-1/4">Author</th>
                                        <th className="p-4 text-left w-1/4">Stock</th>
                                        <th className="pr-2 text-left w-1/4">Category</th>
                                        <th className="p-4 text-center w-1/4">Update</th>
                                        <th className="p-4 text-center w-1/4">Delete</th>
                                    </tr>
                                </thead>
                                {loading
                                ? Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-t animate-pulse">
                                        <td className="p-4">
                                            <div className="h-4 w-40 bg-gray-200 rounded"></div>
                                        </td>

                                        <td className="p-4">
                                            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                                        </td>

                                        <td className="p-4">
                                            <div className="h-4 w-16 bg-gray-200 rounded"></div>
                                        </td>

                                        <td className="p-4">
                                            <div className="h-4 w-28 bg-gray-200 rounded"></div>
                                        </td>

                                        <td className="p-4">
                                            <div className="h-4 w-12 bg-gray-200 rounded"></div>
                                        </td>

                                        <td className="p-4">
                                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                        </td>

                                        <td className="text-center">
                                            <div className="inline-block h-10 w-24 bg-gray-200 rounded-lg"></div>
                                        </td>

                                        <td className="text-center">
                                            <div className="inline-block h-10 w-24 bg-gray-200 rounded-lg"></div>
                                        </td>
                                    </tr>
                                ))
                                :
                            getProducts?.map((product) => (
                                <tbody key={product._id}>
                                    <tr className="border-t">
                                        <td className="py-4 pl-4 whitespace-normal break-words">{product.name.length > 25 ? `${product.name.slice(0, 25)}...` : product.name}</td>

                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">{productImageList(product).map((image) => <img key={image} src={image} className="w-16 h-16 object-cover rounded-lg" />)}</div>
                                        </td>

                                        <td className="p-4">${product.price}</td>
                                        <td className="p-4">{product.author.firstName} {product.author.lastName}</td>
                                        <td className="p-4">{product.stock}</td>
                                        <td className="pr-2">{product.category.name}</td>

                                        <td className="text-center">
                                            <Link to={`/dashboard/update-product/${product.slug}`} className="bg-white text-[#132A36] border-[1px] border-[#132A36] px-3 py-2 rounded-lg">
                                                Update
                                            </Link>
                                        </td>

                                        <td className="text-center">
                                            <button onClick={() => setDeleteSlug(product.slug)} className="bg-[#132A36] border-[1px] text-white px-3 py-2 rounded-lg">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                                ))
                            }
                            </table>
                        </div>
                
                {/* Create Product */}
                <h1 className="text-2xl font-semibold text-center md:text-start pt-4 md:pl-8 text-[#132A36]">CREATE PRODUCT</h1>
                <div className="flex flex-col py-4 bg-white mt-4 mx-4 rounded-lg">
                    <form onSubmit={handleSubmit} className="flex flex-col px-4 gap-4">
                        <div className="flex flex-col gap-2">
                            <p className="text-md font-semibold text-[#104185]">Name</p>
                            <input name="name" type="text" value={createProduct.name} onChange={handleChange} placeholder="Product name.." className="border-[1px] border-slate-300 px-4 py-2 rounded-lg text-sm"/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-md font-semibold text-[#104185]">Photos ({createProduct.images.length}/{MAX_PRODUCT_IMAGES})</p>
                            <input key={imageInputKey} name="images" type="file" accept="image/*" multiple onChange={handleChange} className="border-[1px] border-slate-300 px-4 py-2 rounded-lg text-sm"/>
                            {createProduct.images.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{createProduct.images.map((image, index) => <div key={`${image.name}-${image.lastModified}`} className="relative"><div className="aspect-square overflow-hidden rounded-lg bg-slate-100"><img src={imagePreviews[index]} alt={image.name} className="h-full w-full object-contain" /></div><button type="button" onClick={() => removeImage(index)} aria-label={`Remove ${image.name}`} className="absolute right-1 top-1 rounded-full bg-[#132A36] px-2 py-1 text-xs text-white">×</button><p className="truncate text-xs text-slate-500">{image.name}</p></div>)}</div>}
                        </div>
                        <div>
                            <p className="text-md font-semibold text-[#104185]">Price</p>
                            <input name="price" type="number" value={createProduct.price} onChange={handleChange} placeholder="Enter Price.." className="border-[1px] border-slate-300 w-full px-4 py-2 rounded-lg text-sm"/>
                        </div>
                        <div>
                            <p className="text-md font-semibold text-[#104185]">Stock</p>
                            <input name="stock" type="number" value={createProduct.stock} onChange={handleChange} placeholder="Enter Product stock.." className="border-[1px] border-slate-300 w-full px-4 py-2 rounded-lg text-sm"/>
                        </div>
                        <div>
                            <p className="text-md font-semibold text-[#104185]">Category</p>
                            <select name="category" value={createProduct.category} onChange={handleChange} className="px-4 w-full border-[1px] border-slate-300 py-2 rounded-lg">
                                <option value="" disabled>Select Category..</option>
                                {
                                    category?.map((eachCategory) => (
                                        <option key={eachCategory._id} value={eachCategory._id}>{eachCategory.name}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <button type="submit" disabled={submitting} className="w-full bg-[#132A36] text-white font-semibold rounded-lg py-2 disabled:opacity-60">{submitting ? "Adding..." : "Add Product"}</button>
                    </form>
                </div>
                <ConfirmationModal open={Boolean(deleteSlug)} title="Confirm deletion" message="Are you sure you want to delete this product? This action cannot be undone." confirmLabel="Delete" loading={deleting} onCancel={() => setDeleteSlug(null)} onConfirm={handleDelete} />
            </main>
        </div>
    )
}