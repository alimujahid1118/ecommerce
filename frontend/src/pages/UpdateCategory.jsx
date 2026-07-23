import { useParams } from "react-router-dom";
import DashboardAside from "../components/DashboardAside";
import { useAppContext } from "../context/AppContext";
import { useState, useEffect } from "react";
import api from "../api/axios";

export default function UpdateCategory() {

    const { setIsAuthenticated, setCategory } = useAppContext();
    const [ categoryBySlug, setCategoryBySlug ] = useState(null)
    const [ updateCategoryBySlug, setUpdateCategoryBySlug ] = useState({
        'name' : categoryBySlug?.name,
        'imageUrl' : null
    })
    const { slug } = useParams();

    useEffect(() => {
        const getCategorySlug = async () => {
            try {
                const response = await api.get(`/auth/get-category/${slug}`)
                const updatedCategory = response.data;
                setCategoryBySlug(updatedCategory)
            } catch (error) {
                console.log(error)
            }
        }

        getCategorySlug();
    }, [])

    const handleSubmit = async(e) => {
        e.preventDefault();

        try {

            const data = new FormData();

            data.append("name", updateCategoryBySlug.name);
            data.append("image", updateCategoryBySlug.imageUrl);

            const response = await api.put(`/auth/update-category/${slug}`, data)
            const updatedCategory = response.data;
            setCategory((prev) =>
                    prev.map((cat) =>
                        cat._id === updatedCategory._id ? updatedCategory : cat
                    )
                );
            setCategoryBySlug(updatedCategory)
            setUpdateCategoryBySlug({
                'name' : '',
                'image' : null
            })
        } catch (error) {
            console.log(error)
        }
    };

    return (
        <div className="flex flex-col md:flex-row border-t-[1px] border-slate-300 py-4 bg-slate-100 min-h-screen">
            <DashboardAside setIsAuthenticated={setIsAuthenticated} />
            <main className="flex flex-col">
                <div className="flex flex-col gap-4 px-6">
                    <h1 className="text-2xl font-semibold text-center md:text-start md:pl-4 text-[#132A36]">UPDATE CATEGORY</h1>
                    <p className="text-sm text-[#104185] px-2 md:px-4">You can Update category on this page.</p>
                </div>
                {/* Mobile */}
                <div className="md:hidden flex flex-col gap-4 mt-6 px-6">
                    <div className="bg-white border rounded-lg py-4 px-8 space-y-3">
                        <div>
                            <p className="text-xs text-slate-500">Name</p>
                            <p className="font-medium">{categoryBySlug?.name}</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="text-xs text-slate-500">Image</p>
                            <img
                                src={categoryBySlug?.imageUrl}
                                className="w-20 h-20 object-cover rounded"
                            />
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
                            </tr>
                        </thead>

                        <tbody>
                            <tr className="border-t">
                                <td className="p-4">{categoryBySlug?.name}</td>

                                <td className="p-4">
                                    <img
                                        src={categoryBySlug?.imageUrl}
                                        className="w-16 h-16 rounded object-cover"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Update Category */}
                <div className="flex flex-col py-4 bg-white mt-4 mx-6 rounded-lg">
                    <form onSubmit={handleSubmit} className="flex flex-col px-4 gap-4">
                        <div className="flex flex-col gap-2">
                            <p className="text-md font-semibold text-[#104185]">Name</p>
                            <input name="name" value={updateCategoryBySlug?.name} onChange=
                                {
                                    (e) => {
                                        setUpdateCategoryBySlug(
                                        {...updateCategoryBySlug, name: e.target.value})

                                }
                                } placeholder="New Category name.." type="text" className="border-[1px] border-slate-300 px-4 py-2 rounded-lg text-sm"/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-md font-semibold text-[#104185]">Image</p>
                            <input name="imageUrl" onChange={(e) => setUpdateCategoryBySlug({...updateCategoryBySlug, imageUrl: e.target.files[0]})} type="file" accept="image/*" className="border-[1px] border-slate-300 px-4 py-2 rounded-lg text-sm"/>
                        </div>
                        <button type="submit" className="w-full bg-[#132A36] text-white font-semibold rounded-lg py-2">SEND</button>
                    </form>
                </div>
            </main>
        </div>
    )
}