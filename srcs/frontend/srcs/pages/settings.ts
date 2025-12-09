import { navigate } from "../router";
import { logoutRequest } from "../api/auth";
import { deleteAccount } from "../api/user";
import { loadLanguage, currentLang } from "../lang";

export function SettingsPage() {
  const getBtnClass = (lang: string) => {
      const base = "lang-btn px-2 py-1 rounded transition text-white";
      const active = "bg-blue-700 ring-2 ring-offset-2 ring-blue-500";
      const inactive = "bg-blue-500 hover:bg-blue-600";
      return currentLang === lang ? `${base} ${active}` : `${base} ${inactive}`;
  };

  return `
    <div class="relative min-h-screen flex flex-col items-center pt-20 text-black">

        <h1 class="arcade-title text-white text-6xl md:text-7xl mb-12 drop-shadow-[0_0_15px_rgba(255,255,0,0.8)]">
            Ding Dong
        </h1>

      <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 w-full max-w-md text-center flex flex-col gap-4 transition-colors duration-300">
        <h2 class="text-3xl font-bold mb-4 dark:text-white">Settings</h2>

        <!-- Theme Toggle -->
        <div class="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg transition-colors duration-300">
            <span class="dark:text-gray-200">Theme</span>
            <button id="themeToggleBtn" class="bg-gray-300 dark:bg-gray-600 dark:text-white px-3 py-1 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition">
                🌓 Toggle
            </button>
        </div>

        <!-- Language -->
        <div class="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg transition-colors duration-300">
            <span class="dark:text-gray-200">Language</span>
            <div class="flex gap-2">
                <button class="${getBtnClass('en')}" data-lang="en">EN</button>
                <button class="${getBtnClass('fr')}" data-lang="fr">FR</button>
                <button class="${getBtnClass('ar')}" data-lang="ar">AR</button>
            </div>
        </div>

        <!-- 2FA Placeholder -->
        <button class="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition opacity-50 cursor-not-allowed">
            Connect 2FA (Coming Soon)
        </button>

        <hr class="my-2 border-gray-300 dark:border-gray-600">

        <button 
          id="logoutBtn"
          class="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition">
          Logout
        </button>

        <button 
          id="deleteAccountBtn"
          class="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition">
          Delete Account
        </button>
      </div>
    </div>
  `;
}

export function mountSettingsPage() {
    const globalLangBtn = document.getElementById("langSwitch");
    if (globalLangBtn) globalLangBtn.style.display = "none";

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try { await logoutRequest(); } catch (_) {}
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            navigate("/lock");
        });
    }

    const deleteBtn = document.getElementById("deleteAccountBtn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
            if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                try {
                    await deleteAccount();
                    localStorage.removeItem("token");
                    sessionStorage.removeItem("token");
                    navigate("/register");
                } catch (error) {
                    alert("Failed to delete account");
                }
            }
        });
    }

    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark");
            const isDark = document.body.classList.contains("dark");
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
    }

    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const lang = (e.target as HTMLElement).dataset.lang;
            if (lang) loadLanguage(lang);
        });
    });
}

export function unmountSettingsPage() {
    const globalLangBtn = document.getElementById("langSwitch");
    if (globalLangBtn) globalLangBtn.style.display = "flex";
}

