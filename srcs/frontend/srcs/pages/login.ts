import { t } from "../lang";
import { navigate } from "../router";
import { loginRequest, googleLoginRequest } from "../api/auth";
import { config } from "../config";
import { showToast } from "../utils/ui";

declare const google: any;

export function LoginPage()
{
    return `
    <div class="cyber-grid"></div>
    
    <div class="fixed inset-0 bg-gradient-to-b from-transparent via-[#050505]/90 to-[#050505] pointer-events-none -z-1"></div>

    <div class="relative min-h-screen flex items-center justify-center p-4">
     <div class="glass-card p-8 max-w-md w-full rounded-xl border border-white/10">
      <h1 class="text-3xl font-cyber font-bold mb-8 text-center text-white tracking-widest">${t("login")}</h1>

      <form id="loginForm" class="flex flex-col gap-6">

        <div>
          <label class="block mb-2 font-semibold text-gray-400 text-sm tracking-wide">${t("email")}</label>
          <input id="email" type="email"
            class="w-full bg-black/30 border border-white/10 text-white p-3 rounded focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all" />
        </div>

        <div>
          <label class="block mb-2 font-semibold text-gray-400 text-sm tracking-wide">${t("password")}</label>
          <input id="password" type="password"
            class="w-full bg-black/30 border border-white/10 text-white p-3 rounded focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all" />
        </div>

        <label class="flex items-center gap-3 text-gray-400 cursor-pointer group">
          <input id="remember" type="checkbox" class="accent-[#00f3ff] w-4 h-4" />
          <span class="group-hover:text-white transition-colors text-sm">${t("remember_me")}</span>
        </label>

        <button class="btn-neon w-full mt-2 font-cyber font-bold text-center">
          ${t("submit")}
        </button>

        <div class="flex items-center my-4">
            <div class="flex-grow border-t border-white/10"></div>
            <span class="flex-shrink-0 mx-4 text-gray-500 text-xs tracking-widest">${t("or")}</span>
            <div class="flex-grow border-t border-white/10"></div>
        </div>

        <div id="googleLoginBtn" class="w-full flex justify-center grayscale hover:grayscale-0 transition-all duration-300"></div>

      </form>

      <p class="mt-8 text-center text-gray-500 text-sm">
        ${t("no_account")} 
        <a href="/register" data-link class="text-[#00f3ff] hover:text-[#ff00ff] transition-colors ml-1 tracking-wide">${t("register")}</a>
      </p>
    </div>
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
                  const { accessToken, refreshToken } = res;
                  
                  if (!accessToken) throw new Error(t("no_token_error"));
                  
                  // Google login is always treated as "remember me" or we can default to session
                  sessionStorage.setItem("token", accessToken);
                  if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);
                  
                  showToast(t("login_success"), "success");
                  await navigate("/home");
              } catch (err: any) {
                  console.error(err);
                  showToast(err.message || t("google_login_failed"), "error");
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
            const { accessToken, refreshToken } = res;
          
            if (!accessToken) {
              throw new Error(t("no_token_error"));
            }
          
            // Store with consistent key name "token"
            if (remember) {
              localStorage.setItem("token", accessToken);
              if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
            } else {
              sessionStorage.setItem("token", accessToken);
              if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);
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

