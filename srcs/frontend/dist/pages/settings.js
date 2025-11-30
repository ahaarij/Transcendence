var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { navigate } from "../router.js";
import { logoutRequest } from "../api/auth.js";
export function SettingsPage() {
    return `
    <div class="relative min-h-screen flex flex-col items-center pt-20 text-black">

        <h1 class="arcade-title text-white text-6xl md:text-7xl mb-12 drop-shadow-[0_0_15px_rgba(255,255,0,0.8)]">
            Ding Dong
        </h1>

      <div class="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md text-center">
        <h2 class="text-3xl font-bold mb-4">Settings</h2>

        <button 
          id="logoutBtn"
          class="w-full bg-red-500 text-white py-2 rounded-lg mt-4 hover:bg-red-600 transition">
          Logout
        </button>
      </div>
    </div>
  `;
}
export function mountSettingsPage() {
    const btn = document.getElementById("logoutBtn");
    if (btn) {
        btn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield logoutRequest();
            }
            catch (_) { }
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            navigate("/lock");
        }));
    }
}
