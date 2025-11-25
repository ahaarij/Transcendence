import { t } from "../lang.js";
export function LoginPage() {
    return `
     <div class="relative min-h-screen flex justify-center items-start pt-20">
        <div class="absolute top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yellow-400 opacity-30 blur-[120px] rounded-full pointer-events-none"></div>
        <div class="relative p-8 max-w-md w-full bg-white rounded-2xl shadow-xl border border-white/10 backdrop-blur-sm">


            <h1 class="text-3xl font-bold mb-6">${t("login")}</h1>

            <form id="loginForm" class="flex flex-col gap-4">

              <div>
                <label class="block mb-1 font-semibold text-gray-700">${t("email")}</label>
                <input 
                  id="email"
                  type="email"
                  class="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2 rounded transition"
                  placeholder="Enter your email"
                />
              </div>

              <div>
              <label class="block mb-1 font-semibold text-gray-700">${t("password")}</label>  
                <input 
                  id="password"
                  type="password"
                  class="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2 rounded transition"
                  placeholder="Enter your password"
                />
              </div>

              <button 
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow transition">
                ${t("login")}
              </button>

              <button 
                class="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg shadow-md transition"
              >
                ${t("google_login")} (placeholder)
              </button>

            </form>

            <p class="mt-4">
              ${t("no_account")} 
              <a href="/register" data-link class="text-blue-600 underline">${t("register")} </a>
              </p>
            </div>
        </div>
    `;
}
export function mountLoginPage() {
    const form = document.getElementById("loginForm");
    if (!form)
        return;
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (!email || !password) {
            alert("Please fill in all fields.");
            return;
        }
        alert("Login form submitted (fake).");
    });
    const googleBtn = document.getElementById("googleBtn");
    googleBtn === null || googleBtn === void 0 ? void 0 : googleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        alert("Google Login placeholder.");
    });
}
