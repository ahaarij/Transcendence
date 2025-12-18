import { apiRequest } from "./http";
import { type MatchPayload } from "../game/types";

export async function sendMatchResult(matchData: MatchPayload) {
    return await apiRequest("/game/match",{
        method : "POST",
        body: JSON.stringify(matchData),
    });
}

export async function getGameHistory(userId: number) {
    return await apiRequest(`/game/history/${userId}`, {
        method: "GET"
    });
}


