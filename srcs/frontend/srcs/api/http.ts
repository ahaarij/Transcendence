export const BASE_URL = "http://localhost:3000";

export async function apiRequest(url: string, options: any = {}) {
  const token =
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken");

  const headers: any = {
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