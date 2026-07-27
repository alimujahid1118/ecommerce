import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom"
import api from "../api/axios.js"

export default function ProductDetails() {

    const [ getProductBySlug, setGetProductBySlug] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ comment, setComment ] = useState(null)
    const { slug } = useParams();

    useEffect(() => {
        const getProduct = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/auth/get-product/${slug}`)
                setGetProductBySlug(response.data)
            } catch (error) {
                console.log(error)
            } finally {
            setLoading(false);
        }
        } 

        getProduct();
    }, [slug])

    if (loading) {
        return (
            <div className="flex flex-col p-4 md:gap-12 animate-pulse">
                {/* Product */}
                <div className="flex flex-col md:flex-row md:w-full items-center justify-center px-4 md:px-20 py-6 gap-8">

                    {/* Image */}
                    <div className="flex md:w-2/4 md:justify-center">
                        <div className="w-72 h-72 md:w-[420px] md:h-[420px] bg-gray-200 rounded-lg"></div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col md:w-2/4 w-full items-center gap-6 md:gap-10">

                        {/* Title */}
                        <div className="h-8 w-72 bg-gray-200 rounded"></div>

                        {/* Info */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                            <div className="h-5 bg-gray-200 rounded"></div>
                            <div className="h-5 bg-gray-200 rounded"></div>
                            <div className="h-5 bg-gray-200 rounded"></div>
                            <div className="h-5 bg-gray-200 rounded"></div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col md:flex-row w-full justify-center gap-4">
                            <div className="h-10 w-full max-w-52 bg-gray-200 rounded-lg"></div>
                            <div className="h-10 w-full max-w-52 bg-gray-200 rounded-lg"></div>
                        </div>

                    </div>
                </div>

                {/* Comment Section */}
                <div className="flex flex-col md:mx-20 border rounded-lg">

                    <div className="h-12 bg-gray-200 rounded-t-lg"></div>

                    <div className="p-4">
                        <div className="flex gap-2">
                            <div className="h-10 flex-1 bg-gray-200 rounded"></div>
                            <div className="w-24 h-10 bg-gray-200 rounded"></div>
                        </div>
                    </div>

                    {/* Comments */}
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div
                            key={i}
                            className="border m-2 p-3 rounded-lg flex flex-col gap-3"
                        >
                            <div className="h-4 w-full bg-gray-200 rounded"></div>
                            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                            <div className="h-3 w-24 ml-auto bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col p-4 md:gap-12">
            <div className="flex flex-col md:flex-row md:w-full items-center justify-center px-4 md:px-20 py-6 gap-8">
                <div className="flex md:w-2/4 md:justify-center">
                    <img src={getProductBySlug?.imageUrl} className="h-48 md:w-auto md:h-auto rounded-lg" />
                </div>
                <div className="flex flex-col md:w-2/4 items-center gap-6 md:gap-10">
                    <h1 className="text-[#132A36] font-bold text-xl md:text-3xl">{getProductBySlug?.name}</h1>
                    <div className="grid grid-cols-2 gap-4 px-4">
                        <p className="text-[#132A36]"><b className="text-[#104185]">Price:</b> ${getProductBySlug?.price}</p>
                        <p className="text-[#132A36]"><b className="text-[#104185]">Stock:</b>  {getProductBySlug?.stock}</p>
                        <p className="text-[#132A36]"><b className="text-[#104185]">Category:</b> {getProductBySlug?.category?.name}</p>
                        <p className="text-[#132A36]"><b className="text-[#104185]">Uploaded By:</b> {getProductBySlug?.author?.firstName} {getProductBySlug?.author?.lastName}</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center md:justify-center w-full gap-2 md:gap-4">
                        <div className="flex flex-row gap-2 bg-[#132A36] text-white justify-center px-4 py-2 w-full max-w-52 rounded-lg">
                            <button className="font-semibold">ADD TO CART</button>
                            <i className="fi fi-rr-shopping-cart-add mt-[3px]"></i>
                        </div>
                        <div className="flex flex-row gap-2 text-[#132A36] border-[1px] border-[#132A36] bg-white justify-center px-4 py-2 w-full max-w-52 rounded-lg">
                            <Link to="/cart" className="font-semibold">VIEW CART</Link>
                            <i className="fi fi-rr-eye mt-[3px]"></i>
                        </div>
                    </div>
                </div>
                
            </div>

            {/* Comment Section */}
            <div className="flex flex-col md:mx-20 border-[1px] border-[#132A36] rounded-lg">
                <h1 className="bg-[#132A36] text-white text-center font-semibold rounded-t-lg py-2">
                    COMMENT SECTION
                </h1>

                <div className="py-4">
                    <form className="flex flex-row gap-2 mx-4 py-2 border-b-[1px] border-[#132A36] text-center">
                        <input type="text" placeholder="Add a comment.." className="md:w-full outline-none focus:outline-none focus:ring-0 focus:border-transparent" />
                        <button className="bg-[#132A36] text-white font-semibold px-6 py-1 rounded-md">SEND</button>
                    </form>
                </div>

                {/* Static Comment */}
                <div className="border-slate-300 border-[1px] p-2 m-2 rounded-lg">
                    <p>I love this product so much.</p>
                    <p className="text-[#132A36]/70 text-sm text-end font-semibold">By Ali Mujahid</p>
                </div>
                <div className="flex flex-col gap-2 border-slate-300 border-[1px] p-2 m-2 rounded-lg">
                    <p>I love this product so much. Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi repellat quos dignissimos maxime natus impedit expedita odit dolores, necessitatibus sequi nam nobis accusamus neque porro deleniti hic, vel omnis veniam.</p>
                    <p className="text-[#132A36]/70 text-sm text-end font-semibold">By Ali Mujahid</p>
                </div>
            </div>
        </div>
    )
}