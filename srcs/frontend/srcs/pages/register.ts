import { t } from "../lang.js";

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
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const u = (document.getElementById("username") as HTMLInputElement).value;
    const e1 = (document.getElementById("email") as HTMLInputElement).value;
    const p1 = (document.getElementById("password") as HTMLInputElement).value;
    const p2 = (document.getElementById("confirm") as HTMLInputElement).value;

    if (!u || !e1 || !p1 || !p2) {
      alert("Fill all fields.");
      return;
    }

    if (p1 !== p2) {
      alert("Passwords do not match.");
      return;
    }

    alert("Register submitted (fake).");
  });
}