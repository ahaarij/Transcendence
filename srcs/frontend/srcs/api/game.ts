import { apiRequest } from "./http";
import { type MatchPayload } from "../game/types";

export async function sendMatchResult(matchData: MatchPayload) {
    return await apiRequest("/game/match",{
        method : "POST",
        body: JSON.stringify(matchData),
    });
}

// gets game history for user (userId is uuid string)
export async function getGameHistory(userId: string) {
    return await apiRequest(`/game/history/${userId}`, {
        method: "GET"
    });
}


