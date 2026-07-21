import api from "../api/axios";
import DashboardAside from "../components/DashboardAside";

export default function Category ({ setIsAuthenticated, categoryData, setCategoryData }) {

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();

        data.append("name", categoryData.name);
        data.append("image", categoryData.image);

        try {
            const response = await api.post("/auth/create-category", data);
            setCategoryData({
                name: '',
                image: null
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
                    <h1 className="text-2xl font-semibold text-center md:text-start md:pl-4 text-[#132A36]">MANAGE CATEGORIES</h1>
                    <p className="text-sm md:hidden text-[#104185] px-2">You can create, update and delete categories on this page.</p>
                </div>
                {/* Mobile */}
                <div className="md:hidden flex flex-col gap-4 mt-6 px-6">
                    <div className="bg-white border rounded-lg py-4 px-8 space-y-3">
                        <div>
                            <p className="text-xs text-slate-500">Name</p>
                            <p className="font-medium">Camera</p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">Image</p>
                            <img
                                src="/web-logo.png"
                                className="w-20 h-20 object-cover rounded"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button className="bg-white text-[#132A36] border-[1px] border-[#132A36] px-3 py-2 rounded-lg">
                                Update
                            </button>

                            <button className="bg-[#132A36] border-[1px] text-white px-3 py-2 rounded-lg">
                                Delete
                            </button>
                        </div>
                    </div>
                    <div className="bg-white border rounded-lg py-4 px-8 space-y-3">
                        <div>
                            <p className="text-xs text-slate-500">Name</p>
                            <p className="font-medium">Camera</p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">Image</p>
                            <img
                                src="/web-logo.png"
                                className="w-20 h-20 object-cover rounded"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button className="bg-white text-[#132A36] border-[1px] border-[#132A36] px-3 py-2 rounded-lg">
                                Update
                            </button>

                            <button className="bg-[#132A36] border-[1px] text-white px-3 py-2 rounded-lg">
                                Delete
                            </button>
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
                                <th className="p-4 text-center w-1/4">Update</th>
                                <th className="p-4 text-center w-1/4">Delete</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr className="border-t">
                                <td className="p-4">Camera</td>

                                <td className="p-4">
                                    <img
                                        src="/web-logo.png"
                                        className="w-16 h-16 rounded object-cover"
                                    />
                                </td>

                                <td className="text-center">
                                    <button className="bg-white text-[#132A36] border-[1px] border-[#132A36] px-3 py-2 rounded-lg">
                                        Update
                                    </button>
                                </td>

                                <td className="text-center">
                                    <button className="bg-[#132A36] border-[1px] text-white px-3 py-2 rounded-lg">
                                        Delete
                                    </button>
                                </td>
                            </tr>

                            <tr className="border-t">
                                <td className="p-4">Laptop</td>

                                <td className="p-4">
                                    <img
                                        src="/web-logo.png"
                                        className="w-16 h-16 rounded object-cover"
                                    />
                                </td>

                                <td className="text-center">
                                    <button className="bg-white text-[#132A36] border-[1px] border-[#132A36] px-3 py-2 rounded-lg">
                                        Update
                                    </button>
                                </td>

                                <td className="text-center">
                                    <button className="bg-[#132A36] border-[1px] text-white px-3 py-2 rounded-lg">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Create Category */}
                <h1 className="text-2xl font-semibold text-center md:text-start pt-4 md:pl-4 text-[#132A36]">CREATE CATEGORY</h1>
                <div className="flex flex-col py-4 bg-white mt-4 mx-4 rounded-lg">
                    <form onSubmit={handleSubmit} className="flex flex-col px-4 gap-4">
                        <div className="flex flex-col gap-2">
                            <p className="text-md font-semibold text-[#104185]">Name</p>
                            <input name="name" value={categoryData.name}
                            onChange={(e) =>
                                setCategoryData({
                                    ...categoryData,
                                    name: e.target.value
                                })
                            } type="text" placeholder="Category name.." className="border-[1px] border-slate-300 px-4 py-2 rounded-lg text-sm"/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-md font-semibold text-[#104185]">Image</p>
                            <input type="file" accept="image/*"
                            onChange={(e) =>
                                setCategoryData({
                                    ...categoryData,
                                    image: e.target.files[0]
                                })
                            } placeholder="Category name.." className="border-[1px] border-slate-300 px-4 py-2 rounded-lg text-sm"/>
                        </div>
                        <button type="submit" className="w-full bg-[#132A36] text-white font-semibold rounded-lg py-2">SEND</button>
                    </form>
                </div>
            </main>
        </div>
    )
}