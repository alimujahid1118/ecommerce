export default function Footer () {
    return (
        <footer className="flex flex-col bg-[#104185] py-6 px-4 text-white">
            <div className="flex flex-col">
                <img
                    src="/web-logo-footer-256.webp"
                    srcSet="/web-logo-footer-256.webp 1x, /web-logo-footer-512.webp 2x"
                    sizes="256px"
                    alt="E Shop website logo"
                    width={256}
                    height={128}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-64"
                />
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