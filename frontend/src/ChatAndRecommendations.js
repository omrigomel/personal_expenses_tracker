import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { sendMessageToOpenAI } from "./Connectors/OpenAIAPI";
import AnalystRecommendations from "./Connectors/AnalystRecommendations";

function ChatAndRecommendations() {
    // State for chat (OpenAiChat)
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    // Removed: state and function for fetching Israeli stocks (webscraping)

    // Function to send a message to the chat (OpenAI)
    const handleSendMessage = async () => {
        if (!input.trim()) return;

        // Add the user's message to the message list
        setMessages((prev) => [...prev, { role: "user", content: input }]);

        // Call OpenAI API
        const aiResponse = await sendMessageToOpenAI(input);

        // Add the AI reply to the message list
        setMessages((prev) => [...prev, { role: "ai", content: aiResponse }]);

        // Reset input field
        setInput("");
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar activePage="chatAndRec" />

            {/* Main content */}
            <div className="flex-1 p-6 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4">Chat & Recommendations</h1>

                <div className="flex flex-col gap-8">
                    {/* Chat area */}
                    <div className="bg-white shadow-lg rounded-lg p-4">
                        <h2 className="text-xl font-bold mb-2 text-center">OpenAI Chat</h2>
                        <div className="flex flex-row">
                            {/* Chat area */}
                            <div className="flex-1 mr-4">
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
                        </div>
                    </div>

                    {/* Analyst Recommendations area */}
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
