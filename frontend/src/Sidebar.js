import React from "react";
import { useNavigate } from "react-router-dom";

function Sidebar({ activePage }) {
    const navigate = useNavigate();

    // Logout
    const handleLogout = () => {
        // 1) Delete user from LocalStorage
        localStorage.removeItem("user");
        // 2) navigate to login
        navigate("/login");
    };

    return (
        <div className="w-1/6 bg-gray-200 flex flex-col justify-between p-4">
            <div>
                <h2 className="text-xl font-bold mb-4">Expense Tracker</h2>
                <ul className="space-y-2">
                    <li
                        onClick={() => navigate("/home")}
                        className={`cursor-pointer p-2 text-center rounded ${
                            activePage === "home" ? "bg-green-500 text-white" : "bg-white"
                        }`}
                    >
                        Home
                    </li>
                    <li
                        onClick={() => navigate("/analysis")}
                        className={`cursor-pointer p-2 text-center rounded ${
                            activePage === "analysis" ? "bg-green-500 text-white" : "bg-white"
                        }`}
                    >
                        Analysis
                    </li>
                    <li
                        onClick={() => navigate("/chatandrecommendations")}
                        className={`cursor-pointer p-2 text-center rounded ${
                            activePage === "chatAndRec" ? "bg-green-500 text-white" : "bg-white"
                        }`}
                    >
                        Chat &amp; Recommendation
                    </li>
                </ul>
            </div>

            <div className="space-y-2">
                {/* button Account */}
                <button
                    onClick={() => navigate("/account")}
                    className={`w-full p-2 rounded text-white hover:bg-blue-600 ${
                        activePage === "account" ? "bg-blue-500" : "bg-blue-400"
                    }`}
                >
                    Account
                </button>

                {/* button Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
