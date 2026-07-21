import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function DashboardAside({ setIsAuthenticated }) {

    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            const response = await api.post("/auth/logout");
            localStorage.removeItem("accessToken");
            setIsAuthenticated(false)
            navigate("/");
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <aside className="flex flex-col md:shrink-0 md:sticky md:top-28 gap-2 text-[#104185] md:gap-4 m-6 md:m-10 md:w-1/4 h-min border-[1px] border-slate-300 rounded-lg bg-white">
            <Link to='/dashboard' className="px-6 pt-4">
                Dashboard
            </Link>
            <p className="w-full bg-slate-200 py-[0.5px]"></p>
            <div className="px-6">
                My Orders
            </div>
            <p className="w-full bg-slate-200 py-[0.5px]"></p>
            <Link to='/dashboard/category' className="px-6">
                Manage Category
            </Link>
            <p className="w-full bg-slate-200 py-[0.5px]"></p>
            <div className="px-6">
                Edit Profile
            </div>
            <p className="w-full bg-slate-200 py-[0.5px]"></p>
            <div className="px-6">
                Saved Payment Methods
            </div>
            <p className="w-full bg-slate-200 py-[0.5px]"></p>
            <div className="px-6">
                Change Password
            </div>
            <p className="w-full bg-slate-200 py-[0.5px]"></p>
            <div className="flex flex-row gap-2 px-2 py-2 mb-2 mx-2 justify-center bg-[#132A36] text-white font-semibold rounded-md">
                <i className="fi fi-rr-power mt-[3px]"></i>
                <button onClick={handleLogout}> LOG OUT</button>
            </div>
        </aside>
    )
}