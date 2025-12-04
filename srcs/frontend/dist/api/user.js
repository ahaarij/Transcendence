import { apiRequest } from "./http.js";
export function getProfile(username) {
    return apiRequest(`/user/profile/${username}`, {
        method: "GET"
    });
}
export function updateProfile(data) {
    return apiRequest("/user/me", {
        method: "PUT",
        body: JSON.stringify(data)
    });
}
