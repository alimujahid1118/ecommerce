import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAppContext } from "../context/AppContext";

export default function PaymentSuccess() {

    const { setOrders } = useAppContext();
    const session_id = new URLSearchParams(location.search).get("session_id");
    const [orderSummary, setOrderSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const billingDetails = JSON.parse(
                    localStorage.getItem("billingDetails")
                );

                const response = await api.post(
                    `/verify-payment?session_id=${session_id}`,
                    billingDetails
                );

                setOrderSummary(response.data);

                localStorage.removeItem("billingDetails");

                setOrders(prev => [...prev, response.data]);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, []);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto py-20 text-center">
                Loading order...
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Success */}
            <div className="bg-green-50 border border-green-300 rounded-xl p-6 text-center">
                <div className="text-6xl">✅</div>

                <h1 className="text-3xl font-bold text-green-700 mt-2">
                    Payment Successful
                </h1>

                <p className="text-slate-600 mt-2">
                    Thank you for your purchase.
                </p>

                <p className="mt-4">
                    <span className="font-semibold">Order Number:</span>{" "}
                    {orderSummary.orderNumber}
                </p>
            </div>

            {/* Details */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
                {/* Shipping */}
                <div className="bg-white border rounded-xl shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Shipping Address
                    </h2>

                    <div className="space-y-1 text-slate-700">
                        <p>{orderSummary.shippingAddress.fullName}</p>
                        <p>{orderSummary.shippingAddress.email}</p>
                        <p>{orderSummary.shippingAddress.phoneNo}</p>
                        <p>{orderSummary.shippingAddress.address}</p>
                        <p>
                            {orderSummary.shippingAddress.city},{" "}
                            {orderSummary.shippingAddress.state}
                        </p>
                        <p>{orderSummary.shippingAddress.country}</p>

                        {orderSummary.shippingAddress.orderNote && (
                            <>
                                <hr className="my-3" />
                                <p>
                                    <span className="font-semibold">
                                        Order Note:
                                    </span>{" "}
                                    {orderSummary.shippingAddress.orderNote}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Payment */}
                <div className="bg-white border rounded-xl shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Payment Details
                    </h2>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span>Status</span>

                            <span className="font-semibold text-green-600 capitalize">
                                {orderSummary.payment.status}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span>Method</span>

                            <span className="capitalize">
                                {orderSummary.payment.method}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span>Order Status</span>

                            <span className="capitalize">
                                {orderSummary.orderStatus}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span>Total Paid</span>

                            <span className="font-bold text-lg">
                                ${orderSummary.total.toFixed(2)}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span>Date</span>

                            <span>
                                {new Date(
                                    orderSummary.createdAt
                                ).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="bg-white border rounded-xl shadow mt-8">
                <div className="border-b p-5">
                    <h2 className="text-2xl font-semibold">
                        Purchased Items
                    </h2>
                </div>

                <div className="divide-y">
                    {orderSummary.items.map((item) => (
                        <div
                            key={item._id || item.product}
                            className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5"
                        >
                            <div className="flex gap-4">
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-24 h-24 rounded-lg object-cover border"
                                />

                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {item.name}
                                    </h3>

                                    <p className="text-slate-500">
                                        Quantity: {item.quantity}
                                    </p>

                                    <p className="text-slate-500">
                                        Price: ${item.price}
                                    </p>
                                </div>
                            </div>

                            <div className="text-xl font-bold">
                                $
                                {(item.price * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t bg-slate-50 p-6 flex justify-between text-xl font-bold">
                    <span>Total</span>

                    <span>${orderSummary.total.toFixed(2)}</span>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row md:justify-end gap-4 mt-8">
                <Link
                    to="/dashboard/orders"
                    className="bg-[#132A36] text-white text-center py-2 px-4 rounded-lg font-semibold"
                >
                    View My Orders
                </Link>

                <Link
                    to="/products"
                    className="border border-[#132A36] text-[#132A36] text-center py-2 px-4 rounded-lg font-semibold"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}