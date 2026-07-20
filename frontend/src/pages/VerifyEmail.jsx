import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function VerifyEmail() {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;

    const [otp, setOtp] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        if (!email) {
            navigate("/accounts/register");
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post("/auth/verify-email", {
                email,
                otp,
            });

            setSuccessMessage(response.data.message);
            setErrorMessage(null);

            setTimeout(() => {
                navigate("/");
            }, 1500);
        } catch (err) {
            setSuccessMessage(null);
            setErrorMessage(
                err.response?.data?.message || "Verification failed."
            );
        }
    };

    if (!email) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6">
            <h1 className="text-3xl font-bold">
                Verify Your Email
            </h1>

            <p>
                Enter the OTP sent to
            </p>

            <p className="font-semibold">
                {email}
            </p>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 w-full max-w-md"
            >
                <input
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="border rounded-lg px-4 py-2"
                />

                <button
                    type="submit"
                    className="bg-[#132A36] text-white rounded-lg py-2"
                >
                    Verify Email
                </button>
            </form>

            {successMessage && (
                <div className="bg-green-600 text-white px-4 py-2 rounded-lg">
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="bg-red-600 text-white px-4 py-2 rounded-lg">
                    {errorMessage}
                </div>
            )}
        </div>
    );
}