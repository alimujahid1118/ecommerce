import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function NotFound() {
    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
            <SEO
                title="Page Not Found | E Shop"
                description="The page you requested could not be found."
                noindex
            />
            <h1 className="text-3xl font-bold text-[#132A36]">Page not found</h1>
            <p className="text-slate-600">The page you requested does not exist.</p>
            <Link to="/" className="rounded-lg bg-[#132A36] px-5 py-2 font-semibold text-white">
                Return home
            </Link>
        </div>
    );
}
