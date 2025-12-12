import { apiRequest, BASE_URL } from "./http";

export function loginWithGoogle() {
    window.location.href = `${BASE_URL}/auth/google`;
}

export function loginRequest(email: string, password: string) 
{
    return apiRequest("/auth/login",
    {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
}

export function googleLoginRequest(idToken: string) {
    return apiRequest("/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken })
    });
}

export function registerRequest(username: string, email: string, password: string)
{
    return apiRequest("/auth/register",
    {
        method: "POST",
        body: JSON.stringify({username, email, password })
    });
}

export function logoutRequest()
{
    // Clear tokens on logout
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken");

    return apiRequest("/auth/logout",
    {
        method: "POST"
    });
}

export function meRequest()
{
    const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
    return apiRequest("/auth/me", 
    {
        method: "GET",
        headers:
        {
            "Authorization": `Bearer ${token}`
        }
    });
}