import React, { useState } from "react";
import { sendMessageToOpenAI } from "./Connectors/OpenAIAPI";
import Sidebar from "./Sidebar";

const OpenAiChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    // Function to send a message to the chat (OpenAI)
    const handleSendMessage = async () => {
        if (!input.trim()) return;

        // Add the user's message to the message list
        setMessages((prev) => [...prev, { role: "user", content: input }]);

        // Call the OpenAI API
        const aiResponse = await sendMessageToOpenAI(input);

        // Add the AI reply to the message list
        setMessages((prev) => [...prev, { role: "ai", content: aiResponse }]);

        // Reset the input field
        setInput("");
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar activePage="chat" />

            {/* Chat content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-4 text-center">
                        OpenAI Chat
                    </h1>

                    {/* Chat display area */}
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

                    {/* Input area */}
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
    );
};

export default OpenAiChat;
