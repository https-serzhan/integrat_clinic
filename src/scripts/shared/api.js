const API_BASE_URL = "http://127.0.0.1:8000";

const api = {
    async fetch(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        const token = localStorage.getItem("token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            let errorMsg = "API request failed";
            try {
                const error = await response.json();
                errorMsg = error.detail || errorMsg;
            } catch (e) {}
            
            if (response.status === 401) {
                // handle unauthorized - maybe redirect to login?
                console.warn("Unauthorized request");
            }
            
            throw new Error(errorMsg);
        }

        return response.json();
    },

    async get(endpoint) {
        return this.fetch(endpoint, { method: "GET" });
    },

    async post(endpoint, body) {
        return this.fetch(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
        });
    }
};

window.api = api; // Global access
