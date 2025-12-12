import { apiRequest } from "./http";
import { type MatchPayload } from "../game/types";

export async function sendMatchResult(matchData: MatchPayload) {
    return await apiRequest("/game/match",{
        method : "POST",
        body: JSON.stringify(matchData),
    });
}


