import { apiRequest } from "./http";

export function getProfile(username: string) {
    return apiRequest(`/user/profile/${username}`, {
        method: "GET"
    });
}

export function updateProfile(data: { username?: string; avatar?: string }) {
    return apiRequest("/user/me", {
        method: "PUT",
        body: JSON.stringify(data)
    });
}

export function deleteAccount(password: string) {
    return apiRequest("/auth/account", {
        method: "DELETE",
        body: JSON.stringify({ password })
    });
}

