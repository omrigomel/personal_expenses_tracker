import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
    const navigate = useNavigate();

    // --- States ---
    const [email, setEmail] = useState("");
    const [recoveryCode, setRecoveryCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // navigate to Login after 5 seconds.
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                navigate("/login");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, navigate]);

    // 1) Sending a single string for forgot-password
    const handleRequestCode = async () => {
        setError("");
        setMessage("");
        console.log("Sending email (raw string):", email);

        try {

            const response = await axios.post(
                "http://localhost:8000/users/forgot-password",
                JSON.stringify(email),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            setMessage(response.data.message);
            setStep(2);
        } catch (err) {
            const errorData = err.response?.data;
            let errMsg = "";

            if (errorData?.detail) {
                if (typeof errorData.detail === "object") {
                    errMsg = JSON.stringify(errorData.detail);
                } else {
                    errMsg = errorData.detail;
                }
            } else {
                errMsg = err.message;
            }
            setError(errMsg);
        }
    };

    // 2) Sending JSON object for reset-password
    const handleResetPassword = async () => {
        setError("");
        setMessage("");

        try {
            const response = await axios.post(
                "http://localhost:8000/users/reset-password",
                {
                    email,
                    recovery_code: recoveryCode,
                    new_password: newPassword,
                    confirm_password: confirmPassword,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            setMessage(response.data.message);

            // If the response contains "Password updated successfully"
            if (response.data.message === "Password updated successfully") {
                setSuccess(true); // move to the success screen.
            }
        } catch (err) {
            const errorData = err.response?.data;
            let errMsg = "";

            if (errorData?.detail) {
                if (typeof errorData.detail === "object") {
                    errMsg = JSON.stringify(errorData.detail);
                } else {
                    errMsg = errorData.detail;
                }
            } else {
                errMsg = err.message;
            }
            setError(errMsg);
        }
    };

    // "OK" button on success screen (allows user to return to manual login)
    const handleOk = () => {
        navigate("/login");
    };


    if (success) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center">
                    <div className="text-green-500 text-4xl mb-4">✔</div>
                    <h2 className="text-2xl font-bold mb-4">Password updated successfully!</h2>
                    <p className="text-gray-600 mb-6">
                        You have successfully updated your password. <br />
                        You will be redirected to the login page in 5 seconds.
                    </p>
                    <button
                        onClick={handleOk}
                        className="px-6 py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600 transition"
                    >
                        OK
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>

            {/*  */}
            {error && <p className="text-red-500 mb-2">{error}</p>}
            {message && <p className="text-green-500 mb-2">{message}</p>}

            {/* Step 1: Enter email*/}
            {step === 1 ? (
                <div className="bg-white p-6 rounded shadow w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">Enter Your Email</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                    />
                    <button
                        onClick={handleRequestCode}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Request Recovery Code
                    </button>

                    {/* Register-style Login link */}
                    <p className="text-center text-gray-500 text-sm mt-4">
                        {" "}
                        <a href="/login" className="text-green-500 underline">
                            Login Account
                        </a>
                    </p>
                </div>
            ) : (
                // Step 2: Enter recovery code and new password
                <div className="bg-white p-6 rounded shadow w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">Reset Your Password</h2>
                    <input
                        type="text"
                        placeholder="Recovery Code"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                    />

                    <button
                        onClick={handleResetPassword}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Reset Password
                    </button>

                    {/* Register-style Login link */}
                    <p className="text-center text-gray-500 text-sm mt-4">
                        Already Have an Account?{" "}
                        <a href="/login" className="text-green-500 underline">
                            Login Account
                        </a>
                    </p>
                </div>
            )}
        </div>
    );
}

export default ForgotPassword;
