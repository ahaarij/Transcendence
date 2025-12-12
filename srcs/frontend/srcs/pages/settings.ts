import { navigate } from "../router";
import { logoutRequest } from "../api/auth";
import { deleteAccount } from "../api/user";
import { loadLanguage, currentLang, t } from "../lang";

export function SettingsPage() {
  const getBtnClass = (lang: string) => {
      const base = "lang-btn px-4 py-2 rounded transition font-cyber text-sm tracking-widest border";
      const active = "bg-[#00f3ff]/20 border-[#00f3ff] text-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.2)]";
      const inactive = "bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-white/30";
      return currentLang === lang ? `${base} ${active}` : `${base} ${inactive}`;
  };

  return `
    <div class="cyber-grid"></div>
    
    <div class="fixed inset-0 bg-gradient-to-b from-transparent via-[#050505]/90 to-[#050505] pointer-events-none -z-1"></div>

    <div class="relative min-h-screen flex flex-col items-center pt-20 text-white">

        <h1 class="text-6xl md:text-7xl mb-12 font-cyber font-bold text-white tracking-tight">
            Ding Dong
        </h1>

      <div class="glass-card p-8 w-full max-w-md rounded-xl border border-white/10 flex flex-col gap-6">
        <h2 class="text-2xl font-cyber font-bold mb-2 text-center tracking-widest text-[#00f3ff]">${t("settings")}</h2>

        <div class="flex items-center justify-between bg-black/30 p-4 rounded-lg border border-white/5">
            <span class="text-gray-300 font-cyber text-sm tracking-wide">${t("theme")}</span>
            <button id="themeToggleBtn" class="bg-white/10 hover:bg-white/20 text-white px-4 py-1 rounded transition text-xs tracking-widest border border-white/10">
                ${t("toggle")}
            </button>
        </div>

        <div class="flex items-center justify-between bg-black/30 p-4 rounded-lg border border-white/5">
            <span class="text-gray-300 font-cyber text-sm tracking-wide">${t("language")}</span>
            <div class="flex gap-2">
                <button class="${getBtnClass('en')}" data-lang="en">EN</button>
                <button class="${getBtnClass('fr')}" data-lang="fr">FR</button>
                <button class="${getBtnClass('ar')}" data-lang="ar">AR</button>
            </div>
        </div>

        <button class="w-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 py-3 rounded hover:bg-indigo-500/30 transition opacity-50 cursor-not-allowed font-cyber text-sm tracking-widest">
            ${t("connect_2fa")}
        </button>

        <div class="my-2 border-t border-white/10"></div>

        <button 
          id="logoutBtn"
          class="w-full bg-white/5 border border-white/10 text-gray-300 py-3 rounded hover:bg-white/10 hover:text-white transition font-cyber text-sm tracking-widest">
          ${t("logout")}
        </button>

        <button 
          id="deleteAccountBtn"
          class="w-full bg-red-500/10 border border-red-500/30 text-red-400 py-3 rounded hover:bg-red-500/20 hover:text-red-300 transition font-cyber text-sm tracking-widest">
          ${t("delete_account")}
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
            if (confirm(t("confirm_delete_account"))) {
                try {
                    await deleteAccount();
                    localStorage.removeItem("token");
                    sessionStorage.removeItem("token");
                    navigate("/register");
                } catch (error) {
                    alert(t("delete_account_failed"));
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

