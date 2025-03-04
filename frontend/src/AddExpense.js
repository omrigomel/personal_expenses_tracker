import React, { useState, useContext, useEffect } from "react";
import { addExpense } from "./Connectors/api";
import { UserContext } from "./UserContext";

const AddExpense = ({ refreshExpenses }) => {
    const { user } = useContext(UserContext);
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // default date
    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        setDate(today);
    }, []);

    const handleAddExpense = async () => {
        if (!category || !description || !amount || !date) {
            setError("All fields are required!");
            return;
        }
        if (!user || !user.id) {
            setError("User is not logged in.");
            return;
        }

        setError("");
        try {
            const expenseData = {
                date,
                category,
                description,
                amount: parseFloat(amount),
                user_id: user.id,
            };
            await addExpense(expenseData);
            setSuccess(true);
            setCategory("");
            setDescription("");
            setAmount("");

            // refresh tables
            if (refreshExpenses) {
                refreshExpenses();
            }
        } catch (error) {
            setError(error.message || "Failed to add expense.");
        }
    };

    return (
        <div className="p-8 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">Add New Expense</h2>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">Expense added successfully!</p>}
            <div className="space-y-4">
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                    onClick={handleAddExpense}
                    className="w-full py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600"
                >
                    Add Expense
                </button>
            </div>
        </div>
    );
};

export default AddExpense;
