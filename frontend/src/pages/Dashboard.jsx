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
        <div className="flex flex-col md:flex-row border-t-[1px] border-slate-300 py-4 bg-slate-100 min-h-screen">
            <DashboardAside 
                setIsAuthenticated={setIsAuthenticated} 
                
            />
            <main className="flex flex-col md:w-3/4 px-6">
                <div className="flex flex-col gap-3">
                    <h1 className="text-2xl font-semibold text-center md:text-start md:pl-4 text-[#132A36]">Dashboard</h1>
                    <p className="text-sm md:hidden text-[#104185] px-2">Welcome back {userData.firstName}. Here is an overview of your account.</p>
                    <Link className="md:hidden flex flex-row gap-2 bg-white text-[#104185] py-1 rounded-lg items-center justify-center border-[1px] border-[#132A36]">
                        <i className="fi fi-rr-cart-shopping-fast mt-[3px]"></i>
                        <p className="font-semibold">Continue Shopping</p>
                    </Link>
                    <div className="hidden md:flex md:flex-row md:items-center md:flex-wrap md:justify-between md:px-2">
                        <p className="text-sm text-[#104185] px-2">Welcome back {userData.firstName}. Here is an overview of your account.</p>
                        <Link to='/products' className="flex flex-row gap-2 px-6 bg-white text-[#104185] py-1 my-2 rounded-lg items-center justify-center border-[1px] border-[#132A36]">
                            <i className="fi fi-rr-cart-shopping-fast mt-[3px]"></i>
                            <p className="font-semibold shrink-0">Continue Shopping</p>
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col md:grid md:grid-cols-3 gap-4 py-4">
                    <div className="flex flex-row md:flex-wrap md:justify-center md:text-center gap-4 bg-white px-6 py-6 items-center md:w-full rounded-md shadow-md">
                        <div className="text-[#104185] text-4xl mt-2">
                            <i className="fi fi-rr-grocery-basket"></i>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-md font-semibold">TOTAL ORDERS</p>
                            <p className="text-lg ml-1 font-semibold">1</p>
                        </div>
                    </div>
                    <div className="flex flex-row md:flex-wrap md:justify-center md:text-center gap-4 bg-white px-6 py-6 items-center md:w-full rounded-md shadow-md">
                        <div className="text-[#104185] text-4xl mt-2">
                            <i className="fi fi-rr-piggy-bank"></i>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-md font-semibold">LIFETIME SPEND</p>
                            <p className="text-lg ml-1 font-semibold">$4.99</p>
                        </div>
                    </div>
                    <div className="flex flex-row md:flex-wrap md:justify-center md:text-center gap-4 bg-white px-6 py-6 items-center md:w-full rounded-md shadow-md">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="bg-white flex flex-col shadow-lg p-4 gap-4 rounded-lg">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-[#132A36] font-semibold text-xl">Account Details</h1>
                            <p className="text-slate-500 text-sm">Contact details used for orders and notifications</p>
                        </div>
                        <p className="w-full bg-slate-200 py-[0.5px]"></p>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-1 text-sm">
                                <p className="text-sm font-semibold">Name: </p>
                                <p>{userData.firstName}{" "}{userData.lastName}</p>
                            </div>
                            <div className="flex gap-1 text-sm">
                                <p className="text-sm font-semibold">Email: </p>
                                <p>{userData.email}</p>
                            </div>
                            <div className="flex gap-1 text-sm">
                                <p className="text-sm font-semibold">Username: </p>
                                <p>{userData.username}</p>
                            </div>
                        </div>
                        <p className="w-full bg-slate-200 py-[0.5px]"></p>
                        <Link className="flex flex-row gap-2 justify-center bg-[#104185] text-white font-semibold px-4 py-2 rounded-lg">
                            <i className="fi fi-rr-user-pen mt-[2px]"></i>
                            <p>Edit Profile</p>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 bg-white w-full rounded-lg">
                        <div className="flex flex-col shadow-lg p-4 gap-4">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-[#132A36] font-semibold text-xl">Shortcuts</h1>
                                <p className="text-slate-500 text-sm">Common actions</p>
                            </div>
                            <p className="w-full bg-slate-200 py-[0.5px]"></p>
                            <div className="flex flex-col gap-2">
                                <Link className="flex flex-row justify-between p-2">
                                    <div className="flex flex-row gap-2">
                                        <i className="fi fi-rr-box text-[#104185] mt-[2px]"></i>
                                        <p className="text-[#132A36]">My Orders</p>
                                    </div>
                                    <p className="text-[#132A36]">{">"}</p>
                                </Link>
                                <Link to={"/products"} className="flex flex-row justify-between p-2">
                                    <div className="flex flex-row gap-2">
                                        <i className="fi fi-rr-shopping-bag text-[#104185] mt-[2px]"></i>
                                        <p className="text-[#132A36]">Browse Products</p>
                                    </div>
                                    <p className="text-[#132A36]">{">"}</p>
                                </Link>
                                <Link to={"/cart"} className="flex flex-row justify-between p-2">
                                    <div className="flex flex-row gap-2">
                                        <i className="fi fi-rr-shopping-cart text-[#104185] mt-[2px]"></i>
                                        <p className="text-[#132A36]">Shopping Cart</p>
                                    </div>
                                    <p className="text-[#132A36]">{">"}</p>
                                </Link>
                                <Link className="flex flex-row justify-between p-2">
                                    <div className="flex flex-row gap-2">
                                        <i className="fi fi-rr-credit-card text-[#104185] mt-[2px]"></i>
                                        <p className="text-[#132A36]">Saved Payment Methods</p>
                                    </div>
                                    <p className="text-[#132A36]">{">"}</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div>

                </div>
            </main>
        </div>
    );
}