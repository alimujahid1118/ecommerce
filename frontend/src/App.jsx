import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";

const Homepage = lazy(() => import("./pages/Hompage")) 
const Register = lazy(() => import("./pages/Register"))
const Dashboard = lazy(() => import("./pages/Dashboard")) 
const VerifyEmail = lazy(() => import("./pages/VerifyEmail")) 
const Category = lazy(() => import("./pages/Category")) 

import Header from "./components/Header";
import Footer from "./components/Footer";
const UpdateCategory = lazy(() => import("./pages/UpdateCategory")) 
const Product = lazy(() => import("./pages/Product"))
const AllProducts = lazy(() => import("./pages/AllProducts")) 
const UpdateProduct = lazy(() => import("./pages/UpdateProduct")) 
const ProductDetails = lazy(() => import("./pages/ProductDetails")) 
const Cart = lazy(() => import("./pages/Cart")) 

function App() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">
                <Suspense>
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
                </Suspense>
            </main>

            <Footer />
        </div>
    );
}

export default App;