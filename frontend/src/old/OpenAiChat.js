import React, { useState } from "react";
import { sendMessageToOpenAI } from "./Connectors/OpenAIAPI";
import Sidebar from "./Sidebar";

const OpenAiChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const [stocks, setStocks] = useState([]); // stock storage
    const [loadingStocks, setLoadingStocks] = useState(false); // Stock loading mode

    // 1️⃣ Function to send a message to the chat (OpenAI)
    const handleSendMessage = async () => {
        if (!input.trim()) return;

        // Add the user's message to the message list
        setMessages((prev) => [...prev, { role: "user", content: input }]);

        // OpenAI API
        const aiResponse = await sendMessageToOpenAI(input);

        // Add the AI reply to the message list
        setMessages((prev) => [...prev, { role: "ai", content: aiResponse }]);

        // Reset input field
        setInput("");
    };

    // 2️⃣ Function for top 5 stocks from the server
    const handleFetchIsraelPerformance = async () => {
        setLoadingStocks(true); // loading stock mode
        try {
            const response = await fetch("http://localhost:5001/israel-performance");
            const jsonData = await response.json();

            if (jsonData.error) {
                console.error(jsonData.error);
                setStocks([]);
            } else {

                setStocks(jsonData.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setStocks([]);
        }
        setLoadingStocks(false);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* load sidebar.js  */}
            <Sidebar activePage="chat" />

            {/* Chat content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-4 text-center">
                        OpenAI Chat & Israeli Stocks
                    </h1>

                    {/* Division into two areas chat and stock */}
                    <div className="flex flex-row">
                        {/* Chat area*/}
                        <div className="flex-1 mr-4">
                            <h2 className="text-xl font-bold mb-2">Chat GPT</h2>

                            <div className="h-96 overflow-y-auto p-4 border rounded bg-gray-50">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`mb-2 ${
                                            msg.role === "user" ? "text-right" : "text-left"
                                        }`}
                                    >
                    <span
                        className={`px-3 py-2 rounded-lg inline-block ${
                            msg.role === "user"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-black"
                        }`}
                    >
                      {msg.content}
                    </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex">
                                <input
                                    type="text"
                                    className="flex-1 border border-gray-300 p-2 rounded-l-lg"
                                    placeholder="Type a message..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                />
                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
                                    onClick={handleSendMessage}
                                >
                                    Send
                                </button>
                            </div>
                        </div>

                        {/* stock area */}
                        <div className="flex-1 ml-4">
                            <h2 className="text-xl font-bold mb-2">Top 5 Israeli Stocks</h2>

                            {/* Button to retrieve stock from server*/}
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                onClick={handleFetchIsraelPerformance}
                            >
                                📈 Load Stocks
                            </button>

                            {/* "Loading data..." */}
                            <div className="mt-4">
                                {loadingStocks ? (
                                    <p className="text-center font-semibold text-blue-600">
                                        Loading data...
                                    </p>
                                ) : (
                                    <table className="min-w-full border">
                                        <thead>
                                        <tr>
                                            <th className="border px-4 py-2">#</th>
                                            <th className="border px-4 py-2">Name</th>
                                            <th className="border px-4 py-2">Daily</th>
                                            <th className="border px-4 py-2">Weekly</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {stocks.map((stock, index) => (
                                            <tr key={index}>
                                                <td className="border px-4 py-2">{index + 1}</td>
                                                <td className="border px-4 py-2">{stock.name}</td>
                                                <td className="border px-4 py-2">
                                                    {stock.daily_change}
                                                </td>
                                                <td className="border px-4 py-2">
                                                    {stock.weekly_change}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OpenAiChat;
