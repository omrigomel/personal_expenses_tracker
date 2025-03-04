import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { getRecentExpenses, addExpense, getMonthlyExpenses, getExpensesByPeriod } from "./Connectors/api";
import "chart.js/auto";
import { Pie, Bar } from "react-chartjs-2";
import ExternalAPI from "./Connectors/ExternalAPI";


import Sidebar from "./Sidebar";

function Home() {
    const { user, setUser } = useContext(UserContext);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);
    const [expenseBreakdown, setExpenseBreakdown] = useState({});
    const [barChartData, setBarChartData] = useState({
        labels: [],
        datasets: [
            {
                label: "Spent",
                data: [],
                backgroundColor: "#36A2EB",
            },
            {
                label: "Budget",
                data: [],
                backgroundColor: "#FF6384",
            },
        ],
    });
    const [newExpense, setNewExpense] = useState({
        date: new Date().toISOString().split("T")[0],
        category: "",
        description: "",
        amount: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();
    const [isUserLoaded, setIsUserLoaded] = useState(false);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) {
            return "Good Morning";
        } else if (hour < 18) {
            return "Good Afternoon";
        } else {
            return "Good Night";
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate("/login");
        }
        setIsUserLoaded(true);
    }, [navigate, setUser]);

    useEffect(() => {
        const fetchExpenses = async () => {
            if (!user || !user.username) {
                setError("User is not logged in.");
                return;
            }
            try {
                const expenses = await getRecentExpenses(user.username);
                setRecentExpenses(expenses);
            } catch (err) {
                setError(err.message || "Failed to fetch expenses.");
            }
        };

        if (isUserLoaded) {
            fetchExpenses();
        }
    }, [user, isUserLoaded]);

    useEffect(() => {
        const fetchMonthlyData = async () => {
            if (!user || !user.username) return;
            try {
                const expenses = await getMonthlyExpenses(user.username);
                setMonthlyExpenses(expenses.total);
                setExpenseBreakdown(expenses.breakdown);
            } catch (error) {
                console.error("Failed to fetch monthly expenses", error);
            }
        };

        fetchMonthlyData();
    }, [user]);

    useEffect(() => {
        const fetchBarChartData = async () => {
            if (!user || !user.username) return;
            try {
                const period = "last6Months";
                const expensesByPeriod = await getExpensesByPeriod(period, user.username);
                const months = expensesByPeriod.map((item) => item.month || "Unknown");
                const spentData = expensesByPeriod.map((item) => item.spent || 0);
                const budgetData = expensesByPeriod.map((item) => item.budget || 0);

                setBarChartData({
                    labels: months,
                    datasets: [
                        {
                            label: "Spent",
                            data: spentData,
                            backgroundColor: "#FF6384",
                        },
                        {
                            label: "Budget",
                            data: budgetData,
                            backgroundColor: "#36A2EB",
                        },
                    ],
                });
            } catch (error) {
                console.error("Error fetching bar chart data:", error);
            }
        };

        fetchBarChartData();
    }, [user]);

  <input
        type="number"
        min="0" // מאפשר רק ערכים 0 ומעלה
        value={newExpense.amount}
        onChange={(e) =>
            setNewExpense({ ...newExpense, amount: e.target.value })
        }
        className="block w-full p-1 border rounded pb-2 mb-2"
        placeholder="Amount"
    />


    const handleAddExpense = async () => {
        
        const amount = parseFloat(newExpense.amount);
        if (amount < 0) {
            setError("Negative amounts cannot be added");
            setTimeout(() => setError(""), 2500);
            return;
        }

        if (!user || !user.id) {
            setError("User is not logged in.");
            console.log("User ID not found:", user);
            return;
        }


        if (!user || !user.id) {
            setError("User is not logged in.");
            console.log("User ID not found:", user);
            return;
        }

        try {

            await addExpense({
                ...newExpense,
                user_id: user.id,
            });
            setSuccess("Expense added successfully.");
            setTimeout(() => setSuccess(""), 2500);
            setNewExpense({
                date: new Date().toISOString().split("T")[0],
                category: "",
                description: "",
                amount: "",
            });

            // Update recent expenses
            const recent = await getRecentExpenses(user.username);
            setRecentExpenses(recent);

            // Updating monthly budget data (to display Pie Chart)
            const monthlyData = await getMonthlyExpenses(user.username);
            setMonthlyExpenses(monthlyData.total);
            setExpenseBreakdown(monthlyData.breakdown);

            // Updating graph data (e.g., expenses in the last 6 months)
            const period = "last6Months";
            const expensesPeriod = await getExpensesByPeriod(period, user.username);
            const months = expensesPeriod.map((item) => item.month || "Unknown");
            const spentData = expensesPeriod.map((item) => item.spent || 0);
            const budgetData = expensesPeriod.map((item) => item.budget || 0);
            setBarChartData({
                labels: months,
                datasets: [
                    {
                        label: "Spent",
                        data: spentData,
                        backgroundColor: "#FF6384",
                    },
                    {
                        label: "Budget",
                        data: budgetData,
                        backgroundColor: "#36A2EB",
                    },
                ],
            });
        } catch (error) {
            setError(error.message || "Failed to add expense.");
        }
    };

    const pieData = {
        labels: Object.keys(expenseBreakdown),
        datasets: [
            {
                data: Object.values(expenseBreakdown),
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
                hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
            },
        ],
    };

    return (
        <div className="flex w-full min-h-screen bg-gray-100">
            {/*  */}
            <Sidebar activePage="home" />

            {/* */}
            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">
                        {getGreeting()}, {user?.fullname || "Guest"}.
                    </h1>
                </div>

                <div className="bg-white p-6 rounded shadow flex-1">
                    <ExternalAPI />
                </div>

                <div className="flex flex-col md:flex-row gap-8 pt-8">
                    <div className="bg-white p-6 rounded shadow flex-1">
                        <h2 className="text-lg font-bold mb-4">Recent Expenses</h2>
                        <table className="table-auto w-full">
                            <thead>
                            <tr>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Category</th>
                                <th className="px-4 py-2 text-left">Description</th>
                                <th className="px-4 py-2 text-right">Amount</th>
                            </tr>
                            </thead>
                            <tbody>
                            {recentExpenses.map((expense, index) => (
                                <tr key={index} className="border-t">
                                    <td className="px-4 py-2">{expense.date}</td>
                                    <td className="px-4 py-2">{expense.category}</td>
                                    <td className="px-4 py-2">{expense.description}</td>
                                    <td className="px-4 py-2 text-right">
                                        {expense.amount.toFixed(2)}$
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white p-6 rounded shadow flex-1">
                        <h2 className="text-lg font-bold mb-4">Monthly Expense</h2>
                        <div className="grid grid-cols-3 items-center">
                            {/* Expense List in first column */}
                            <div className="text-left">
                                {Object.entries(expenseBreakdown).map(
                                    ([expense, amount], index) => (
                                        <div key={expense} className="flex items-center mb-5">
                                            <div
                                                style={{
                                                    width: "16px",
                                                    height: "16px",
                                                    backgroundColor:
                                                        pieData.datasets[0].backgroundColor[index],
                                                    marginRight: "8px",
                                                }}
                                            ></div>
                                            <span>
                                                {expense}: ${amount}
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                            {/* Centered Pie Chart in the middle column */}
                            <div className="flex justify-center">
                                <div style={{ width: "100%" }}>
                                    <Pie data={pieData} />
                                </div>
                            </div>
                            {/* Empty third column */}
                            <div></div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 pt-8">
                    <div className="bg-white p-6 rounded shadow flex-1">
                        <h2 className="text-lg font-bold mb-2 pb-4">Add New Expense</h2>
                        {error && <p className="text-red-500">{error}</p>}
                        {success && <p className="text-green-500">{success}</p>}
                        <input
                            type="date"
                            value={newExpense.date}
                            onChange={(e) =>
                                setNewExpense({ ...newExpense, date: e.target.value })
                            }
                            className="block w-full p-1 border rounded pb-2 mb-2"
                            placeholder="Date"
                        />
                        <input
                            type="text"
                            value={newExpense.category}
                            onChange={(e) =>
                                setNewExpense({ ...newExpense, category: e.target.value })
                            }
                            className="block w-full p-1 border rounded pb-2 mb-2"
                            placeholder="Category"
                        />
                        <input
                            type="text"
                            value={newExpense.description}
                            onChange={(e) =>
                                setNewExpense({ ...newExpense, description: e.target.value })
                            }
                            className="block w-full p-1 border rounded pb-2 mb-2"
                            placeholder="Description"
                        />
                        <input
                            type="number"
                            value={newExpense.amount}
                            onChange={(e) =>
                                setNewExpense({ ...newExpense, amount: e.target.value })
                            }
                            className="block w-full p-1 border rounded pb-2 mb-2"
                            placeholder="Amount"
                        />
                        <button
                            onClick={handleAddExpense}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-3"
                        >
                            Add Expense
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded shadow flex-1">
                        <h2 className="text-lg font-bold mb-4">Income and Spent</h2>
                        <div style={{ width: "75%", margin: "0 left" }}>
                            {barChartData && <Bar data={barChartData} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
