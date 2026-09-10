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
        const formData = new URLSearchParams();
        const username = data.username || data.email || "";
        formData.append("username", username);
        formData.append("password", data.password || "");

        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            let errorMsg = "Login failed";
            if (typeof error.detail === "string") {
                errorMsg = error.detail;
            } else if (Array.isArray(error.detail)) {
                errorMsg = error.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ");
            } else if (error.detail) {
                errorMsg = JSON.stringify(error.detail);
            }
            throw new Error(errorMsg);
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

    async getRoleRequests(statusFilter?: string) {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const url = statusFilter
            ? `${API_URL}/role-requests?status_filter=${encodeURIComponent(statusFilter)}`
            : `${API_URL}/role-requests`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to fetch role requests");
        }
        return response.json();
    },

    async approveRole(email: string) {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await fetch(`${API_URL}/approve-role`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to approve role");
        }
        return response.json();
    },

    async rejectRole(email: string, reason?: string) {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await fetch(`${API_URL}/reject-role`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email, reason }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to reject role");
        }
        return response.json();
    },

    async promoteUser(email: string, role: string) {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await fetch(`${API_URL}/promote`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email, role }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to promote user");
        }
        return response.json();
    },
};

