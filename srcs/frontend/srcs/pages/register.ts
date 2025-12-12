import { t } from "../lang";
import { navigate } from "../router";
import { registerRequest, googleLoginRequest } from "../api/auth";
import { config } from "../config";
import { showToast } from "../utils/ui";

declare const google: any;

export function RegisterPage() {
  return `
    <div class="cyber-grid"></div>
    
    <div class="fixed inset-0 bg-gradient-to-b from-transparent via-[#050505]/90 to-[#050505] pointer-events-none -z-1"></div>

    <div class="relative min-h-screen flex items-center justify-center p-4">
      <div class="glass-card p-8 max-w-md w-full rounded-xl border border-white/10">        
        <h1 class="text-3xl font-cyber font-bold mb-8 text-center text-white tracking-widest">${t("register")}</h1>

        <form id="registerForm" class="flex flex-col gap-5">

          <div>
            <label class="block mb-2 font-semibold text-gray-400 text-sm tracking-wide">${t("username")}</label>
            <input id="username" class="w-full bg-black/30 border border-white/10 text-white p-3 rounded focus:outline-none focus:border-[#ff00ff] focus:shadow-[0_0_10px_rgba(255,0,255,0.2)] transition-all" />
          </div>

          <div>
            <label class="block mb-2 font-semibold text-gray-400 text-sm tracking-wide">${t("email")}</label>
            <input id="email" type="email" class="w-full bg-black/30 border border-white/10 text-white p-3 rounded focus:outline-none focus:border-[#ff00ff] focus:shadow-[0_0_10px_rgba(255,0,255,0.2)] transition-all" />
          </div>

          <div>
            <label class="block mb-2 font-semibold text-gray-400 text-sm tracking-wide">${t("password")}</label>
            <input id="password" type="password" class="w-full bg-black/30 border border-white/10 text-white p-3 rounded focus:outline-none focus:border-[#ff00ff] focus:shadow-[0_0_10px_rgba(255,0,255,0.2)] transition-all" />
          </div>

          <div>
            <label class="block mb-2 font-semibold text-gray-400 text-sm tracking-wide">${t("confirm_password")}</label>
            <input id="confirm" type="password" class="w-full bg-black/30 border border-white/10 text-white p-3 rounded focus:outline-none focus:border-[#ff00ff] focus:shadow-[0_0_10px_rgba(255,0,255,0.2)] transition-all" />
          </div>

          <button class="btn-neon w-full mt-4 font-cyber font-bold text-center hover:!border-[#ff00ff] hover:!text-[#ff00ff] hover:!shadow-[0_0_20px_rgba(255,0,255,0.2)] hover:!bg-[rgba(255,0,255,0.05)]">
            ${t("submit")}
          </button>

          <div class="flex items-center my-2">
            <div class="flex-grow border-t border-white/10"></div>
            <span class="flex-shrink-0 mx-4 text-gray-500 text-xs tracking-widest">${t("or")}</span>
            <div class="flex-grow border-t border-white/10"></div>
          </div>

          <div id="googleRegisterBtn" class="w-full flex justify-center grayscale hover:grayscale-0 transition-all duration-300"></div>

        </form>

        <p class="mt-6 text-center text-gray-500 text-sm">
          ${t("have_account")}
          <a href="/login" data-link class="text-[#ff00ff] hover:text-[#00f3ff] transition-colors ml-1 tracking-wide">${t("login")}</a>
        </p>
      </div>
    </div>
  `;
}

export function mountRegisterPage()
{
	const form = document.getElementById("registerForm");
	if (!form) return;

  // Initialize Google Auth
  if (typeof google !== 'undefined' && document.getElementById("googleRegisterBtn")) {
      google.accounts.id.initialize({
          client_id: config.GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
              try {
                  const res = await googleLoginRequest(response.credential);
                  console.log("Google Register response:", res);
                  const token = res.accessToken;
                  
                  if (!token) throw new Error(t("no_token_error"));
                  
                  sessionStorage.setItem("token", token);
                  
                  showToast(t("register_success"), "success");
                  await navigate("/home");
              } catch (err: any) {
                  console.error(err);
                  showToast(err.message || t("google_register_failed"), "error");
              }
          }
      });
      
      google.accounts.id.renderButton(
          document.getElementById("googleRegisterBtn"),
          { theme: "outline", size: "large", width: "100%", text: "signup_with" }
      );
  }

	form.addEventListener("submit", async (e) =>
	{
    	e.preventDefault();

    	const username = (document.getElementById("username") as HTMLInputElement).value;
    	const email    = (document.getElementById("email") as HTMLInputElement).value;
    	const password = (document.getElementById("password") as HTMLInputElement).value;

    if (!username || !email || !password)
	{	
    	showToast(t("fill_all_fields"), "error");
    	return;
    }

    try 
	{
      await registerRequest(username, email, password);
      
      showToast(t("registration_successful_login"), "success");
      navigate("/lock");
    } 
    catch (err: any) {
      showToast(err.message || t("registration_failed"), "error");
	}
	});
}