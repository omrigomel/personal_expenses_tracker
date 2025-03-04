import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { getExpensesByPeriodDetailed2 } from "./Connectors/api";
import { Pie } from "react-chartjs-2";
import Sidebar from "./Sidebar";

function MonthlyView() {
    const { user } = useContext(UserContext);
    const { period } = useParams(); // can be "currentDay", "currentMonth", "last6Months", "lastYear"
//    const navigate = useNavigate();

    const [expenses, setExpenses] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) return;

        async function fetchData() {
            try {
                const data = await getExpensesByPeriodDetailed2(period, user.username);
                const detailedExpenses = data.expenses;
                setExpenses(detailedExpenses);

                const categorySums = {};
                detailedExpenses.forEach((exp) => {
                    if (!categorySums[exp.category]) {
                        categorySums[exp.category] = 0;
                    }
                    categorySums[exp.category] += exp.amount;
                });

                const labels = Object.keys(categorySums);
                const amounts = Object.values(categorySums);

                setChartData({
                    labels,
                    datasets: [
                        {
                            data: amounts,
                            backgroundColor: [
                                "#fb083c",
                                "#119bf8",
                                "#f8b81c",
                                "#23eded",
                                "#9966FF",
                                "#969bb5",
                                "#eccc68",
                                "#5805fb",
                                "#22ff12",
                                "#fa9822",
                            ],
                            hoverOffset: 4,
                        },
                    ],
                });
            } catch (err) {
                console.error("Failed to fetch data for this period:", err);
                setError("Could not load data for this period.");
            }
        }
        fetchData();
    }, [period, user]);

    if (!user) {
        return <p>Please log in to view data.</p>;
    }

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    if (!chartData) {
        return <p>Loading data for {period}...</p>;
    }

    const getTitle = () => {
        if (period === "currentDay") return "Current Day";
        if (period === "currentMonth") return "Current Month";
        if (period === "last6Months") return "Last 6 Months";
        if (period === "lastYear") return "Last Year";
        return period;
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar activePage="analysis" />

            {/* Main content */}
            <div className="flex-1 p-8 overflow-y-auto flex flex-col">
                <h1 className="text-2xl font-bold mb-6">
                    Detailed View - {getTitle()}
                </h1>

                <div className="flex gap-6">
                    {/* All Expenses  */}
                    <div className="bg-white p-3 rounded shadow flex-none w-[700px]">
                        <h2 className="text-lg font-bold mb-4">All Expenses</h2>
                        {expenses.length === 0 ? (
                            <p>No expenses found for this period.</p>
                        ) : (
                            <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="sticky top-0 bg-white z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {expenses.map((exp) => (
                                        <tr key={exp.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(exp.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {exp.category}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {exp.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {exp.amount}$
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Expense Breakdown  */}
                    <div className="bg-white p-6 rounded shadow flex-none w-[600px]">
                        <h2 className="text-lg font-bold mb-4">Expense</h2>
                        <Pie style={{ maxHeight: "95%", maxWidth: "100%" }} data={chartData} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MonthlyView;
