import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "./Connectors/api";
import { UserContext } from "./UserContext";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    // useEffect that will check if there is already a user in Local Storage
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            // if user logged in - automatic transition to Home
            navigate("/home");
        }
    }, [navigate]);

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Username and password are required!");
            return;
        }
        setError("");

        try {
            const response = await loginUser({ username, password });


            const userData = {
                id: response.id,
                username: response.username,
                fullname: response.fullname,
                email: response.email,
            };

            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));

            navigate("/home");
        } catch (error) {
            setError(error.message || "Login failed");
        }
    };

    return (
        <div className="h-screen flex">
            {/* Left Section */}
            <div className="w-1/2 bg-green-500 text-white flex flex-col justify-center items-center p-8">
                <h2 className="text-4xl font-bold mb-6">Welcome Back</h2>
                <p className="text-lg mb-6 text-center">
                    Log in to manage your expenses and track your financial goals.
                </p>
            </div>

            {/* Right Section */}
            <div className="w-1/2 bg-gray-100 flex flex-col justify-center items-center p-8">
                <div className="bg-white shadow-md rounded-lg p-8 flex flex-col w-full max-w-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                        Login
                    </h2>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <input
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <button
                        onClick={handleLogin}
                        className="w-full py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600 transition"
                    >
                        Login
                    </button>
                    <p className="text-center text-gray-500 text-sm mt-4">
                        Don't have an account?{" "}
                        <a href="/register" className="text-green-500 underline">
                            Register now
                        </a>
                    </p>
                    <p className="text-center text-gray-500 text-sm mt-4">
                        <a href="/forgot-password" className="text-blue-500 underline">
                            Forgot Password?
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
