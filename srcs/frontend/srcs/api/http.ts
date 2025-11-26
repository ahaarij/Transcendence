export async function apiRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`http://localhost:3000${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    credentials: "include", // imp for cookies/session
    ...options
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message || "API Error");
  }

  return res.json();
}