import { t } from "../lang.js";
import { navigate } from "../router.js";
import { registerRequest, loginWithGoogle } from "../api/auth.js";
export function RegisterPage() {
    return `
    <div class="relative min-h-screen flex justify-center items-start pt-20">
      <div class="absolute top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yellow-400 opacity-30 blur-[120px] rounded-full pointer-events-none"></div>
      <div class="relative p-8 max-w-md w-full bg-white rounded-2xl shadow-xl border border-white/10 backdrop-blur-sm">        
        <h1 class="text-3xl font-bold mb-6">${t("register")}</h1>

        <form id="registerForm" class="flex flex-col gap-4">

          <div>
            <label class="block mb-1 font-semibold text-gray-700">${t("username")}</label>
            <input id="username" class="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2 rounded transition" />
          </div>

          <div>
            <label class="block mb-1 font-semibold text-gray-700">${t("email")}</label>
            <input id="email" type="email" class="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2 rounded transition" />
          </div>

          <div>
            <label class="block mb-1 font-semibold text-gray-700">${t("password")}</label>
            <input id="password" type="password" class="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2 rounded transition" />
          </div>

          <div>
            <label class="block mb-1 font-semibold text-gray-700">${t("confirm_password")}</label>
            <input id="confirm" type="password" class="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2 rounded transition" />
          </div>

          <button class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow transition">
            ${t("submit")}
          </button>

          <div class="flex items-center my-2">
            <div class="flex-grow border-t border-gray-300"></div>
            <span class="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
            <div class="flex-grow border-t border-gray-300"></div>
          </div>

          <button id="googleRegisterBtn" type="button" class="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg shadow hover:bg-gray-50 flex items-center justify-center gap-2 transition">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5" alt="Google logo" />
            <span>Sign up with Google</span>
          </button>

        </form>

        <p class="mt-4">
          ${t("have_account")}
          <a href="/login" data-link class="text-blue-600 underline">${t("login")}</a>
        </p>
      </div>
    </div>
  `;
}
export function mountRegisterPage() {
    const form = document.getElementById("registerForm");
    if (!form)
        return;
    const googleBtn = document.getElementById("googleRegisterBtn");
    if (googleBtn) {
        googleBtn.addEventListener("click", () => {
            loginWithGoogle();
        });
    }
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        if (!username || !email || !password) {
            alert("Fill all fields.");
            return;
        }
        try {
            await registerRequest(username, email, password);
            alert("Registration successful! Please login.");
            navigate("/lock");
        }
        catch (err) {
            alert(err.message || "Registration failed");
        }
    });
}
