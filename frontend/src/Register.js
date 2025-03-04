import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "./Connectors/api";

const Register = () => {
    const [fullName, setFullName] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (!fullName || !userName || !email || !password) {
            setError("All fields are required!");
            return;
        }
        setError("");

        try {
            const userData = {
                username: userName,
                fullname: fullName,
                email: email,
                password: password,
            };
            const response = await registerUser(userData);
            console.log("Registration successful:", response);
            setSuccess(true);
        } catch (error) {
            console.error("Registration error:", error);
            setError(error.message || "An error occurred");
        }
    };

    const handleOk = () => {
        setSuccess(false);
        navigate("/login");
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100">
            {success ? (
                <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center">
                    <div className="text-green-500 text-4xl mb-4">✔</div>
                    <h2 className="text-2xl font-bold mb-4">Registration Successful!</h2>
                    <p className="text-gray-600 mb-6">You have successfully registered.</p>
                    <button
                        onClick={handleOk}
                        className="px-6 py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600 transition"
                    >
                        OK
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg flex">
                    {/* Left Section */}
                    <div className="w-1/2 bg-green-500 flex items-center justify-center text-white p-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Create Account</h2>
                            <p>
                                Sign up to manage your expenses and take control of your financial goals!
                            </p>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="w-1/2 p-8">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800">Register</h3>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <form className="space-y-4">
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                            <input
                                type="text"
                                placeholder="User Name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                            <button
                                type="button"
                                onClick={handleRegister}
                                className="w-full py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600 transition"
                            >
                                Register
                            </button>
                        </form>
                        <p className="text-center text-gray-500 text-sm mt-4">
                            Already Have an Account?{" "}
                            <a href="/login" className="text-green-500 underline">
                                Login Account
                            </a>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
