const API_URL = "http://localhost:8000/api/v1/auth";

export const authService = {
    async register(data: any) {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Registration failed");
        }
        return response.json();
    },

    async login(data: any) {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Login failed");
        }
        const result = await response.json();
        if (result.access_token) {
            localStorage.setItem("token", result.access_token);
        }
        return result;
    },

    logout() {
        localStorage.removeItem("token");
    },

    async getCurrentUser() {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await fetch(`${API_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch user");
        }
        return response.json();
    },
};
