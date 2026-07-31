import { Link, Navigate } from "react-router-dom";
import DashboardAside from "../components/DashboardAside";
import { useAppContext } from "../context/AppContext";

export default function Dashboard () {

    const { isAuthenticated, setIsAuthenticated, userData, isAuthLoading, orders } = useAppContext();

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
                            <p className="text-lg ml-1 font-semibold">{orders? orders.length : 0}</p>
                        </div>
                    </div>
                    <div className="flex flex-row md:flex-wrap md:justify-center md:text-center gap-4 bg-white px-6 py-6 items-center md:w-full rounded-md shadow-md">
                        <div className="text-[#104185] text-4xl mt-2">
                            <i className="fi fi-rr-piggy-bank"></i>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-md font-semibold">LIFETIME SPEND</p>
                            <p className="text-lg ml-1 font-semibold">
                                ${
                                    orders?.reduce((sum, order) => sum + order.total, 0).toFixed(2)
                                }
                            </p>
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
                <div className="flex flex-col bg-white border rounded-lg shadow-md p-4 my-4 gap-4 w-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-[#132A36] font-semibold text-xl">
                                Recent Orders
                            </h1>
                            <p className="text-slate-500 text-sm">
                                Latest activity on your account
                            </p>
                        </div>

                        <Link
                            to={`/dashboard/orders`}
                            className="bg-[#132A36] text-white text-nowrap px-4 py-2 rounded-lg font-semibold"
                        >
                            View All
                        </Link>
                    </div>

                    <div className="h-[1px] bg-slate-200"></div>

                    {orders?.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {orders
                                .slice()
                                .reverse()
                                .slice(0, 5)
                                .map((order) => (
                                    <div
                                        key={order._id}
                                        className="border rounded-lg p-4 hover:border-[#104185] transition"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Order Number
                                                </p>
                                                <p className="font-semibold text-[#132A36]">
                                                    {order.orderNumber}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Date
                                                </p>
                                                <p>
                                                    {new Date(order.createdAt).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Status
                                                </p>

                                                <span
                                                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
                                                        order.orderStatus === "processing"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : order.orderStatus === "shipped"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : order.orderStatus === "delivered"
                                                            ? "bg-green-100 text-green-700"
                                                            : order.orderStatus === "cancelled"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-slate-100 text-slate-700"
                                                    }`}
                                                >
                                                    {order.orderStatus}
                                                </span>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Payment
                                                </p>

                                                <span
                                                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
                                                        order.payment.status === "paid"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                                >
                                                    {order.payment.status}
                                                </span>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">
                                                    Total
                                                </p>
                                                <p className="font-semibold text-lg text-[#132A36]">
                                                    ${order.total.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="py-10 text-center">
                            <i className="fi fi-rr-box-open text-5xl text-slate-400"></i>
                            <p className="mt-4 text-lg font-semibold text-[#132A36]">
                                No orders yet
                            </p>
                            <p className="text-slate-500 mb-4">
                                Once you place an order, it will appear here.
                            </p>

                            <Link
                                to="/products"
                                className="inline-block bg-[#132A36] text-white px-6 py-2 rounded-lg font-semibold"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}