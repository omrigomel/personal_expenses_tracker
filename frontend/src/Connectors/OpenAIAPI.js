const BASE_URL = "https://api.openai.com/v1/chat/completions";
const API_KEY = "Enter your api key here"; // הכנס את ה-API Key הנכון

export const sendMessageToOpenAI = async (message) => {
    try {
        console.log("🔍 Sending request to OpenAI...");
        console.log("🔑 API Key:", API_KEY ? "✓ Exists" : "✗ Missing!");

        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + API_KEY
            },
            body: JSON.stringify({
                model: "gpt-4o-mini-2024-07-18",
                messages: [{ role: "user", content: message }],
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("❌ API Error:", errorData);
            return `Error: ${errorData.error.message}`;
        }

        const data = await response.json();
        console.log("✅ AI response:", data);
        return data.choices[0].message.content;
    } catch (error) {
        console.error("❌ Error while performing the request:", error);
        return "Error communicating with AI.";
    }
};

