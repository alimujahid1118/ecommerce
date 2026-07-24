import { useParams } from "react-router-dom";
import DashboardAside from "../components/DashboardAside"
import { useAppContext } from "../context/AppContext"
import { useEffect } from "react";
import api from "../api/axios";
import { useState } from "react";

export default function UpdateProduct() {

    const { setIsAuthenticated, category } = useAppContext();
    const [ getProductBySlug, setGetProductBySlug] = useState(null);
    const [updateProduct, setUpdateProduct] = useState({
        name: "",
        image: null,
        price: "",
        stock: "",
        category: "",
    });
    const { slug } = useParams();

    useEffect(() => {
        const getProduct = async () => {
            try {
                const response = await api.get(`/auth/get-product/${slug}`)
                setGetProductBySlug(response.data)
            } catch (error) {
                console.log(error)
            }
        }

        getProduct();
    }, [slug])

    const handleChange = (e) => {
        const {name, value, files, type} = e.target;
        setUpdateProduct((prev) => ({
            ...prev,
            [name] : type === "file" ? files[0] : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = new FormData();
            data.append("name", updateProduct.name);
            data.append("price", updateProduct.price);
            data.append("stock", updateProduct.stock);
            data.append("category", updateProduct.category);

            if (updateProduct.image) {
                data.append("image", updateProduct.image);
            }

            const response = await api.put(`/auth/update-product/${slug}`, data)
            setGetProductBySlug(response.data)
            setUpdateProduct({
                name: "",
                image: null,
                price: "",
                stock: "",
                category: "",
            })
        } catch (error) {
            console.log(error)
        }
    }

    return (
            <div className="flex flex-col md:flex-row border-t-[1px] border-slate-300 py-4 bg-slate-100 min-h-screen">
                <DashboardAside setIsAuthenticated={setIsAuthenticated} />
                <main className="flex flex-col">
                    <div className="flex flex-col gap-4 px-6">
                        <h1 className="text-2xl font-semibold text-center md:text-start md:pl-4 text-[#132A36]">UPDATE PRODUCT</h1>
                            <p className="text-sm text-[#104185] px-2 md:px-4">You can Update product on this page.</p>
                        </div>
                        {/* Mobile */}
                            <div className="md:hidden flex flex-col gap-4 mt-6 px-6">
                                <div className="bg-white border rounded-lg py-4 px-8 space-y-3">
                                    <div>
                                        <p className="text-xs text-slate-500">Name</p>
                                        <p className="font-medium">{getProductBySlug?.name}</p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs text-slate-500">Image</p>
                                        <img
                                            src={getProductBySlug?.imageUrl}
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pb-2">
                                        <div>
                                            <p className="text-xs text-slate-500">Price</p>
                                            <p className="font-medium">${getProductBySlug?.price}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Uploaded by</p>
                                            <p className="font-medium">{getProductBySlug?.author?.firstName} {getProductBySlug?.author?.lastName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Stock</p>
                                            <p className="font-medium">{getProductBySlug?.stock}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Category</p>
                                            <p className="font-medium">{getProductBySlug?.category?.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-t">
                                            <td className="py-4 pl-4 whitespace-normal break-words">{getProductBySlug?.name?.length > 25 ? `${getProductBySlug?.name?.slice(0, 25)}...` : getProductBySlug?.name}</td>

                                            <td className="p-4">
                                                <img
                                                    src={getProductBySlug?.imageUrl}
                                                    className="w-16 h-16 rounded object-cover"
                                                />
                                            </td>

                                            <td className="p-4">${getProductBySlug?.price}</td>
                                            <td className="p-4">{getProductBySlug?.author?.firstName} {getProductBySlug?.author?.lastName}</td>
                                            <td className="p-4">{getProductBySlug?.stock}</td>
                                            <td className="pr-2">{getProductBySlug?.category?.name}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                    
                    {/* Update Product */}
                    <h1 className="text-2xl font-semibold text-center md:text-start pt-4 md:pl-8 text-[#132A36]">UPDATE PRODUCT</h1>
                    <div className="flex flex-col py-4 bg-white mt-4 mx-4 rounded-lg">
                        <form onSubmit={handleSubmit} className="flex flex-col px-4 gap-4">
                            <div className="flex flex-col gap-2">
                                <p className="text-md font-semibold text-[#104185]">Name</p>
                                <input name="name" type="text" value={updateProduct.name} onChange={handleChange} placeholder="Product name.." className="border-[1px] border-slate-300 px-4 py-2 rounded-lg text-sm"/>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-md font-semibold text-[#104185]">Image</p>
                                <input name="image" type="file" accept="image/*" onChange={handleChange} className="border-[1px] border-slate-300 px-4 py-2 rounded-lg text-sm"/>
                            </div>
                            <div>
                                <p className="text-md font-semibold text-[#104185]">Price</p>
                                <input name="price" type="number" value={updateProduct.price} onChange={handleChange} placeholder="Enter Price.." className="border-[1px] border-slate-300 w-full px-4 py-2 rounded-lg text-sm"/>
                            </div>
                            <div>
                                <p className="text-md font-semibold text-[#104185]">Stock</p>
                                <input name="stock" type="number" value={updateProduct.stock} onChange={handleChange} placeholder="Enter Product stock.." className="border-[1px] border-slate-300 w-full px-4 py-2 rounded-lg text-sm"/>
                            </div>
                            <div>
                                <p className="text-md font-semibold text-[#104185]">Category</p>
                                <select name="category" value={updateProduct.category || ""} onChange={handleChange} className="px-4 w-full border-[1px] border-slate-300 py-2 rounded-lg">
                                    <option value="" disabled>Select Category..</option>
                                    {
                                        category?.map((eachCategory) => (
                                            <option key={eachCategory._id} value={eachCategory.slug}>{eachCategory.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-[#132A36] text-white font-semibold rounded-lg py-2">SEND</button>
                        </form>
                    </div>
                </main>
            </div>
        )
}