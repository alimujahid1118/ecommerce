import Headphone from "../assets/gaming-headphones.webp";
import Cards from "../assets/cards.webp";
import { Link } from "react-router-dom"

export default function Cart() {
    return (
        <div className="flex flex-col md:flex-row w-full p-4 md:p-10 gap-6">

            {/* Left Section */}
            <div className="w-full md:w-3/4">

                {/* ================= Desktop Table ================= */}
                <div className="hidden md:block overflow-hidden rounded-lg border border-[#132A36]">
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
                            {[1, 2].map((item) => (
                                <tr key={item} className="border-b">
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={Headphone}
                                                alt=""
                                                className="w-24 h-24 object-cover"
                                            />

                                            <div>
                                                <p className="font-semibold text-lg text-[#132A36]">
                                                    Headphones
                                                </p>

                                                <p className="text-xs font-semibold">
                                                    Category:
                                                    <span className="text-[#104185]">
                                                        {" "}
                                                        Headphones
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="flex items-center gap-2">
                                            <button className="text-3xl">
                                                <i className="fi fi-rr-minus-small"></i>
                                            </button>

                                            <span className="border border-[#132A36] rounded-lg px-3 py-1 text-lg select-none">
                                                3
                                            </span>

                                            <button className="text-3xl">
                                                <i className="fi fi-rr-plus-small"></i>
                                            </button>
                                        </div>
                                    </td>

                                    <td>
                                        <div>
                                            <p className="font-semibold">$30</p>
                                            <p className="text-xs">$10 each</p>
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <button className="bg-[#132A36] text-white px-4 py-2 rounded-lg">
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ================= Mobile Cards ================= */}
                <div className="flex flex-col gap-4 md:hidden">
                    {[1, 2].map((item) => (
                        <div
                            key={item}
                            className="border border-[#132A36] rounded-lg p-4"
                        >
                            <div className="flex gap-4">
                                <img
                                    src={Headphone}
                                    alt=""
                                    className="w-20 h-20 object-cover"
                                />

                                <div className="flex-1">
                                    <p className="font-semibold text-lg text-[#132A36]">
                                        Headphones
                                    </p>

                                    <p className="text-sm">
                                        Category:
                    <span className="text-[#104185]">
                        {" "}
                        Headphones
                    </span>
                        </p>

                        <div className="flex items-center gap-3 mt-3">
                            <button className="text-3xl">
                                <i className="fi fi-rr-minus-small"></i>
                            </button>

                            <span className="border border-[#132A36] rounded-lg px-3 py-1">
                                3
                            </span>

                            <button className="text-3xl">
                                <i className="fi fi-rr-plus-small"></i>
                            </button>
                        </div>

                        <div className="mt-3">
                            <p className="font-semibold">$30</p>
                            <p className="text-xs">$10 each</p>
                        </div>

                        <button className="w-full mt-4 bg-[#132A36] text-white py-2 rounded-lg">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
                    ))}
                </div>
            </div>

            {/* ================= Summary ================= */}
            <div className="w-full md:w-1/4 md:sticky md:top-28 flex flex-col p-6 border border-[#132A36] rounded-lg shadow-lg gap-4 h-fit">
                <div className="flex justify-between font-semibold">
                    <p>Total Price:</p>
                    <p>$30.00</p>
                </div>

                <img
                    src={Cards}
                    alt=""
                    className="border-y border-[#132A36]"
                />

                <button className="w-full bg-[#132A36] text-white py-2 rounded-lg font-semibold">
                    Checkout
                </button>
                <Link to="/products" className="w-full text-center border border-[#132A36] text-[#132A36] py-2 rounded-lg font-semibold">
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}