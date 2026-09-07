export default function Footer () {
    return (
        <footer className="flex flex-col bg-[#104185] py-6 px-4 text-white">
            <div className="flex flex-col">
                <img src="/web-logo2.webp" alt="E Shop website logo" width={800} height={200} className="w-64 h-auto"/>
                <p className="px-5">Premium Tech Accessories, Delivered.</p>
            </div>
            <div className="flex flex-row gap-3 px-5 py-4">
                <i className="fi fi-brands-facebook"></i>
                <i className="fi fi-brands-instagram"></i>
                <i className="fi fi-brands-youtube"></i>
            </div>
            <p className="pt-4 px-5 text-sm text-center">© 2026 E Shop. All rights reserved</p>
        </footer>
    )
}