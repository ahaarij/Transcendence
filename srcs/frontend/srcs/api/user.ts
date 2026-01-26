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

export function deleteAccount(password?: string) {
    return apiRequest("/auth/account", {
        method: "DELETE",
        body: JSON.stringify({ password })
    });
}

export function getFriends() {
    return apiRequest("/user/friends", {
        method: "GET"
    });
}

export function sendFriendRequest(friendUsername: string) {
    return apiRequest("/user/friends/request", {
        method: "POST",
        body: JSON.stringify({ friendUsername })
    });
}

export function respondToFriendRequest(requestId: number, accept: boolean) {
    return apiRequest("/user/friends/respond", {
        method: "PUT",
        body: JSON.stringify({ requestId, accept })
    });
}

