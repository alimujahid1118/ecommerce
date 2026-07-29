export default function CartSkeleton() {
    return (
        <div className="flex flex-col md:flex-row w-full p-4 md:p-10 gap-6 animate-pulse">

            {/* Left */}
            <div className="w-full md:w-3/4">

                {/* Desktop */}
                <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden">

                    {/* Header */}
                    <div className="grid grid-cols-4 bg-gray-200 p-4">
                        <div className="h-5 bg-gray-300 rounded w-24"></div>
                        <div className="h-5 bg-gray-300 rounded w-20"></div>
                        <div className="h-5 bg-gray-300 rounded w-16"></div>
                        <div></div>
                    </div>

                    {[...Array(3)].map((_, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-4 items-center p-4 border-t"
                        >
                            {/* Product */}
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 bg-gray-300 rounded"></div>

                                <div className="space-y-3">
                                    <div className="h-5 w-48 bg-gray-300 rounded"></div>
                                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                                <div className="w-10 h-8 bg-gray-300 rounded"></div>
                                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <div className="h-5 w-20 bg-gray-300 rounded"></div>
                                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                            </div>

                            {/* Remove */}
                            <div className="flex justify-end">
                                <div className="w-24 h-10 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile */}
                <div className="md:hidden flex flex-col gap-4">
                    {[...Array(3)].map((_, index) => (
                        <div
                            key={index}
                            className="border rounded-lg p-4 flex gap-4"
                        >
                            <div className="w-20 h-20 bg-gray-300 rounded"></div>

                            <div className="flex-1 space-y-3">
                                <div className="h-5 w-40 bg-gray-300 rounded"></div>
                                <div className="h-4 w-24 bg-gray-200 rounded"></div>

                                <div className="flex gap-2">
                                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                                    <div className="w-10 h-8 bg-gray-300 rounded"></div>
                                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                                </div>

                                <div className="h-5 w-20 bg-gray-300 rounded"></div>

                                <div className="w-full h-10 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="w-full md:w-1/4 border rounded-lg p-6 space-y-6 h-fit">

                <div className="flex justify-between">
                    <div className="h-5 w-24 bg-gray-300 rounded"></div>
                    <div className="h-5 w-16 bg-gray-300 rounded"></div>
                </div>

                <div className="h-28 bg-gray-300 rounded"></div>

                <div className="h-11 bg-gray-300 rounded"></div>

                <div className="h-11 bg-gray-200 rounded"></div>

            </div>
        </div>
    );
}