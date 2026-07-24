import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import api from "../api/axios.js"

export default function ProductDetails() {

    const [ getProductBySlug, setGetProductBySlug] = useState(null);
    const { slug } = useParams();

    useEffect(() => {
        const getProduct = async () => {
            try {
                const response = await api.get(`/auth/get-product/${slug}`)
                setGetProductBySlug(response.data)
            } catch (error) {
                console.log(error)
            }
        }

        getProduct();
    }, [slug])



    return (
        <div className="flex flex-col p-4">
            <div className="flex flex-col items-center justify-center px-4 py-6 gap-8">
                <div className="flex">
                    <img src={getProductBySlug?.imageUrl} className="h-48" />
                </div>
                <h1 className="text-[#132A36] font-bold text-xl">{getProductBySlug?.name}</h1>
                <div className="grid grid-cols-2 gap-4 px-4">
                    <p className="text-[#132A36]"><b className="text-[#104185]">Price:</b> {getProductBySlug?.price}</p>
                    <p className="text-[#132A36]"><b className="text-[#104185]">Stock:</b>  {getProductBySlug?.stock}</p>
                    <p className="text-[#132A36]"><b className="text-[#104185]">Category:</b> {getProductBySlug?.category?.name}</p>
                    <p className="text-[#132A36]"><b className="text-[#104185]">Uploaded By:</b> {getProductBySlug?.author?.firstName} {getProductBySlug?.author?.lastName}</p>
                </div>
                <button className="bg-[#132A36] text-white font-semibold px-4 py-2 w-full max-w-52 rounded-lg">ADD TO CART</button>
            </div>
        </div>
    )
}