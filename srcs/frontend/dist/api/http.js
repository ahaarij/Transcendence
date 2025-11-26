var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function apiRequest(path_1) {
    return __awaiter(this, arguments, void 0, function* (path, options = {}) {
        const res = yield fetch(`http://localhost:3000${path}`, Object.assign({ headers: Object.assign({ "Content-Type": "application/json" }, (options.headers || {})), credentials: "include" }, options));
        if (!res.ok) {
            const err = yield res.json().catch(() => ({ message: "Unknown error" }));
            throw new Error(err.message || "API Error");
        }
        return res.json();
    });
}
