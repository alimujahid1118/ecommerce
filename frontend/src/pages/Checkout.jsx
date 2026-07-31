import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import api from "../api/axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function Checkout () {

    const { isAuthenticated, setProfileOpen, isAuthLoading } = useAppContext();
    const [userCart, setUserCart] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [billingDetails, setBillingDetails] = useState({
        'firstName': '',
        'lastName': '',
        'email': '',
        'phoneNo': '',
        'addressLine1': '',
        'addressLine2': '',
        'city': '',
        'state': '',
        'country': '',
        'orderNote': ''
    })
    const [searchParams] = useSearchParams();
    const paymentCancelled =
        searchParams.get("payment") === "cancelled";
    const navigate = useNavigate();
    
    useEffect(() => {
        const getCart = async() => {
            setIsLoading(true);
            try {
                const response = await api.get("/get-cart");
                setUserCart(response.data)
            } catch (error) {
                console.log(error)
            } finally {
            setIsLoading(false);
        }
        }
    
        if (isAuthenticated) {
            getCart();
        }
    }, [isAuthenticated])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBillingDetails((prev) => ({...prev, [name]: value}))
    }

    useEffect(() => {
    const stored = localStorage.getItem("billingDetails");

        if (stored) {
            setBillingDetails(JSON.parse(stored));
        }
    }, []);

    const handleSubmit = async (e) => {
        try {
            if (
                !billingDetails.firstName ||
                !billingDetails.lastName ||
                !billingDetails.email ||
                !billingDetails.phoneNo ||
                !billingDetails.addressLine1 ||
                !billingDetails.addressLine2 ||
                !billingDetails.city ||
                !billingDetails.state ||
                !billingDetails.country ||
                !billingDetails.orderNote
            ) {
                alert("Please complete all required fields.");
                return;
            }
            localStorage.setItem("billingDetails", JSON.stringify(billingDetails))
            const response = await api.post("/checkout-session")
            window.location.href = response.data.url

        } catch (error) {
            console.log(error)
            console.log(error.response)
        }
    }

    const total = userCart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );
    
    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            navigate("/");
            setProfileOpen(true);
        }
    }, [isAuthLoading, isAuthenticated, navigate, setProfileOpen]);

    useEffect(() => {
        if (!isLoading && userCart.length === 0) {
            navigate("/cart");
        }
    }, [isLoading, userCart, navigate]);

    useEffect(() => {
        if (paymentCancelled) {
            const timer = setTimeout(() => {
                navigate("/checkout", { replace: true });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [paymentCancelled]);

    return (
        <>
        {paymentCancelled && (
            <div className="mb-4 mx-8 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
                Payment was cancelled. Your billing information has been saved. You can try again.
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-6">
            <div className="bg-white border-[1px] p-4 border-slate-300 rounded-lg text-[#132A36] shadow-md">
                <h1 className="font-semibold text-2xl">Billing Address</h1>
                <form className="flex flex-col py-4 gap-2">
                    <div className="flex flex-col gap-2">
                        <p>First Name</p>
                        <input name="firstName" value={billingDetails.firstName} onChange={handleChange} type="text" placeholder="eg. John" className="border-slate-300 border-[1px] rounded-md p-2" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p>Last Name</p>
                        <input name="lastName" value={billingDetails.lastName} onChange={handleChange} type="text" placeholder="eg. Doe" className="border-slate-300 border-[1px] rounded-md p-2" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p>Email</p>
                        <input name="email" value={billingDetails.email} onChange={handleChange} type="email" placeholder="eg. john@gmail.com" className="border-slate-300 border-[1px] rounded-md p-2" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p>Phone No</p>
                        <input name="phoneNo" value={billingDetails.phoneNo} onChange={handleChange} type="tel" placeholder="eg. 03258706115" className="border-slate-300 border-[1px] rounded-md p-2" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p>Address Line 1</p>
                        <input name="addressLine1" value={billingDetails.addressLine1} onChange={handleChange} type="text" placeholder="eg. 220 St No.7 Neelam Block" className="border-slate-300 border-[1px] rounded-md p-2" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p>Address Line 2</p>
                        <input name="addressLine2" value={billingDetails.addressLine2} onChange={handleChange} type="text" placeholder="eg. Allama Iqbal Town" className="border-slate-300 border-[1px] rounded-md p-2" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p>City</p>
                        <input name="city" type="text" value={billingDetails.city} onChange={handleChange} placeholder="eg. Lahore" className="border-slate-300 border-[1px] rounded-md p-2" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p>State</p>
                        <input name="state" type="text" value={billingDetails.state} onChange={handleChange} placeholder="eg. Punjab" className="border-slate-300 border-[1px] rounded-md p-2" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p>Country</p>
                        <input name="country" type="text" value={billingDetails.country} onChange={handleChange} placeholder="eg. Pakistan" className="border-slate-300 border-[1px] rounded-md p-2" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p>Order Note</p>
                        <textarea name="orderNote" value={billingDetails.orderNote} onChange={handleChange} type="text" placeholder="eg. Additional details.." className="border-slate-300 border-[1px] rounded-md p-2" />
                    </div>
                </form>
            </div>
            {/* Mobile */}
            <div className="md:hidden space-y-4">
            {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                <div
                    key={index}
                    className="border border-slate-300 rounded-lg p-4 bg-white shadow animate-pulse"
                >
                    <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-lg bg-slate-200" />

                    <div className="flex-1 space-y-3">
                        <div className="h-5 w-3/4 rounded bg-slate-200" />
                        <div className="h-4 w-1/3 rounded bg-slate-200" />
                        <div className="h-5 w-1/4 rounded bg-slate-200" />
                    </div>
                    </div>
                </div>
                ))
            ) : (
                <>
                <h1 className="font-semibold text-[#132A36] text-2xl px-2">Items</h1>
                {userCart?.map((item) => (
                    <div
                    key={item._id}
                    className="border border-slate-300 rounded-lg p-4 bg-white shadow"
                    >
                    <div className="flex gap-3">
                        <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-20 h-20 rounded-lg object-cover"
                        />

                        <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>

                        <p className="text-sm text-slate-500">
                            Quantity: {item.quantity}
                        </p>

                        <p className="font-medium">
                            ${item.product.price * item.quantity}
                        </p>
                        </div>
                    </div>
                    </div>
                ))}
                <div className="flex justify-between items-center p-4 border-t border-slate-300 font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex flex-col text-center px-2 pb-2 gap-1">
                    <button onClick={handleSubmit} className="bg-[#132A36] border-[1px] border-[#132A36] rounded-lg text-white font-semibold w-full py-2">Place Order</button>
                    <Link to={`/products`} className="text-[#132A36] border-[1px] border-[#132A36] rounded-lg bg-white font-semibold w-full py-2">Continue Shopping</Link>
                    <Link to={`/cart`} className="text-[#132A36] border-[1px] border-[#132A36] rounded-lg bg-white font-semibold w-full py-2">View Cart</Link>
                </div>
                </>
            )}

            {!isLoading && (
                <div className="flex flex-col text-center px-2 pb-2 gap-1">
                {/* Buttons */}
                </div>
            )}
            </div>

            {/* Desktop */}
            <div className="hidden md:block rounded-lg overflow-hidden self-start border border-slate-300 shadow-md">
                <table className="w-full border-collapse">
                    <thead className="bg-[#132A36] text-white">
                    <tr>
                        <th className="text-left p-4">Product</th>
                        <th className="text-center p-4">Quantity</th>
                        <th className="text-right p-4">Price</th>
                    </tr>
                    </thead>

                    <tbody className="bg-white">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                        <tr key={index} className="border-b border-slate-200 animate-pulse">
                            <td className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-lg bg-slate-200" />

                                <div className="space-y-2 w-full">
                                <div className="h-5 w-48 rounded bg-slate-200" />
                                <div className="h-4 w-28 rounded bg-slate-200" />
                                </div>
                            </div>
                            </td>

                            <td className="text-center">
                            <div className="mx-auto h-5 w-8 rounded bg-slate-200" />
                            </td>

                            <td className="text-right pr-4">
                            <div className="ml-auto h-5 w-16 rounded bg-slate-200" />
                            </td>
                        </tr>
                        ))
                    ) : (
                        userCart.map((item) => (
                        <tr
                            key={item._id}
                            className="border-b last:border-b-0 border-slate-200"
                        >
                            <td className="p-4">
                            <div className="flex items-center gap-4">
                                <img
                                src={item.product.imageUrl}
                                className="w-16 h-16 rounded-lg object-cover"
                                />

                                <p>{item.product.name}</p>
                            </div>
                            </td>

                            <td className="text-center">{item.quantity}</td>

                            <td className="text-right pr-4">
                            ${item.product.price * item.quantity}
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
                <div className="flex justify-between items-center p-4 border-t border-slate-300 font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex flex-col text-center px-2 pb-2 gap-1">
                    <button onClick={handleSubmit} className="bg-[#132A36] border-[1px] border-[#132A36] rounded-lg text-white font-semibold w-full py-2">Place Order</button>
                    <Link to={`/products`} className="text-[#132A36] border-[1px] border-[#132A36] rounded-lg bg-white font-semibold w-full py-2">Continue Shopping</Link>
                    <Link to={`/cart`} className="text-[#132A36] border-[1px] border-[#132A36] rounded-lg bg-white font-semibold w-full py-2">View Cart</Link>
                </div>
            </div>
        </div>
        </>
    )
}