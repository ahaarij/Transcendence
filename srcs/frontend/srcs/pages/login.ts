import { t } from "../lang.js";
import { navigate } from "../router.js";
import { loginRequest, loginWithGoogle } from "../api/auth.js";

export function LoginPage()
{
    return `
     <div class="p-6 max-w-md mx-auto bg-white shadow-lg rounded-xl border border-gray-200 text-black">
      <h1 class="text-3xl font-bold mb-6">${t("login")}</h1>

      <form id="loginForm" class="flex flex-col gap-4">

        <div>
          <label class="block mb-1 font-semibold text-gray-700">${t("email")}</label>
          <input id="email" type="email"
            class="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-200" />
        </div>

        <div>
          <label class="block mb-1 font-semibold text-gray-700">${t("password")}</label>
          <input id="password" type="password"
            class="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-200" />
        </div>

        <label class="flex items-center gap-2 text-gray-700">
          <input id="remember" type="checkbox" />
          <span>Remember me</span>
        </label>

        <button class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow">
          ${t("submit")}
        </button>

        <div class="flex items-center my-2">
            <div class="flex-grow border-t border-gray-300"></div>
            <span class="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
            <div class="flex-grow border-t border-gray-300"></div>
        </div>

        <button id="googleLoginBtn" type="button" class="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg shadow hover:bg-gray-50 flex items-center justify-center gap-2 transition">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5" alt="Google logo" />
            <span>Sign in with Google</span>
        </button>

      </form>

      <p class="mt-4">
        ${t("no_account")}
        <a href="/register" data-link class="text-blue-600 underline">${t("register")}</a>
      </p>
    </div>
    `;
}

export function mountLoginPage() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const googleBtn = document.getElementById("googleLoginBtn");
  if (googleBtn) {
      googleBtn.addEventListener("click", () => {
          loginWithGoogle();
      });
  }

    form.addEventListener("submit", async (e) =>
    {
        e.preventDefault();

        const email = (document.getElementById("email") as HTMLInputElement).value;
        const pass = (document.getElementById("password") as HTMLInputElement).value;
        const remember = (document.getElementById("remember") as HTMLInputElement).checked;

        try 
        {
            const res = await loginRequest(email, pass);
            console.log("Login response:", res); // Debug log
            const token = res.token; // backend returns "token" hopefully
          
            if (!token) {
              throw new Error("No token received from server");
            }
          
            // Store with consistent key name "token"
            if (remember) {
              localStorage.setItem("token", token);
            } else {
              sessionStorage.setItem("token", token);
            }
            
            console.log("Navigating to /home"); // Debug log
            await navigate("/home");
        }     
        catch (err: any)
        {
            alert(err.message);
        }
    });
}

