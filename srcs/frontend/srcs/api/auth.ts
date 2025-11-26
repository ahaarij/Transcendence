import { apiRequest } from "./http.js";

export function loginRequest(email: string, password: string) 
{
    return apiRequest("/auth/login",
    {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
}

export function registerRequest(username: string, email: string, password: string)
{
    return apiRequest("/auth/register",
    {
        method: "POST",
        body: JSON.stringify({ username, email, password })
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
  return apiRequest("/auth/me");
}