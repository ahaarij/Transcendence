import { t } from "../lang.js";
import { navigate } from "../router.js";
import { loginRequest, googleLoginRequest } from "../api/auth.js";
import { config } from "../config.js";
import { showToast } from "../utils/ui.js";

declare const google: any;

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

        <div id="googleLoginBtn" class="w-full flex justify-center"></div>

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

  // Initialize Google Auth
  if (typeof google !== 'undefined' && document.getElementById("googleLoginBtn")) {
      google.accounts.id.initialize({
          client_id: config.GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
              try {
                  const res = await googleLoginRequest(response.credential);
                  console.log("Google Login response:", res);
                  const token = res.accessToken;
                  
                  if (!token) throw new Error("No token received from server");
                  
                  // Google login is always treated as "remember me" or we can default to session
                  sessionStorage.setItem("token", token);
                  
                  showToast("Logged in successfully!", "success");
                  await navigate("/home");
              } catch (err: any) {
                  console.error(err);
                  showToast(err.message || "Google login failed", "error");
              }
          }
      });
      
      google.accounts.id.renderButton(
          document.getElementById("googleLoginBtn"),
          { theme: "outline", size: "large", width: "100%" }
      );
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
            const token = res.accessToken; // backend returns "accessToken"
          
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
            showToast("Logged in successfully!", "success");
            await navigate("/home");
        }     
        catch (err: any)
        {
            showToast(err.message, "error");
        }
    });
}

