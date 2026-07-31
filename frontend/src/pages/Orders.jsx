import { Link, Navigate } from "react-router-dom";
import DashboardAside from "../components/DashboardAside";
import { useAppContext } from "../context/AppContext";

export default function Orders() {
    const { orders, isAuthenticated, isAuthLoading, ordersLoading } = useAppContext();

    if (isAuthLoading || ordersLoading) {
        return (
            <div className="flex flex-col md:flex-row border-t border-slate-300 bg-slate-100 min-h-screen">

                <DashboardAside />

                <main className="flex-1 p-6">

                    <div className="mb-6 animate-pulse">
                        <div className="h-8 w-44 bg-slate-200 rounded"></div>
                        <div className="h-4 w-72 bg-slate-200 rounded mt-3"></div>
                    </div>

                    <div className="space-y-5">

                        {Array.from({ length: 3 }).map((_, index) => (

                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-md border border-slate-200 animate-pulse"
                            >

                                {/* Header */}
                                <div className="flex flex-col md:flex-row md:justify-between gap-4 p-5 border-b">

                                    <div className="space-y-3">
                                        <div className="h-3 w-24 bg-slate-200 rounded"></div>
                                        <div className="h-5 w-52 bg-slate-200 rounded"></div>
                                        <div className="h-4 w-36 bg-slate-200 rounded"></div>
                                    </div>

                                    <div className="space-y-3 md:text-right">
                                        <div className="h-4 w-12 bg-slate-200 rounded ml-auto"></div>
                                        <div className="h-7 w-24 bg-slate-200 rounded ml-auto"></div>
                                    </div>

                                </div>

                                {/* Status */}
                                <div className="flex gap-3 px-5 py-4 border-b">

                                    <div className="h-8 w-24 bg-slate-200 rounded-full"></div>
                                    <div className="h-8 w-20 bg-slate-200 rounded-full"></div>

                                </div>

                                {/* Shipping */}
                                <div className="p-5 space-y-3">

                                    <div className="h-5 w-40 bg-slate-200 rounded"></div>

                                    <div className="h-4 w-48 bg-slate-200 rounded"></div>

                                    <div className="h-4 w-64 bg-slate-200 rounded"></div>

                                    <div className="h-4 w-40 bg-slate-200 rounded"></div>

                                    <div className="h-4 w-28 bg-slate-200 rounded"></div>

                                </div>

                            </div>

                        ))}

                    </div>

                </main>

            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex flex-col md:flex-row border-t border-slate-300 bg-slate-100 min-h-screen">

            <DashboardAside />

            <main className="flex-1 p-6">

                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-[#132A36]">
                        My Orders
                    </h1>

                    <p className="text-sm text-slate-500">
                        View your recent purchases and order status.
                    </p>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-10 text-center">
                        <i className="fi fi-rr-box-open text-5xl text-[#104185]"></i>

                        <h2 className="text-xl font-semibold text-[#132A36] mt-4">
                            No Orders Yet
                        </h2>

                        <p className="text-slate-500 mt-2">
                            You haven't placed any orders yet.
                        </p>

                        <Link
                            to="/products"
                            className="inline-block mt-6 bg-[#104185] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#132A36]"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-5">

                        {[...orders].reverse().map((order) => (

                            <div
                                key={order._id}
                                className="bg-white rounded-lg shadow-md border border-slate-200"
                            >

                                {/* Header */}
                                <div className="flex flex-col md:flex-row md:justify-between gap-4 p-5 border-b">

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            ORDER NUMBER
                                        </p>

                                        <h2 className="font-semibold text-[#132A36]">
                                            {order.orderNumber}
                                        </h2>

                                        <p className="text-sm text-slate-500 mt-1">
                                            {new Date(order.createdAt).toLocaleDateString(
                                                "en-US",
                                                {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                }
                                            )}
                                        </p>
                                    </div>

                                    <div className="text-left md:text-right">
                                        <p className="text-sm text-slate-500">
                                            Total
                                        </p>
                                        <p className="text-2xl font-bold text-[#104185]">
                                            ${order.total.toFixed(2)}
                                        </p>
                                    </div>

                                </div>

                                {/* Status */}
                                <div className="flex flex-wrap gap-3 px-5 py-4 border-b">
                                    <p className="text-slate-500">Status:</p>
                                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium capitalize">
                                        {order.orderStatus}
                                    </span>
                                    <p className="text-slate-500">Payment:</p>
                                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium capitalize">
                                        {order.payment.status}
                                    </span>

                                </div>

                                {/* Products Purchased */}
                                <div className="px-5 py-5 border-b">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-semibold text-[#132A36]">
                                            Products Purchased
                                        </h3>

                                        <span className="text-sm text-slate-500">
                                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} Items
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {order.items.map((item) => (
                                            <div key={item.product}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="truncate max-w-[220px]">
                                                        {item.name}
                                                    </span>

                                                    <span className="font-semibold">
                                                        × {item.quantity}
                                                    </span>
                                                </div>

                                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#104185] rounded-full"
                                                        style={{
                                                            width: `${
                                                                (item.quantity /
                                                                    Math.max(
                                                                        ...order.items.map((i) => i.quantity)
                                                                    )) *
                                                                100
                                                            }%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shipping */}
                                <div className="p-5">

                                    <h3 className="font-semibold text-[#132A36] mb-3">
                                        Shipping Address
                                    </h3>

                                    <div className="text-sm text-slate-600 space-y-1">
                                        <p className="font-medium text-[#132A36]">
                                            {order.shippingAddress.fullName}
                                        </p>

                                        <p>{order.shippingAddress.address}</p>

                                        <p>
                                            {order.shippingAddress.city},{" "}
                                            {order.shippingAddress.state}
                                        </p>

                                        <p>{order.shippingAddress.country}</p>
                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>
                )}

            </main>

        </div>
    );
}