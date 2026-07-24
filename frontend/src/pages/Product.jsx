import { Link, Navigate, useParams } from "react-router-dom";
import api from "../api/axios";
import DashboardAside from "../components/DashboardAside";
import { useAppContext } from "../context/AppContext";
import { useState } from "react";

export default function Product () {

    const { isAuthenticated, setIsAuthenticated, isAuthLoading, category, getProducts, setGetProducts } = useAppContext();
    const [createProduct, setCreateProduct] = useState({
        'name': '',
        'image': null,
        'price': null,
        'stock': null,
        'category': ''
    });

    const handleChange = (e) => {
        const { name, files, type ,value } = e.target;
        setCreateProduct(
            (prev) => (
                {...prev, [name] : type === 'file' ? files[0] : value }
            )
        )
    }

    const handleSubmit = async(e) => {
        e.preventDefault();

        try {
            const data = new FormData();
            data.append("name", createProduct.name);
            data.append("image", createProduct.image);
            data.append("price", createProduct.price);
            data.append("stock", createProduct.stock);
            data.append("category", createProduct.category);

            const response = await api.post("/auth/create-product", data);
            setGetProducts((prev) => [...prev, response.data])
            setCreateProduct({
                'name': '',
                'image': '',
                'price': '',
                'stock': '',
                'category': ''
            })
        } catch (error) {
            console.log(error)
        }

    }

    if (isAuthLoading) {
        return <div className="flex flex-col min-h-screen font-semibold text-xl text-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to='/' replace />;
    }

    const handleLogout = async (slug) => {
        try {
            await api.delete(`/auth/delete-product/${slug}`)
            setGetProducts((prev) => prev.filter(
                (product) => product.slug !== slug
            ))
        } catch (error) {
            console.log(error)
        }

    }

    return (
        <div className="flex flex-col md:flex-row border-t-[1px] border-slate-300 py-4 bg-slate-100 min-h-screen">
            <DashboardAside setIsAuthenticated={setIsAuthenticated} />
            <main className="flex flex-col">
                <div className="flex flex-col gap-4 px-6">
                    <h1 className="text-2xl font-semibold text-center md:text-start md:pl-4 text-[#132A36]">MANAGE PRODUCTS</h1>
                    <p className="text-sm text-[#104185] px-2 md:px-4">You can create, update and delete categories on this page.</p>
                </div>
                {/* Mobile */}
                {
                    getProducts?.map((product) => (
                        <div key={product._id} className="md:hidden flex flex-col gap-4 mt-6 px-6">
                            <div className="bg-white border rounded-lg py-4 px-8 space-y-3">
                                <div>
                                    <p className="text-xs text-slate-500">Name</p>
                                    <p className="font-medium">{product.name}</p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <p className="text-xs text-slate-500">Image</p>
                                    <img
                                        src={product.imageUrl}
                                        className="w-20 h-20 object-cover rounded"
                                    />
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
                                    <Link to={`/dashboard/update-category/`} className="bg-white text-[#132A36] border-[1px] border-[#132A36] px-3 py-2 rounded-lg">
                                        Update
                                    </Link>

                                    <button className="bg-[#132A36] border-[1px] text-white px-3 py-2 rounded-lg">
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
                            {
                            getProducts?.map((product) => (
                                <tbody key={product._id}>
                                    <tr className="border-t">
                                        <td className="py-4 pl-4 whitespace-normal break-words">{product.name.length > 25 ? `${product.name.slice(0, 25)}...` : product.name}</td>

                                        <td className="p-4">
                                            <img
                                                src={product.imageUrl}
                                                className="w-16 h-16 rounded object-cover"
                                            />
                                        </td>

                                        <td className="p-4">${product.price}</td>
                                        <td className="p-4">{product.author.firstName} {product.author.lastName}</td>
                                        <td className="p-4">{product.stock}</td>
                                        <td className="pr-2">{product.category.name}</td>

                                        <td className="text-center">
                                            <Link to={`/dashboard/update-category/`} className="bg-white text-[#132A36] border-[1px] border-[#132A36] px-3 py-2 rounded-lg">
                                                Update
                                            </Link>
                                        </td>

                                        <td className="text-center">
                                            <Link onClick={() => handleLogout(product.slug)} className="bg-[#132A36] border-[1px] text-white px-3 py-2 rounded-lg">
                                                Delete
                                            </Link>
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
                            <p className="text-md font-semibold text-[#104185]">Image</p>
                            <input name="image" type="file" accept="image/*" onChange={handleChange} className="border-[1px] border-slate-300 px-4 py-2 rounded-lg text-sm"/>
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
                        <button type="submit" className="w-full bg-[#132A36] text-white font-semibold rounded-lg py-2">SEND</button>
                    </form>
                </div>
            </main>
        </div>
    )
}