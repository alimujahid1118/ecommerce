import Cards from "../assets/cards.webp";
import { data, Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useEffect, useState } from "react";
import api from "../api/axios";
import CartSkeleton from "../components/CartSkeleton";

export default function Cart() {
    const { isAuthenticated } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);
    const [guestCart, setGuestCart] = useState(() => {
        return JSON.parse(localStorage.getItem("cart")) || [];
    });
    const [userCart, setUserCart] = useState([])
    const navigate = useNavigate();

    const handleDecrease = async (item) => {
        if (isAuthenticated) {
            try {
                const existingItem = {
                    id: item._id,
                    product: item.product._id,
                    action: 'decrease'
                }
                const response = await api.put("/update-cart", existingItem);
                setUserCart(prevCart =>
                    prevCart
                        .map(cart =>
                            cart._id === item._id
                                ? { ...cart, quantity: cart.quantity - 1 }
                                : cart
                        )
                        .filter(cart => cart.quantity > 0)
                );
            } catch (error) {
                console.log(error)
            }
        }

        if (!isAuthenticated) {
            const updatedCart = guestCart
                .map((existingItem) =>
                    existingItem.productId === item.productId
                        ? { ...existingItem, quantity: existingItem.quantity - 1 }
                        : existingItem
                )
                .filter((item) => item.quantity > 0);

            setGuestCart(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
        }
        
    };

    const handleRemove = async (item) => {

        if (isAuthenticated) {
            try {
                const response = await api.delete("/remove-cart", {data: {
                    id: item._id,
                    product: item.product._id
                }})
                setUserCart((prevCart) => prevCart.filter((cartItem) => cartItem._id !== item._id))
            } catch (error) {
                console.log(error.response.data)
            }
        }

        if (!isAuthenticated) {
            const updatedCart = guestCart.filter(
                (existingItem) => existingItem.productId !== item.productId
            );

            localStorage.setItem("cart", JSON.stringify(updatedCart));
            setGuestCart(updatedCart);
            }
    };

    const handleIncrease = async (item) => {
        if (isAuthenticated) {
            try {
                const existingItem = {
                    id: item._id,
                    product: item.product._id,
                    action: 'increase'
                }
                const response = await api.put("/update-cart", existingItem);
                setUserCart((prevCart) => 
                prevCart.map((cart) => cart._id === item._id ? {...cart, quantity: cart.quantity + 1} : cart)
                )
            } catch (error) {
                console.log(error)
            }
        }

        if (!isAuthenticated) {
            const updatedCart = guestCart.map((cartItem) =>
                cartItem.productId === item.productId
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            );

            setGuestCart(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
        }
    };

    useEffect(() => {
        const getCart = async() => {
            try {
                setIsLoading(true);
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
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated])

    // ================= GUEST CART =================

    if (isLoading) {
        return <CartSkeleton />;
    }

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col md:flex-row w-full p-4 md:p-10 gap-6">

                {/* Left Section */}
                <div className="w-full md:w-3/4">

                    {/* Desktop */}
                    <div className="hidden md:block overflow-hidden rounded-lg border border-[#132A36]">
                        {guestCart.length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-[#132A36] text-white">
                                    <tr>
                                        <th className="p-4 text-left">PRODUCT</th>
                                        <th className="p-4 text-left">QUANTITY</th>
                                        <th className="p-4 text-left">PRICE</th>
                                        <th className="p-4 text-left"></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {guestCart.map((item) => (
                                        <tr key={item.productId} className="border-b">
                                            <td className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-24 h-24 object-cover"
                                                    />

                                                    <div>
                                                        <p className="font-semibold text-lg text-[#132A36]">
                                                            {item.name.length > 25
                                                                ? `${item.name.slice(0, 25)}...`
                                                                : item.name}
                                                        </p>

                                                        <p className="text-xs font-semibold">
                                                            Category:
                                                            <span className="text-[#104185]">
                                                                {" "}
                                                                {item.category}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleDecrease(item)} className="text-3xl">
                                                        <i className="fi fi-rr-minus-small"></i>
                                                    </button>

                                                    <span className="border border-[#132A36] rounded-lg px-3 py-1 text-lg">
                                                        {item.quantity}
                                                    </span>

                                                    <button onClick={() => handleIncrease(item)} className="text-3xl">
                                                        <i className="fi fi-rr-plus-small"></i>
                                                    </button>
                                                </div>
                                            </td>

                                            <td>
                                                <div>
                                                    <p className="font-semibold">
                                                        ${item.price * item.quantity}
                                                    </p>
                                                    <p className="text-xs">
                                                        ${item.price} each
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <button onClick={() => handleRemove(item)} className="bg-[#132A36] text-white px-4 py-2 rounded-lg">
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-10 text-center font-semibold">
                                Your cart is empty.
                            </div>
                        )}
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden flex flex-col gap-4">
                        {guestCart.length > 0 ? (
                            guestCart.map((item) => (
                                <div
                                    key={item.productId}
                                    className="border border-[#132A36] rounded-lg p-4"
                                >
                                    <div className="flex gap-4">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover"
                                        />

                                        <div className="flex-1">
                                            <p className="font-semibold text-lg text-[#132A36]">
                                                {item.name}
                                            </p>

                                            <p className="text-sm">
                                                Category:
                                                <span className="text-[#104185]">
                                                    {" "}
                                                    {item.category}
                                                </span>
                                            </p>

                                            <div className="flex items-center gap-3 mt-3">
                                                <button onClick={() => handleDecrease(item)} className="text-3xl">
                                                    <i className="fi fi-rr-minus-small"></i>
                                                </button>

                                                <span className="border border-[#132A36] rounded-lg px-3 py-1">
                                                    {item.quantity}
                                                </span>

                                                <button onClick={() => handleIncrease(item)} className="text-3xl">
                                                    <i className="fi fi-rr-plus-small"></i>
                                                </button>
                                            </div>

                                            <div className="mt-3">
                                                <p className="font-semibold">
                                                    ${item.price * item.quantity}
                                                </p>
                                                <p className="text-xs">
                                                    ${item.price} each
                                                </p>
                                            </div>

                                            <button onClick={() => handleRemove(item)} className="w-full mt-4 bg-[#132A36] text-white py-2 rounded-lg">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center font-semibold border rounded-lg">
                                Your cart is empty.
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <div className="w-full md:w-1/4 md:sticky md:top-28 flex flex-col p-6 border border-[#132A36] rounded-lg shadow-lg gap-4 h-fit">
                    <div className="flex justify-between font-semibold">
                        <p>Total Price:</p>
                        <p>
                            $
                            {guestCart.reduce(
                                (total, item) =>
                                    total + item.price * item.quantity,
                                0
                            ).toFixed(2)}
                        </p>
                    </div>

                    <img
                        src={Cards}
                        alt=""
                        className="border-y border-[#132A36]"
                    />

                    <button onClick={() => navigate("/login")} className="w-full bg-[#132A36] text-white py-2 rounded-lg font-semibold">
                        Checkout
                    </button>

                    <Link
                        to="/products"
                        className="w-full text-center border border-[#132A36] text-[#132A36] py-2 rounded-lg font-semibold"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }
        // ================= LOGGED-IN USER CART =================
        return (
            <div className="flex flex-col md:flex-row w-full p-4 md:p-10 gap-6">

                {/* Left Section */}
                <div className="w-full md:w-3/4">

                    {/* Desktop */}
                    <div className="hidden md:block overflow-hidden rounded-lg border border-[#132A36]">
                        {userCart.length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-[#132A36] text-white">
                                    <tr>
                                        <th className="p-4 text-left">PRODUCT</th>
                                        <th className="p-4 text-left">QUANTITY</th>
                                        <th className="p-4 text-left">PRICE</th>
                                        <th className="p-4 text-left"></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {userCart.map((item) => (
                                        <tr key={item._id} className="border-b">
                                            <td className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={item.product.imageUrl}
                                                        alt={item.product.name}
                                                        className="w-24 h-24 object-cover"
                                                    />

                                                    <div>
                                                        <p className="font-semibold text-lg text-[#132A36]">
                                                            {item.product.name.length > 25
                                                                ? `${item.product.name.slice(0, 25)}...`
                                                                : item.product.name}
                                                        </p>

                                                        <p className="text-xs font-semibold">
                                                            Category:
                                                            <span className="text-[#104185]">
                                                                {" "}
                                                                {item.product.category.name}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleDecrease(item)} className="text-3xl">
                                                        <i className="fi fi-rr-minus-small"></i>
                                                    </button>

                                                    <span className="border border-[#132A36] rounded-lg px-3 py-1 text-lg">
                                                        {item.quantity}
                                                    </span>

                                                    <button onClick={() => handleIncrease(item)} className="text-3xl">
                                                        <i className="fi fi-rr-plus-small"></i>
                                                    </button>
                                                </div>
                                            </td>

                                            <td>
                                                <div>
                                                    <p className="font-semibold">
                                                        $
                                                        {(item.product.price * item.quantity).toFixed(2)}
                                                    </p>

                                                    <p className="text-xs">
                                                        ${item.product.price.toFixed(2)} each
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <button onClick={() => handleRemove(item)} className="bg-[#132A36] text-white px-4 py-2 rounded-lg">
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-10 text-center font-semibold">
                                Your cart is empty.
                            </div>
                        )}
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden flex flex-col gap-4">
                        {userCart.length > 0 ? (
                            userCart.map((item) => (
                                <div
                                    key={item._id}
                                    className="border border-[#132A36] rounded-lg p-4"
                                >
                                    <div className="flex gap-4">
                                        <img
                                            src={item.product.imageUrl}
                                            alt={item.product.name}
                                            className="w-20 h-20 object-cover"
                                        />

                                        <div className="flex-1">
                                            <p className="font-semibold text-lg text-[#132A36]">
                                                {item.product.name}
                                            </p>

                                            <p className="text-sm">
                                                Category:
                                                <span className="text-[#104185]">
                                                    {" "}
                                                    {item.product.category.name}
                                                </span>
                                            </p>

                                            <div className="flex items-center gap-3 mt-3">
                                                <button onClick={() => handleDecrease(item)} className="text-3xl">
                                                    <i className="fi fi-rr-minus-small"></i>
                                                </button>

                                                <span className="border border-[#132A36] rounded-lg px-3 py-1">
                                                    {item.quantity}
                                                </span>

                                                <button onClick={() => handleIncrease(item)} className="text-3xl">
                                                    <i className="fi fi-rr-plus-small"></i>
                                                </button>
                                            </div>

                                            <div className="mt-3">
                                                <p className="font-semibold">
                                                    $
                                                    {(item.product.price * item.quantity).toFixed(2)}
                                                </p>

                                                <p className="text-xs">
                                                    ${item.product.price.toFixed(2)} each
                                                </p>
                                            </div>

                                            <button onClick={() => handleRemove(item)} className="w-full mt-4 bg-[#132A36] text-white py-2 rounded-lg">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center font-semibold border rounded-lg">
                                Your cart is empty.
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <div className="w-full md:w-1/4 md:sticky md:top-28 flex flex-col p-6 border border-[#132A36] rounded-lg shadow-lg gap-4 h-fit">
                    <div className="flex justify-between font-semibold">
                        <p>Total Price:</p>

                        <p>
                            $
                            {userCart
                                .reduce(
                                    (total, item) =>
                                        total + item.product.price * item.quantity,
                                    0
                                )
                                .toFixed(2)}
                        </p>
                    </div>

                    <img
                        src={Cards}
                        alt=""
                        className="border-y border-[#132A36]"
                    />

                    <button className="w-full bg-[#132A36] text-white py-2 rounded-lg font-semibold">
                        Checkout
                    </button>

                    <Link
                        to="/products"
                        className="w-full text-center border border-[#132A36] text-[#132A36] py-2 rounded-lg font-semibold"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
}