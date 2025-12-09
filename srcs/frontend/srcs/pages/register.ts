import { t } from "../lang";
import { navigate } from "../router";
import { registerRequest, googleLoginRequest } from "../api/auth";
import { config } from "../config";
import { showToast } from "../utils/ui";

declare const google: any;

export function RegisterPage() {
  return `
    <div class="relative min-h-screen flex justify-center items-start pt-20">
      <div class="absolute top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yellow-400 opacity-30 blur-[120px] rounded-full pointer-events-none"></div>
      <div class="relative p-8 max-w-md w-full bg-white dark:bg-gray-800 dark:text-white rounded-2xl shadow-xl border border-white/10 backdrop-blur-sm">        
        <h1 class="text-3xl font-bold mb-6">${t("register")}</h1>

        <form id="registerForm" class="flex flex-col gap-4">

          <div>
            <label class="block mb-1 font-semibold text-gray-700 dark:text-gray-300">${t("username")}</label>
            <input id="username" class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2 rounded transition" />
          </div>

          <div>
            <label class="block mb-1 font-semibold text-gray-700 dark:text-gray-300">${t("email")}</label>
            <input id="email" type="email" class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2 rounded transition" />
          </div>

          <div>
            <label class="block mb-1 font-semibold text-gray-700 dark:text-gray-300">${t("password")}</label>
            <input id="password" type="password" class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2 rounded transition" />
          </div>

          <div>
            <label class="block mb-1 font-semibold text-gray-700 dark:text-gray-300">${t("confirm_password")}</label>
            <input id="confirm" type="password" class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2 rounded transition" />
          </div>

          <button class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow transition">
            ${t("submit")}
          </button>

          <div class="flex items-center my-2">
            <div class="flex-grow border-t border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"></div>
            <span class="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
            <div class="flex-grow border-t border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"></div>
          </div>

          <div id="googleRegisterBtn" class="w-full flex justify-center"></div>

        </form>

        <p class="mt-4">
          ${t("have_account")}
          <a href="/login" data-link class="text-blue-600 underline">${t("login")}</a>
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
                  
                  if (!token) throw new Error("No token received from server");
                  
                  sessionStorage.setItem("token", token);
                  
                  showToast("Registered successfully!", "success");
                  await navigate("/home");
              } catch (err: any) {
                  console.error(err);
                  showToast(err.message || "Google registration failed", "error");
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
    	showToast("Fill all fields.", "error");
    	return;
    }

    try 
	{
      await registerRequest(username, email, password);
      
      showToast("Registration successful! Please login.", "success");
      navigate("/lock");
    } 
    catch (err: any) {
      showToast(err.message || "Registration failed", "error");
	}
	});
}