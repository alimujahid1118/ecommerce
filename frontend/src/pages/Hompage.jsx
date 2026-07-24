import discountBanner from "../assets/discount-banner.png";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom"

export default function Homepage() {

    const { category, getProducts } = useAppContext();

    return (
        <>
            {/* Categories */}
            
            <div className="overflow-x-auto scrollbar-hide">
                <div className="py-6 flex flex-row min-w-max justify-center gap-6 px-3">
                    {
                        category?.map((eachCategory) => (
                            <Link to={`/products?category=${eachCategory.slug}`} key={eachCategory._id} className="flex flex-col items-center gap-1">
                                <img src={eachCategory.imageUrl} alt="" className="border-[1px] border-slate-300 w-24 h-20 md:w-32 md:h-24 object-cover rounded-lg"/>
                                <p className="text-xs font-semibold">{eachCategory.name}</p>
                            </Link>
                        ))
                    }
                </div>
            </div>

            {/* Sponsored - Banner Image */}
            <div className="flex flex-col items-center px-10">
                <img src={discountBanner} alt="discount-banner" className="w-auto mx-6 rounded-lg"/>
            </div>

            {/* Store features */}

            <div className="grid grid-cols-2 px-6 py-6 items-center gap-4">
                <div className="flex flex-col border-[1px] rounded-lg border-[#244e65] items-center justify-center text-center h-40 px-6 shadow-lg">
                    <i className="fi fi-rr-shipping-fast text-[#104185] text-3xl"></i>
                    <p className="text-[#132A36] font-semibold mb-2">Express Delivery</p>
                    <p className="text-[#104185] text-xs">All over Country</p>
                </div>
                <div className="flex flex-col border-[1px] rounded-lg border-[#244e65] items-center justify-center text-center h-40 px-6 shadow-lg">
                    <i className="fi fi-rr-feedback-alt text-[#104185] text-3xl"></i>
                    <p className="text-[#132A36] font-semibold mb-2">Positive Feedback</p>
                    <p className="text-[#104185] text-xs">99% Customer satisfaction rate</p>
                </div>
                <div className="flex flex-col border-[1px] rounded-lg border-[#244e65] items-center justify-center text-center h-40 px-6 shadow-lg">
                    <i className="fi fi-rr-restock text-[#104185] text-3xl"></i>
                    <p className="text-[#132A36] font-semibold mb-2">Easy Return and refunds</p>
                    <p className="text-[#104185] text-xs">Amazon delivery charges apply</p>
                </div>
                <div className="flex flex-col border-[1px] rounded-lg border-[#244e65] items-center justify-center text-center h-40 px-6 shadow-lg">
                    <i className="fi fi-rr-chart-mixed-up-circle-dollar text-[#104185] text-3xl"></i>
                    <p className="text-[#132A36] font-semibold mb-2">Cost saving</p>
                    <p className="text-[#104185] text-xs">Excellent Price & Sales</p>
                </div>
            </div>

            {/* Products */}
            <div className="flex flex-col items-center py-6 px-2">
                <div className="flex flex-row items-center justify-center gap-2 md:gap-0">
                    <div className="flex flex-col text-center">
                        <h2 className="text-3xl font-bold text-[#132A36]">Featured Products</h2>
                        <h3 className="text-md text-[#104185]">Our most selling items</h3>
                    </div>
                    <Link to="/products" className="text-xs md:absolute md:right-10 md:text-md md:font-semibold md:justify-end px-4 py-2 border-[1px] border-[#132A36] rounded-lg">All Products</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 py-6 w-full">
                    {getProducts?.map((product) => (
                        <div
                            key={product._id}
                            className="flex flex-col gap-2 items-center p-4 border shadow-lg rounded-lg h-full"
                        >
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-40 h-40 object-contain"
                            />

                            <p
                                className="mt-3 text-[#132A36] font-bold text-center w-full"
                            >
                                {product.name.length > 30
                                ? `${product.name.slice(0, 30)}..`
                                : product.name}
                            </p>

                            <div className="mt-auto w-full">
                                <p className="text-[#104185] text-md font-semibold text-center mb-2">
                                    ${product.price}
                                </p>

                                <Link to={`/product/${product.slug}`} className="flex justify-center w-full bg-[#132A36] py-2 rounded-lg text-white">
                                    View details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}