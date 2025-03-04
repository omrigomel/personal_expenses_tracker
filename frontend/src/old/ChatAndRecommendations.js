import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { sendMessageToOpenAI } from "./Connectors/OpenAIAPI";
import AnalystRecommendations from "./Connectors/AnalystRecommendations";

function ChatAndRecommendations() {
    // === State for chat (OpenAiChat) ===
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    // === State israel stock (OpenAiChat) ===
    const [stocks, setStocks] = useState([]);
    const [loadingStocks, setLoadingStocks] = useState(false);

    // 1️⃣ function for chat sending message (OpenAI)
    const handleSendMessage = async () => {
        if (!input.trim()) return;

        // Add the user's message to the message list
        setMessages((prev) => [...prev, { role: "user", content: input }]);

        // קריאה ל-OpenAI API
        const aiResponse = await sendMessageToOpenAI(input);

        // Add the AI reply to the message list
        setMessages((prev) => [...prev, { role: "ai", content: aiResponse }]);

        // Reset input field
        setInput("");
    };

    // 2️⃣ Function to retrieve the top 5 stocks from the server (Israel)
    const handleFetchIsraelPerformance = async () => {
        setLoadingStocks(true);
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
            {/* Sidebar with activePage="chatAndRec" */}
            <Sidebar activePage="chatAndRec" />

            {/* main */}
            <div className="flex-1 p-6 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4">Chat & Recommendation</h1>

                {/* Divided into two main areas: Chat + Stocks, Analyst Recommendations */}
                <div className="flex flex-col gap-8">
                    {/* 1) Chat area and Israeli stocks */}
                    <div className="bg-white shadow-lg rounded-lg p-4">
                        <h2 className="text-xl font-bold mb-2 text-center">
                            OpenAI Chat & Israeli Stocks
                        </h2>
                        <div className="flex flex-row">
                            {/* chat left side */}
                            <div className="flex-1 mr-4">
                                <h3 className="font-bold mb-2">Chat GPT</h3>
                                <div className="h-72 overflow-y-auto p-4 border rounded bg-gray-50">
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

                            {/* stock right side */}
                            <div className="flex-1 ml-4">
                                <h3 className="font-bold mb-2">Top 5 Israeli Stocks</h3>
                                <button
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mb-4"
                                    onClick={handleFetchIsraelPerformance}
                                >
                                    📈 Load Stocks
                                </button>

                                {loadingStocks ? (
                                    <p className="text-center font-semibold text-blue-600">
                                        Loading data...
                                    </p>
                                ) : (
                                    <table className="min-w-full border text-sm">
                                        <thead>
                                        <tr>
                                            <th className="border px-2 py-1">#</th>
                                            <th className="border px-2 py-1">Name</th>
                                            <th className="border px-2 py-1">Daily</th>
                                            <th className="border px-2 py-1">Weekly</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {stocks.map((stock, index) => (
                                            <tr key={index}>
                                                <td className="border px-2 py-1">{index + 1}</td>
                                                <td className="border px-2 py-1">{stock.name}</td>
                                                <td className="border px-2 py-1">{stock.daily_change}</td>
                                                <td className="border px-2 py-1">{stock.weekly_change}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2) Analyst Recommendations */}
                    <div className="bg-white shadow-lg rounded-lg p-4">
                        <h2 className="text-xl font-bold mb-2 text-center">Analyst Recommendations</h2>
                        <AnalystRecommendations />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatAndRecommendations;
