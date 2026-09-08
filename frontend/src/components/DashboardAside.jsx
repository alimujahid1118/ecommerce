import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAppContext } from "../context/AppContext";
import { removeCurrentToken } from "../firebase/tokenSync";
import ConfirmationModal from "./ConfirmationModal";
import { useState } from "react";

export default function DashboardAside() {

    const {setIsAuthenticated, userData } = useAppContext();
    const navigate = useNavigate();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await removeCurrentToken();
            await api.post("/auth/logout");
            setIsAuthenticated(false)
            navigate("/");
        } catch (error) {
            console.log(error)
        } finally { setLoggingOut(false); setConfirmOpen(false); }
    }

    return (
        <aside className="flex flex-col md:shrink-0 md:sticky md:top-28 gap-2 text-[#104185] md:gap-4 m-6 md:m-10 md:w-1/4 h-min border-[1px] border-slate-300 rounded-lg bg-white">
            <Link to='/dashboard' className="px-6 pt-4">
                Dashboard
            </Link>
            <p className="w-full bg-slate-200 py-[0.5px]"></p>
            <Link to='/dashboard/category' className="px-6">
                Categories
            </Link>
            <p className="w-full bg-slate-200 py-[0.5px]"></p>
            <Link to="/dashboard/product" className="px-6">
                Products
            </Link>
            <p className="w-full bg-slate-200 py-[0.5px]"></p>
            <Link to='/dashboard/settings' className="px-6">Edit Profile</Link>
            <p className="w-full bg-slate-200 py-[0.5px]"></p>
            <Link to={`/dashboard/orders`} className="px-6">
                My Orders
            </Link>
            <p className="w-full bg-slate-200 py-[0.5px]"></p>
            <Link to='/dashboard/settings' className="px-6">Change Password</Link>
            {
                userData.is_admin && (
                    <>
                        <p className="w-full bg-slate-200 py-[0.5px]"></p>
                        <Link to="/dashboard/users" className="px-6">
                            Manage Users
                        </Link>
                        <p className="w-full bg-slate-200 py-[0.5px]"></p>
                        <Link to="/dashboard/promotions" className="px-6">
                            Promotions
                        </Link>
                        <p className="w-full bg-slate-200 py-[0.5px]"></p>
                        <Link to="/dashboard/chat" className="px-6">
                            Support Chat
                        </Link>
                    </>
                )
            }
            <p className="w-full bg-slate-200 py-[0.5px]"></p>
            <div className="flex flex-row gap-2 px-2 py-2 mb-2 mx-2 justify-center bg-[#132A36] text-white font-semibold rounded-md">
                <i className="fi fi-rr-power mt-[3px]"></i>
                <button type="button" aria-label="Log out" onClick={() => setConfirmOpen(true)}> LOG OUT</button>
            </div>
            <ConfirmationModal open={confirmOpen} title="Confirm logout" message="Are you sure you want to log out?" confirmLabel="Logout" loading={loggingOut} onCancel={() => setConfirmOpen(false)} onConfirm={handleLogout} />
        </aside>
    )
}