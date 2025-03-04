const API_BASE_URL = "http://localhost:8000";

/**
 * General function backend request
 * @param {string} endpoint - (api)
 * @param {string} method - ("POST", "GET")
 * @param {Object} [body] - body subject
 * @returns {Object} api answer
 */


async function sendRequest(endpoint, method, body = null) {
    try {
        const options = {
            method,
            headers: {
                "Content-Type": "application/json",
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        const contentType = response.headers.get("Content-Type") || "";
        if (!response.ok) {
            const errorData = contentType.includes("application/json")
                ? await response.json()
                : { detail: "An error occurred" };
            throw new Error(errorData.detail || "An error occurred");
        }

        // Ensure the response is JSON
        if (contentType.includes("application/json")) {
            return await response.json();
        } else {
            throw new Error("Invalid JSON response from server");
        }
    } catch (error) {
        console.error("API Request Error:", error);
        throw error;
    }
}


/**
 * Function for  new user
 * @param {Object} userData { fullname, username, email, password }
 * @returns {Object} answer from server
 */
export async function registerUser(userData) {
    return await sendRequest("/users/", "POST", userData);
}

/**
 * Example function for retrieving user data (extensible)
 * @returns {Object} API answer
 */
export async function getUsers() {
    return await sendRequest("/users/", "GET");
}



export const loginUser = async (credentials) => {
    const response = await fetch("http://localhost:8000/login/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.detail || "Login failed");
    }

    return response.json();
};




export const getRecentExpenses = async (username) => {
    try {
        const response = await fetch(`http://localhost:8000/expenses/recent/${username}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch recent expenses");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching recent expenses:", error);
        throw error;
    }
};

export const addExpense = async (expense) => {
    const response = await fetch(`http://localhost:8000/expenses/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(expense), // שליחת הוצאה כולל user_id
    });
    if (!response.ok) {
        throw new Error("Failed to add expense");
    }
    return await response.json();
};





export async function getExpensesByPeriod(period, username) {
    try {
        const response = await fetch(`http://localhost:8000/expenses/period/${period}?username=${username}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to fetch expenses");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching expenses by period:", error);
        throw error;
    }
}


export const getMonthlyExpenses = async (username) => {
    const response = await fetch(`http://localhost:8000/expenses/monthly/${username}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch monthly expenses");
    }
    return await response.json();
};



export const getAllExpenses = async () => {
    const response = await fetch(`${API_BASE_URL}/expenses/`);
    if (!response.ok) {
        throw new Error("Failed to fetch expenses");
    }
    const data = await response.json();
    return data;
};



export async function updateExpense(expenseId, updatedData) {
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
    });
    if (!response.ok) {
        throw new Error("Failed to update expense");
    }
    return await response.json();
}


export async function deleteExpense(expenseId) {
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error("Failed to delete expense");
    }
    return await response.json();
}


// connectors/api.js
export async function getExpensesByPeriodDetailed2(period, username) {
    const response = await fetch(
        `${API_BASE_URL}/expenses/period_detailed2/${period}?username=${username}`
    );
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch detailed expenses");
    }
    return await response.json();
}
