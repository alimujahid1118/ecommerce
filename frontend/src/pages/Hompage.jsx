import keyboard from "../assets/keyboard.png";
import discountBanner from "../assets/discount-banner.png";
import { useAppContext } from "../context/AppContext";

export default function Homepage() {

    const { category } = useAppContext();

    return (
        <>
            {/* Search Bar - Mobile */}
            <div className="flex flex-row items-center justify-center mt-2 md:hidden">
                <input className="text-lg border-[1px] border-[#90acd3] py-2 pl-2 rounded-l-md" type="text" placeholder="Search for products.." />
                <i className="fi fi-rr-search bg-[#104185] border-[1px] border-slate-500 py-[10px] px-2 text-white rounded-r-md"></i>
            </div>

            {/* Categories */}
            
            <div className="overflow-x-auto scrollbar-hide">
                <div className="py-6 flex flex-row min-w-max justify-center gap-6 px-3">
                    {
                        category?.map((eachCategory) => (
                            <div key={eachCategory._id} className="flex flex-col items-center gap-1">
                                <img src={eachCategory.imageUrl} alt="" className="border-[1px] border-slate-300 w-24 h-20 md:w-32 md:h-24 object-cover rounded-lg"/>
                                <p className="text-xs font-semibold">{eachCategory.name}</p>
                            </div>
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
            <div className="flex flex-col items-center py-6 px-6">
                <div className="flex flex-col items-center">
                    <h2 className="text-3xl font-bold text-[#132A36]">Products - All</h2>
                    <h3 className="text-md text-[#104185]">Our most selling items</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                    <div className="flex flex-col items-center text-center gap-2 py-6 px-4 border-[1px] shadow-lg rounded-lg">
                        <img src={keyboard} alt="keyboard" />
                        <p className="text-[#132A36] font-bold text-md">Wireless RGB gaming keyboard...</p>
                        <p className="text-[#104185] text-sm font-semibold">Rs 9999</p>
                        <button className="bg-[#132A36] px-4 py-2 w-full rounded-lg text-nowrap text-white">View details</button>
                    </div>
                    <div className="flex flex-col items-center text-center gap-2 py-6 px-4 border-[1px] shadow-lg rounded-lg">
                        <img src={keyboard} alt="keyboard" />
                        <p className="text-[#132A36] font-bold text-md">Wireless RGB gaming keyboard...</p>
                        <p className="text-[#104185] text-sm font-semibold">Rs 9999</p>
                        <button className="bg-[#132A36] px-4 py-2 w-full rounded-lg text-nowrap text-white">View details</button>
                    </div>
                    <div className="flex flex-col items-center text-center gap-2 py-6 px-4 border-[1px] shadow-lg rounded-lg">
                        <img src={keyboard} alt="keyboard" />
                        <p className="text-[#132A36] font-bold text-md">Wireless RGB gaming keyboard...</p>
                        <p className="text-[#104185] text-sm font-semibold">Rs 9999</p>
                        <button className="bg-[#132A36] px-4 py-2 w-full rounded-lg text-nowrap text-white">View details</button>
                    </div>
                    <div className="flex flex-col items-center text-center gap-2 py-6 px-4 border-[1px] shadow-lg rounded-lg">
                        <img src={keyboard} alt="keyboard" />
                        <p className="text-[#132A36] font-bold text-md">Wireless RGB gaming keyboard...</p>
                        <p className="text-[#104185] text-sm font-semibold">Rs 9999</p>
                        <button className="bg-[#132A36] px-4 py-2 w-full rounded-lg text-nowrap text-white">View details</button>
                    </div>
                    <div className="flex flex-col items-center text-center gap-2 py-6 px-4 border-[1px] shadow-lg rounded-lg">
                        <img src={keyboard} alt="keyboard" />
                        <p className="text-[#132A36] font-bold text-md">Wireless RGB gaming keyboard...</p>
                        <p className="text-[#104185] text-sm font-semibold">Rs 9999</p>
                        <button className="bg-[#132A36] px-4 py-2 w-full rounded-lg text-nowrap text-white">View details</button>
                    </div>
                    <div className="flex flex-col items-center text-center gap-2 py-6 px-4 border-[1px] shadow-lg rounded-lg">
                        <img src={keyboard} alt="keyboard" />
                        <p className="text-[#132A36] font-bold text-md">Wireless RGB gaming keyboard...</p>
                        <p className="text-[#104185] text-sm font-semibold">Rs 9999</p>
                        <button className="bg-[#132A36] px-4 py-2 w-full rounded-lg text-nowrap text-white">View details</button>
                    </div>
                </div>
            </div>
        </>
    )
}