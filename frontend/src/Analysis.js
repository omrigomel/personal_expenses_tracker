import React, { useState, useEffect, useContext } from "react";
import {
    getAllExpenses,
    updateExpense,
    deleteExpense,
} from "./Connectors/api";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";

import Sidebar from "./Sidebar";
import MonthlyView from "./MonthlyView";

const Analysis = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [allExpenses, setAllExpenses] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

    // Filter states
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");
    const [filterCategories, setFilterCategories] = useState([]);
    const [filterMinAmount, setFilterMinAmount] = useState("");
    const [filterMaxAmount, setFilterMaxAmount] = useState("");

    // Temporary filter states
    const [tempStartDate, setTempStartDate] = useState("");
    const [tempEndDate, setTempEndDate] = useState("");
    const [tempCategories, setTempCategories] = useState([]);
    const [tempMinAmount, setTempMinAmount] = useState("");
    const [tempMaxAmount, setTempMaxAmount] = useState("");

    // delete/update
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [editDate, setEditDate] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editAmount, setEditAmount] = useState("");
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    // Select period
    const [selectedPeriod, setSelectedPeriod] = useState(null);

    // Fetch all expenses (on mount or user change)
    useEffect(() => {
        const fetchAll = async () => {
            if (!user || !user.username) return;
            try {
                const response = await getAllExpenses();
                let expenses = response.expenses;
                // filter
                expenses = expenses.filter((exp) => exp.user_id === user.id);
                // sort
                expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
                setAllExpenses(expenses);
            } catch (err) {
                console.error("Failed to fetch all expenses:", err);
            }
        };
        fetchAll();
    }, [user]);

    // sort
    const handleSort = (key) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    const sortedExpenses = React.useMemo(() => {
        let sortableItems = [...allExpenses];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];
                if (sortConfig.key === "date") {
                    aVal = new Date(aVal);
                    bVal = new Date(bVal);
                }
                if (aVal < bVal) {
                    return sortConfig.direction === "ascending" ? -1 : 1;
                }
                if (aVal > bVal) {
                    return sortConfig.direction === "ascending" ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [allExpenses, sortConfig]);

    const uniqueCategories = React.useMemo(() => {
        return [...new Set(allExpenses.map((exp) => exp.category))];
    }, [allExpenses]);

    // סינון
    const filteredExpenses = React.useMemo(() => {
        return sortedExpenses.filter((exp) => {
            const expDate = new Date(exp.date);

            if (filterStartDate && expDate < new Date(filterStartDate)) return false;
            if (filterEndDate && expDate > new Date(filterEndDate)) return false;

            if (filterCategories.length > 0 && !filterCategories.includes(exp.category)) {
                return false;
            }

            if (filterMinAmount !== "" && exp.amount < parseFloat(filterMinAmount)) return false;
            if (filterMaxAmount !== "" && exp.amount > parseFloat(filterMaxAmount)) return false;

            return true;
        });
    }, [
        sortedExpenses,
        filterStartDate,
        filterEndDate,
        filterCategories,
        filterMinAmount,
        filterMaxAmount,
    ]);

    const applyFilter = () => {
        setFilterStartDate(tempStartDate);
        setFilterEndDate(tempEndDate);
        setFilterCategories(tempCategories);
        setFilterMinAmount(tempMinAmount);
        setFilterMaxAmount(tempMaxAmount);
    };

    const resetFilter = () => {
        setTempStartDate("");
        setTempEndDate("");
        setTempCategories([]);
        setTempMinAmount("");
        setTempMaxAmount("");

        setFilterStartDate("");
        setFilterEndDate("");
        setFilterCategories([]);
        setFilterMinAmount("");
        setFilterMaxAmount("");
    };

    const handleAllExpenseCheckbox = () => {
        if (tempCategories.length === 0) {
            // Already "All expense"
        } else {
            setTempCategories([]);
        }
    };

    const handleCategoryCheckbox = (category) => {
        setTempCategories((prev) => {
            if (prev.includes(category)) {
                return prev.filter((c) => c !== category);
            } else {
                return [...prev, category];
            }
        });
    };

    // check expense update/delete
    const handleRowClick = (expense) => {
        setSelectedExpense(expense);
        setEditDate(expense.date);
        setEditCategory(expense.category);
        setEditDescription(expense.description);
        setEditAmount(expense.amount);
    };

    const handleUpdateExpense = async () => {
        if (!selectedExpense) return;
        try {
            const updatedData = {
                date: editDate,
                category: editCategory,
                description: editDescription,
                amount: parseFloat(editAmount),
                user_id: user.id,
            };
            await updateExpense(selectedExpense.id, updatedData);

            const response = await getAllExpenses();
            let expenses = response.expenses.filter((exp) => exp.user_id === user.id);
            expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
            setAllExpenses(expenses);

            setSelectedExpense(null);
        } catch (err) {
            console.error("Failed to update expense:", err);
        }
    };

    // delete
    const handleDeleteClick = () => {
        setShowConfirmDelete(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedExpense) return;
        try {
            await deleteExpense(selectedExpense.id);

            const response = await getAllExpenses();
            let expenses = response.expenses.filter((exp) => exp.user_id === user.id);
            expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
            setAllExpenses(expenses);

            setSelectedExpense(null);
        } catch (err) {
            console.error("Failed to delete expense:", err);
        } finally {
            setShowConfirmDelete(false);
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmDelete(false);
    };

    return (

        <div className="flex h-screen bg-gray-100">
            <Sidebar activePage="analysis" />

            {/* main */}
            <div className="flex-1 p-8 overflow-y-auto flex flex-col">
                <h1 className="text-2xl font-bold mb-5">General Analysis</h1>

                {/* Cards for periods */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div
                        onClick={() => navigate("/monthlyview/currentDay")}
                        className="bg-white shadow rounded p-4 cursor-pointer hover:bg-gray-100"
                    >
                        <h3 className="font-bold">Current Day</h3>
                        <p>Details for the current Day...</p>
                    </div>
                    <div
                        onClick={() => navigate("/monthlyview/currentMonth")}
                        className="bg-white shadow rounded p-4 cursor-pointer hover:bg-gray-100"
                    >
                        <h3 className="font-bold">Current Month</h3>
                        <p>Details for the current month...</p>
                    </div>
                    <div
                        onClick={() => navigate("/monthlyview/last6Months")}
                        className="bg-white shadow rounded p-4 cursor-pointer hover:bg-gray-100"
                    >
                        <h3 className="font-bold">Last 6 Months</h3>
                        <p>Details for the last six months...</p>
                    </div>
                    <div
                        onClick={() => navigate("/monthlyview/lastYear")}
                        className="bg-white shadow rounded p-4 cursor-pointer hover:bg-gray-100"
                    >
                        <h3 className="font-bold">Last Year</h3>
                        <p>Details for the last year...</p>
                    </div>
                </div>

                {selectedPeriod && <MonthlyView period={selectedPeriod} />}

                {/* Row with All Expenses (left) and Filters (right) */}
                <div className="flex">
                    {/* Table Container */}
                    <div className="w-2/3 bg-white p-6 rounded shadow mr-4"
                         style={{ maxHeight: "1000px" }}
                    >
                        <h2 className="text-lg font-bold mb-4">All Expenses</h2>
                        <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="sticky top-0 bg-white z-10">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort("date")}
                                    >
                                        Date
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort("category")}
                                    >
                                        Category
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort("description")}
                                    >
                                        Description
                                    </th>
                                    <th
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort("amount")}
                                    >
                                        Amount
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {filteredExpenses.length > 0 ? (
                                    filteredExpenses.map((expense) => (
                                        <tr
                                            key={expense.id}
                                            onClick={() => handleRowClick(expense)}
                                            className={
                                                selectedExpense?.id === expense.id
                                                    ? "bg-blue-100 cursor-pointer"
                                                    : "cursor-pointer"
                                            }
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(expense.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {expense.category}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {expense.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {parseFloat(expense.amount).toFixed(2)}$
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-6 py-4 text-center" colSpan="4">
                                            No expenses found.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    <div className="flex-1 bg-white p-6 rounded shadow">
                        <h2 className="text-lg font-bold mb-4">Filters</h2>
                        {/* Date Range */}
                        <div className="mb-6">
                            <div className="flex space-x-4">
                                <div className="flex flex-col w-1/2">
                                    <label className="text-sm font-medium text-gray-700 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={tempStartDate}
                                        onChange={(e) => setTempStartDate(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm"
                                    />
                                </div>
                                <div className="flex flex-col w-1/2">
                                    <label className="text-sm font-medium text-gray-700 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={tempEndDate}
                                        onChange={(e) => setTempEndDate(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Category Checkboxes */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Categories
                            </label>
                            <div className="flex flex-col space-y-2 overflow-y-auto" style={{ maxHeight: "6rem" }}>
                                {/* "All expense" */}
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        checked={tempCategories.length === 0}
                                        onChange={handleAllExpenseCheckbox}
                                    />
                                    <span className="ml-2">All expense</span>
                                </label>
                                {/* Individual categories */}
                                {uniqueCategories.map((cat) => (
                                    <label key={cat} className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            checked={tempCategories.includes(cat)}
                                            onChange={() => handleCategoryCheckbox(cat)}
                                        />
                                        <span className="ml-2">{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Amount Range */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount Range
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    value={tempMinAmount}
                                    onChange={(e) => setTempMinAmount(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Min"
                                />
                                <input
                                    type="number"
                                    value={tempMaxAmount}
                                    onChange={(e) => setTempMaxAmount(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Max"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-4 mt-auto">
                            <button
                                onClick={applyFilter}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Filter
                            </button>
                            <button
                                onClick={resetFilter}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Edit / Delete Form */}
                {selectedExpense && (
                    <div className="bg-white p-6 rounded shadow mt-4">
                        <h3 className="text-lg font-bold mb-4">Edit / Delete Selected Expense</h3>
                        {/* Date (read-only) */}
                        <div className="mb-3">
                            <label className="block font-medium text-sm text-gray-700">
                                Date (Immutable)
                            </label>
                            <input
                                type="text"
                                value={editDate}
                                readOnly
                                className="w-full border p-2 rounded mt-1"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block font-medium text-sm text-gray-700">
                                Category
                            </label>
                            <input
                                type="text"
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="w-full border p-2 rounded mt-1"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block font-medium text-sm text-gray-700">
                                Description
                            </label>
                            <input
                                type="text"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="w-full border p-2 rounded mt-1"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block font-medium text-sm text-gray-700">
                                Amount
                            </label>
                            <input
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="w-full border p-2 rounded mt-1"
                            />
                        </div>
                        <div className="flex space-x-4 mt-4">
                            <button
                                onClick={handleUpdateExpense}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Update
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setSelectedExpense(null)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {showConfirmDelete && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
                        <div className="bg-white p-6 rounded shadow-md">
                            <p className="text-gray-800 mb-4">
                                Are you sure you want to delete this expense?
                            </p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={handleConfirmDelete}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={handleCancelDelete}
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analysis;
