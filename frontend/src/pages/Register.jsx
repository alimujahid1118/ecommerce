import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register({ setProfileOpen, setIsAuthenticated, setUserData }) {

    const [formData, setFormData] = useState({
        'firstName' : '',
        'lastName' : '',
        'username' : '',
        'email' : '',
        'password' : ''
    });
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name] : value
    }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/auth/register", formData);
            localStorage.setItem("accessToken", response.data.accessToken);
            const user = response.data.user
            setUserData(user)
            setIsAuthenticated(true)
            navigate("/dashboard")

        } catch (err) {
            setErrorMessage(err.response.data.message);
        }
    }

    return (
        <>
            <div className="flex flex-col px-10 py-10">
                <div className="text-[#132A36] flex flex-row gap-2">
                    <Link to='/' className="hover:text-[#132A36]/60">Home</Link> &gt; <p>Create Account</p>
                </div>
                <div className="flex flex-col gap-6 py-10 text-[#132A36] items-center">
                    <h1 className="text-3xl font-semibold">CREATE ACCOUNT</h1>
                    <p className="text-sm">Please register below to create an account</p>

                    {/* User Registration Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full md:max-w-[500px]">
                        <div className="flex flex-col gap-4">
                            <p className="font-semibold">First Name</p>
                            <input name="firstName" value={formData.firstName} onChange={handleChange} type="text" placeholder="eg. John" className="border-[1px] border-slate-300 px-4 py-2 rounded-lg w-full"/>
                        </div>
                        <div className="flex flex-col gap-4">
                            <p className="font-semibold">Last Name</p>
                            <input name="lastName" value={formData.lastName} onChange={handleChange} type="text" placeholder="eg. Doe" className="border-[1px] border-slate-300 px-4 py-2 rounded-lg"/>
                        </div>
                        <div className="flex flex-col gap-4">
                            <p className="font-semibold">Username</p>
                            <input name="username" value={formData.username} onChange={handleChange} type="text" placeholder="eg. john123" className="border-[1px] border-slate-300 px-4 py-2 rounded-lg"/>
                        </div>
                        <div className="flex flex-col gap-4">
                            <p className="font-semibold">Email</p>
                            <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="eg. johndoe@gmail.com" className="border-[1px] border-slate-300 px-4 py-2 rounded-lg"/>
                        </div>
                        <div className="flex flex-col gap-4">
                            <p className="font-semibold">Password</p>
                            <input name="password" value={formData.password} onChange={handleChange} type="password" placeholder="********" className="border-[1px] border-slate-300 px-4 py-2 rounded-lg"/>
                        </div>
                        <button type="submit" className="bg-[#132A36] text-white font-semibold mt-5 py-2 rounded-lg">Register</button>
                    </form>
                </div>

                {/* Response Messages */}
                <div className="flex flex-col items-center pb-4">
                    {
                        errorMessage && (
                            <div className="text-white whitespace-pre-line text-start font-semibold bg-red-600 flex flex-col gap-2 px-4 w-full md:max-w-[500px] py-2 border-[1px] rounded-lg">
                                {errorMessage}
                            </div>
                        )
                    }
                </div>

                <div className="flex flex-col items-center text-center">
                    <p className="text-md mb-4">
                        Already have an account?
                    </p>
                    <Link to='/' onClick={() => {
                        setProfileOpen(true);
                        }} 
                        className="bg-white border-[1px] border-[#132A36] w-full md:max-w-[500px] text-[#132A36] font-semibold py-2 rounded-lg text-center items-center">LOG IN</Link>
                </div>
                
            </div>
        </>
    )
}