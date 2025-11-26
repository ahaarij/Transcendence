import { t } from "../lang.js";
import { navigate } from "../router.js";
import { loginRequest } from "../api/auth.js";

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

    form.addEventListener("submit", async (e) =>
    {
        e.preventDefault();

        const email = (document.getElementById("email") as HTMLInputElement).value;
        const pass = (document.getElementById("password") as HTMLInputElement).value;
        const remember = (document.getElementById("remember") as HTMLInputElement).checked;

        try 
        {
            await loginRequest(email, pass);

            if (remember)
            {
              localStorage.setItem("isLoggedIn", "true");
            } 
            else 
            {
              sessionStorage.setItem("isLoggedIn", "true");
            }

            navigate("/home");
        }     
        catch (err: any)
        {
            alert(err.message);
        }
    });
}

