import { Link, Navigate } from "react-router-dom";
import DashboardAside from "../components/DashboardAside";
import { useAppContext } from "../context/AppContext";

export default function Dashboard () {

    const { isAuthenticated, setIsAuthenticated, userData, isAuthLoading } = useAppContext();

    if (isAuthLoading) {
        return <div className="flex flex-col min-h-screen font-semibold text-xl text-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to='/' replace />;
    }

    return (
        <div className="flex flex-col md:flex-row border-t-[1px] border-slate-300 my-5 py-4 bg-slate-100 min-h-screen">
            <DashboardAside 
                setIsAuthenticated={setIsAuthenticated} 
                
            />
            <main className="flex flex-col md:w-3/4 px-6">
                <div className="flex flex-col gap-3">
                    <h1 className="text-2xl font-semibold text-center md:text-start md:pl-4 text-[#132A36]">Dashboard</h1>
                    <p className="text-sm md:hidden text-[#104185] px-2">Welcome back {userData.firstName} Here is an overview of your account.</p>
                    <Link className="md:hidden flex flex-row gap-2 bg-white text-[#104185] py-1 rounded-lg items-center justify-center border-[1px] border-[#132A36]">
                        <i className="fi fi-rr-cart-shopping-fast mt-[3px]"></i>
                        <p className="font-semibold">Continue Shopping</p>
                    </Link>
                    <div className="hidden md:flex md:flex-row md:items-center md:justify-between md:px-2">
                        <p className="text-sm text-[#104185] px-2">Welcome back {userData.firstName} Here is an overview of your account.</p>
                        <Link className="flex flex-row gap-2 px-6 bg-white text-[#104185] py-1 rounded-lg items-center justify-center border-[1px] border-[#132A36]">
                            <i className="fi fi-rr-cart-shopping-fast mt-[3px]"></i>
                            <p className="font-semibold">Continue Shopping</p>
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col gap-4 py-4">
                    <div className="flex flex-row gap-4 bg-white px-6 py-6 items-center rounded-md shadow-md">
                        <div className="text-[#104185] text-4xl mt-2">
                            <i className="fi fi-rr-grocery-basket"></i>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-md font-semibold">TOTAL ORDERS</p>
                            <p className="text-lg ml-1 font-semibold">1</p>
                        </div>
                    </div>
                    <div className="flex flex-row gap-4 bg-white px-6 py-6 items-center rounded-md shadow-md">
                        <div className="text-[#104185] text-4xl mt-2">
                            <i className="fi fi-rr-piggy-bank"></i>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-md font-semibold">LIFETIME SPEND</p>
                            <p className="text-lg ml-1 font-semibold">$4.99</p>
                        </div>
                    </div>
                    <div className="flex flex-row gap-4 bg-white px-6 py-6 items-center rounded-md shadow-md">
                        <div className="text-[#104185] text-4xl mt-2">
                            <i className="fi fi-rr-hr-person"></i>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-md font-semibold">MEMBER SINCE</p>
                            <p className="text-lg ml-1 font-semibold">{new Date(userData.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            })}</p>
                        </div>
                    </div>
                </div>
                <div>

                </div>
                <div>

                </div>
                <div>

                </div>
            </main>
        </div>
    );
}