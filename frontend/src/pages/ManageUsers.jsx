import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import DashboardAside from "../components/DashboardAside";
import { useAppContext } from "../context/AppContext";
import api from "../api/axios";

export default function ManageUsers() {

    const { isAuthenticated, isAuthLoading, setIsAuthenticated } = useAppContext();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await api.get("/auth/get-users");
                setUsers(response.data.users);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        getUsers();
    }, []);

    const handleDelete = async (userId) => {
        try {
            await api.delete(`/auth/delete-user/${userId}`);
            setUsers(users.filter((user) => user._id !== userId));
        } catch (error) {
            console.log(error);
        }
    };

    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-xl font-semibold">
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex flex-col md:flex-row border-t border-slate-300 py-4 bg-slate-100 min-h-screen">
            <DashboardAside setIsAuthenticated={setIsAuthenticated} />

            <main className="flex flex-col flex-1">
                <div className="flex flex-col gap-4 px-6">
                    <h1 className="text-2xl font-semibold text-center md:text-start text-[#132A36]">
                        MANAGE USERS
                    </h1>

                    <p className="text-sm text-[#104185]">
                        View all registered users and their roles.
                    </p>
                </div>

                {/* Mobile */}
                {loading ? (
                    <div className="md:hidden flex flex-col gap-4 mt-6 px-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-white border rounded-lg p-6 space-y-4 animate-pulse"
                            >
                                <div className="h-4 w-40 bg-gray-200 rounded"></div>
                                <div className="h-4 w-56 bg-gray-200 rounded"></div>
                                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                <div className="h-10 w-24 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="md:hidden flex flex-col gap-4 mt-6 px-6">
                        {users.map((user) => (
                            <div
                                key={user._id}
                                className="bg-white border rounded-lg p-6 space-y-3"
                            >
                                <div>
                                    <p className="text-xs text-slate-500">Name</p>
                                    <p className="font-medium">
                                        {user.firstName} {user.lastName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Email</p>
                                    <p>{user.email}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Username</p>
                                    <p>{user.username}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Role</p>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                            user.is_admin
                                                ? "bg-green-100 text-green-700"
                                                : "bg-slate-200 text-slate-700"
                                        }`}
                                    >
                                        {user.is_admin ? "Admin" : "User"}
                                    </span>
                                </div>
                                <div className="pt-2">
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        className="bg-[#132A36] text-white px-4 py-2 rounded-lg"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Desktop */}
                <div className="hidden md:block px-6 mt-6">
                    <table className="w-full bg-white border border-slate-300">
                        <thead className="bg-slate-200">
                            <tr>
                                <th className="p-4 text-left">Name</th>
                                <th className="p-4 text-left">Email</th>
                                <th className="p-4 text-left">Username</th>
                                <th className="p-4 text-center">Role</th>
                                <th className="p-4 text-center">Delete</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading
                                ? Array.from({ length: 5 }).map((_, i) => (
                                      <tr key={i} className="border-t animate-pulse">
                                          <td className="p-4">
                                              <div className="h-4 w-40 bg-gray-200 rounded"></div>
                                          </td>

                                          <td className="p-4">
                                              <div className="h-4 w-56 bg-gray-200 rounded"></div>
                                          </td>

                                          <td className="p-4">
                                              <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                          </td>

                                          <td className="text-center">
                                              <div className="inline-block h-8 w-20 bg-gray-200 rounded-full"></div>
                                          </td>
                                          
                                          <td className="text-center">
                                               <div className="inline-block h-10 w-24 bg-gray-200 rounded-lg"></div>
                                          </td>
                                      </tr>
                                  ))
                                : users.map((user) => (
                                      <tr key={user._id} className="border-t">
                                          <td className="p-4">
                                              {user.firstName} {user.lastName}
                                          </td>

                                          <td className="p-4">{user.email}</td>

                                          <td className="p-4">{user.username}</td>

                                          <td className="text-center">
                                              <span
                                                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                      user.is_admin
                                                          ? "bg-green-100 text-green-700"
                                                          : "bg-slate-200 text-slate-700"
                                                  }`}
                                              >
                                                  {user.is_admin ? "Admin" : "User"}
                                              </span>
                                          </td>
                                          <td className="text-center">
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="bg-[#132A36] text-sm text-white px-2 py-1 rounded-lg"
                                            >
                                                Delete
                                            </button>
                                          </td>
                                      </tr>
                                  ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}