import { t } from "../lang";

// base url for all api requests (uses https for secure communication)
export const BASE_URL = "https://localhost";

export async function apiRequest(url: string, options: any = {}) {
  let token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const headers: any = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  let res = await fetch(BASE_URL + url, {
    ...options,
    headers,
  });

  // If 401, try to refresh token
  if (res.status === 401 && !url.includes("/auth/login")) {
    const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
    
    if (refreshToken) {
      try {
        const refreshRes = await fetch(BASE_URL + "/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken })
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          const newAccessToken = data.accessToken;
          
          // Update storage
          if (localStorage.getItem("token")) {
            localStorage.setItem("token", newAccessToken);
          } else {
            sessionStorage.setItem("token", newAccessToken);
          }

          // Retry original request with new token
          headers.Authorization = `Bearer ${newAccessToken}`;
          res = await fetch(BASE_URL + url, {
            ...options,
            headers,
          });
        } else {
          // Refresh failed - clear everything
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      } catch (e) {
        console.error("Token refresh failed", e);
      }
    }
  }

  if (!res.ok) {
    let errorMessage = t("unknown_error");
    try {
      const text = await res.text();
      if (text) {
        const err = JSON.parse(text);
        errorMessage = err.error || errorMessage;
      }
    } catch {
      // response body is not JSON
    }
    throw new Error(errorMessage);
  }

  // handle empty responses
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return {};
  }

  const text = await res.text();
  if (!text) {
    return {};
  }

  return JSON.parse(text);
}