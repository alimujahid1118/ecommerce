import { Route, Routes } from "react-router-dom";

import Homepage from "./pages/Hompage";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";
import Category from "./pages/Category";

import Header from "./components/Header";
import Footer from "./components/Footer";
import UpdateCategory from "./pages/UpdateCategory";
import Product from "./pages/Product";
import AllProducts from "./pages/AllProducts";
import UpdateProduct from "./pages/UpdateProduct";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";

function App() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/accounts/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/dashboard/category" element={<Category />} />
                    <Route path="/dashboard/update-category/:slug" element={<UpdateCategory />} />
                    <Route path="/dashboard/product" element={<Product />} />
                    <Route path="/products" element={<AllProducts />} />
                    <Route path="/dashboard/update-product/:slug" element={<UpdateProduct />} />
                    <Route path="/product/:slug" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                </Routes>
            </main>

            <Footer />
        </div>
    );
}

export default App;