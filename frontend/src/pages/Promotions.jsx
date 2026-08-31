import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import DashboardAside from "../components/DashboardAside";
import { useAppContext } from "../context/AppContext";
import api from "../api/axios";

export default function Promotions() {

    const { isAuthenticated, isAuthLoading, userData } = useAppContext();

    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ title: "", body: "" });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const getPromotions = async () => {
            try {
                const response = await api.get("/notifications/promotions");
                setPromotions(response.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        getPromotions();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            const response = await api.post("/notifications/promotions", formData);
            setPromotions((prev) => [response.data, ...prev]);
            setFormData({ title: "", body: "" });
            setMessage("Promotion sent successfully.");
        } catch (error) {
            setMessage(error.response?.data?.message || "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-xl font-semibold">
                Loading...
            </div>
        );
    }

    if (!isAuthenticated || !userData.is_admin) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex flex-col md:flex-row border-t border-slate-300 py-4 bg-slate-100 min-h-screen">
            <DashboardAside />

            <main className="flex flex-col flex-1 gap-6 px-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold text-center md:text-start text-[#132A36]">
                        PROMOTIONS
                    </h1>
                    <p className="text-sm text-[#104185]">
                        Send a push notification to every user who has notifications enabled.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-4 max-w-lg">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-[#132A36]">Title</label>
                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="20% off AirPods"
                            className="border rounded-lg px-3 py-2"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-[#132A36]">Message</label>
                        <textarea
                            name="body"
                            value={formData.body}
                            onChange={handleChange}
                            placeholder="Grab AirPods at 20% off, today only."
                            className="border rounded-lg px-3 py-2"
                            rows={3}
                            required
                        />
                    </div>

                    {message && <p className="text-sm text-[#104185]">{message}</p>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-[#132A36] text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
                    >
                        {submitting ? "Sending..." : "Send Promotion"}
                    </button>
                </form>

                <div className="bg-white border rounded-lg overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-200">
                            <tr>
                                <th className="p-4 text-left">Title</th>
                                <th className="p-4 text-left">Message</th>
                                <th className="p-4 text-left">Sent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td className="p-4" colSpan={3}>Loading...</td>
                                </tr>
                            ) : promotions.length === 0 ? (
                                <tr>
                                    <td className="p-4" colSpan={3}>No promotions sent yet.</td>
                                </tr>
                            ) : (
                                promotions.map((promo) => (
                                    <tr key={promo._id} className="border-t">
                                        <td className="p-4">{promo.title}</td>
                                        <td className="p-4">{promo.body}</td>
                                        <td className="p-4">
                                            {new Date(promo.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric"
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
