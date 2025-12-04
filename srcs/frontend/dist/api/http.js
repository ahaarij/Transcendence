export const BASE_URL = "http://localhost:3000";
export async function apiRequest(url, options = {}) {
    const token = localStorage.getItem("token") ||
        sessionStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    const res = await fetch(BASE_URL + url, {
        ...options,
        headers,
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Unknown error");
    }
    return res.json();
}
