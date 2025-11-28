import { apiRequest } from "./http.js";

export function loginRequest(email: string, password: string) 
{
    return apiRequest("/auth/login",
    {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
}

export function registerRequest(email: string, password: string)
{
    return apiRequest("/auth/register",
    {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
}

export function logoutRequest()
{
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