var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const BASE_URL = "http://localhost:3000";
export function apiRequest(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, options = {}) {
        const token = localStorage.getItem("authToken") ||
            sessionStorage.getItem("authToken");
        const headers = Object.assign({ "Content-Type": "application/json" }, (token ? { Authorization: `Bearer ${token}` } : {}));
        const res = yield fetch(BASE_URL + url, Object.assign(Object.assign({}, options), { headers }));
        if (!res.ok) {
            const err = yield res.json();
            throw new Error(err.error || "Unknown error");
        }
        return res.json();
    });
}
