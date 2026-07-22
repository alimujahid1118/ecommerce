import { Route, Routes } from "react-router-dom";

import Homepage from "./pages/Hompage";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";
import Category from "./pages/Category";

import Header from "./components/Header";
import Footer from "./components/Footer";
import UpdateCategory from "./pages/UpdateCategory";

function App() {
    return (
        <>
            <Header />

            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/accounts/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/dashboard/category" element={<Category />} />
                <Route path="/dashboard/update-category/:id" element={<UpdateCategory />} />
            </Routes>

            <Footer />
        </>
    );
}

export default App;