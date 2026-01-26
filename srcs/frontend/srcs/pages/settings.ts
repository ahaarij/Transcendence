import { navigate } from "../router";
import { logoutRequest, enable2FARequest, verify2FARequest, disable2FARequest, meRequest } from "../api/auth";
import { deleteAccount } from "../api/user";
import { loadLanguage, currentLang, t } from "../lang";
import { showToast } from "../utils/ui";

export function SettingsPage() {
  const getBtnClass = (lang: string) => {
      const base = "lang-btn px-4 py-2 rounded transition font-cyber text-sm tracking-widest border";
      const active = "bg-[#00f3ff]/20 border-[#00f3ff] text-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.2)]";
      const inactive = "bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-white/30";
      return currentLang === lang ? `${base} ${active}` : `${base} ${inactive}`;
  };

  return `
    <div class="cyber-grid"></div>
    
    <div class="page-overlay"></div>

    <div class="relative min-h-screen flex flex-col items-center pt-16 md:pt-20 text-white px-4">

        <h1 class="text-4xl md:text-7xl mb-8 md:mb-12 font-cyber font-bold text-white tracking-tight">
            ${t('app_title')}
        </h1>

      <div class="glass-card p-6 md:p-8 w-full max-w-md rounded-xl border border-white/10 flex flex-col gap-4 md:gap-6">
        <h2 class="text-xl md:text-2xl font-cyber font-bold mb-2 text-center tracking-widest text-[#00f3ff]">${t("settings")}</h2>

        <div class="flex items-center justify-between bg-black/30 p-4 rounded-lg border border-white/5">
            <span class="text-gray-300 font-cyber text-sm tracking-wide">${t("theme")}</span>
            
            <div id="themeToggleBtn" class="cursor-pointer flex items-center gap-3 group select-none">
                <span id="themeStateLabel" class="text-xs font-cyber tracking-widest text-gray-400 transition-colors">DARK</span>
                <div class="w-12 h-6 bg-black/50 border border-white/20 rounded-full relative transition-all duration-300">
                    <div id="themeToggleKnob" class="absolute top-1 left-1 w-4 h-4 bg-gray-400 rounded-full transition-all duration-300 shadow-sm"></div>
                </div>
            </div>
        </div>

        <div class="flex items-center justify-between bg-black/30 p-4 rounded-lg border border-white/5">
            <span class="text-gray-300 font-cyber text-sm tracking-wide">${t("language")}</span>
            <div class="flex gap-2">
                <button class="${getBtnClass('en')}" data-lang="en">EN</button>
                <button class="${getBtnClass('fr')}" data-lang="fr">FR</button>
                <button class="${getBtnClass('ar')}" data-lang="ar">AR</button>
            </div>
        </div>

        <button id="enable2FABtn" class="w-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 py-3 rounded hover:bg-indigo-500/30 transition font-cyber text-sm tracking-widest hidden">
            ${t("connect_2fa")}
        </button>

        <button id="disable2FABtn" class="w-full bg-red-500/20 border border-red-500/50 text-red-300 py-3 rounded hover:bg-red-500/30 transition font-cyber text-sm tracking-widest hidden">
            ${t("disable_2fa")}
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

export async function mountSettingsPage() {
    const globalLangBtn = document.getElementById("langSwitch");
    if (globalLangBtn) globalLangBtn.style.display = "none";

    let currentUser: any = null;

    try {
        const res = await meRequest();
        currentUser = res.user;
        const enableBtn = document.getElementById("enable2FABtn");
        const disableBtn = document.getElementById("disable2FABtn");
        
        if (res.user.twoFactorEnabled) {
            disableBtn?.classList.remove("hidden");
        } else {
            enableBtn?.classList.remove("hidden");
        }
    } catch (e) {
        console.error("Failed to fetch user status");
    }

    const enableBtn = document.getElementById("enable2FABtn");
    if (enableBtn) {
        enableBtn.addEventListener("click", async () => {
            try {
                const res = await enable2FARequest();
                const { qrCode, secret } = res;

                const modal = document.createElement("div");
                modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm";
                modal.innerHTML = `
                    <div class="glass-card p-8 w-full max-w-md rounded-xl border border-[#00f3ff]/30 shadow-[0_0_30px_rgba(0,243,255,0.2)]">
                        <h3 class="text-2xl font-cyber font-bold text-[#00f3ff] mb-4 tracking-widest">${t("setup_2fa")}</h3>
                        <p class="text-gray-300 mb-6 text-sm leading-relaxed">${t("scan_qr_code")}</p>
                        
                        <div class="flex justify-center mb-6 bg-white p-4 rounded-lg">
                            <img src="${qrCode}" alt="2FA QR Code" class="w-48 h-48" />
                        </div>

                        <div class="mb-6">
                            <label class="block mb-2 font-semibold text-gray-400 text-xs tracking-wide uppercase">${t("verification_code")}</label>
                            <input type="text" id="verify2FACode" 
                                class="w-full bg-black/30 border border-white/10 text-white p-3 rounded focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all text-center tracking-[0.5em] text-xl"
                                placeholder="000000" maxlength="6" />
                        </div>

                        <div class="flex gap-3">
                            <button id="cancel2FABtn" class="flex-1 bg-white/5 border border-white/10 text-gray-300 py-3 rounded hover:bg-white/10 transition font-cyber text-sm tracking-widest">
                                ${t("cancel")}
                            </button>
                            <button id="confirm2FABtn" class="flex-1 bg-[#00f3ff]/20 border border-[#00f3ff]/50 text-[#00f3ff] py-3 rounded hover:bg-[#00f3ff]/30 transition font-cyber text-sm tracking-widest">
                                ${t("verify")}
                            </button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                const cancelBtn = modal.querySelector("#cancel2FABtn");
                cancelBtn?.addEventListener("click", () => document.body.removeChild(modal));

                const confirmBtn = modal.querySelector("#confirm2FABtn");
                const codeInput = modal.querySelector("#verify2FACode") as HTMLInputElement;

                confirmBtn?.addEventListener("click", async () => {
                    const code = codeInput.value;
                    if (code.length !== 6) {
                        codeInput.classList.add("border-red-500");
                        return;
                    }

                    try {
                        await verify2FARequest(code);
                        document.body.removeChild(modal);
                        showToast(t("2fa_enabled_success"), "success");
                        enableBtn.classList.add("hidden");
                        document.getElementById("disable2FABtn")?.classList.remove("hidden");
                    } catch (error: any) {
                        showToast(t(error.message) || t("invalid_code"), "error");
                    }
                });
            } catch (error) {
                showToast(t("2fa_setup_failed"), "error");
            }
        });
    }

    let disableBtn = document.getElementById("disable2FABtn");
    if (disableBtn) {
        // Remove existing listeners
        const newDisableBtn = disableBtn.cloneNode(true);
        if (disableBtn.parentNode) {
            disableBtn.parentNode.replaceChild(newDisableBtn, disableBtn);
        }
        disableBtn = newDisableBtn as HTMLElement;

        disableBtn.addEventListener("click", () => {
            const hasPassword = currentUser?.hasPassword;

            const modal = document.createElement("div");
            modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm";
            modal.innerHTML = `
                <div class="glass-card p-8 w-full max-w-md rounded-xl border border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                    <h3 class="text-2xl font-cyber font-bold text-red-500 mb-4 tracking-widest">${t("disable_2fa")}</h3>
                    <p class="text-gray-300 mb-6 text-sm leading-relaxed">${t("enter_password_code_disable_2fa")}</p>
                    
                    ${hasPassword ? `
                    <div class="mb-4">
                        <label class="block mb-2 font-semibold text-gray-400 text-xs tracking-wide uppercase">${t("password")}</label>
                        <input type="password" id="disable2FAPassword" 
                            class="w-full bg-black/30 border border-white/10 text-white p-3 rounded focus:outline-none focus:border-red-500 focus:shadow-[0_0_10px_rgba(220,38,38,0.2)] transition-all"
                            placeholder="${t("password")}" />
                    </div>
                    ` : ''}

                    <div class="mb-6">
                        <label class="block mb-2 font-semibold text-gray-400 text-xs tracking-wide uppercase">${t("2fa_code")}</label>
                        <input type="text" id="disable2FACode" 
                            class="w-full bg-black/30 border border-white/10 text-white p-3 rounded focus:outline-none focus:border-red-500 focus:shadow-[0_0_10px_rgba(220,38,38,0.2)] transition-all"
                            placeholder="000000" maxlength="6" />
                    </div>

                    <div class="flex justify-end gap-4">
                        <button id="cancelDisable2FA" class="px-6 py-2 rounded text-gray-400 hover:text-white transition font-cyber text-sm tracking-wider hover:bg-white/5">
                            ${t("cancel")}
                        </button>
                        <button id="confirmDisable2FA" class="px-6 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded hover:bg-red-500/30 hover:text-red-300 transition font-cyber text-sm tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.15)]">
                            ${t("confirm")}
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const close = () => modal.remove();
            
            // Wait for DOM update
            setTimeout(() => {
                const cancelBtn = modal.querySelector("#cancelDisable2FA");
                cancelBtn?.addEventListener("click", close);

                // Add backdrop click listener
                modal.addEventListener("click", (e) => {
                    if (e.target === modal) close();
                });
            }, 0);

            modal.querySelector("#confirmDisable2FA")?.addEventListener("click", async () => {
                let password = "";
                if (hasPassword) {
                     const passwordInput = modal.querySelector("#disable2FAPassword") as HTMLInputElement;
                     password = passwordInput?.value || "";
                     if (!password) {
                         showToast(t("fill_all_fields"), "error"); 
                         return;
                     }
                }
                const codeInput = modal.querySelector("#disable2FACode") as HTMLInputElement;
                const code = codeInput?.value || "";

                if (!code) {
                    showToast(t("fill_all_fields"), "error");
                    return;
                }

                try {
                    await disable2FARequest(code, password);
                    showToast(t("2fa_disabled_success"), "success");
                    disableBtn.classList.add("hidden");
                    document.getElementById("enable2FABtn")?.classList.remove("hidden");
                    close();
                } catch (error: any) {
                    showToast(t(error.message) || t("disable_2fa_failed"), "error");
                }
            });
        });
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try { await logoutRequest(); } catch (_) {}
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            navigate("/lock");
        });
    }

    let deleteBtn = document.getElementById("deleteAccountBtn");
    if (deleteBtn) {
        // Cloning the node removes all event listeners to prevent duplicates
        const newDeleteBtn = deleteBtn.cloneNode(true);
        if (deleteBtn.parentNode) {
            deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
        }
        deleteBtn = newDeleteBtn as HTMLElement;

        deleteBtn.addEventListener("click", () => {
            const hasPassword = currentUser?.hasPassword;
            const is2FA = currentUser?.twoFactorEnabled;
            
            const modal = document.createElement("div");
            modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm";
            modal.innerHTML = `
                <div class="glass-card p-8 w-full max-w-md rounded-xl border border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                    <h3 class="text-2xl font-cyber font-bold text-red-500 mb-4 tracking-widest">${t("delete_account")}</h3>
                    <p class="text-gray-300 mb-6 text-sm leading-relaxed">${t("confirm_delete_account")}</p>
                    
                    ${hasPassword ? `
                    <div class="mb-6">
                        <label class="block mb-2 font-semibold text-gray-400 text-xs tracking-wide uppercase">${t("password")}</label>
                        <input type="password" id="deleteConfirmPassword" 
                            class="w-full bg-black/30 border border-white/10 text-white p-3 rounded focus:outline-none focus:border-red-500 focus:shadow-[0_0_10px_rgba(220,38,38,0.2)] transition-all"
                            placeholder="${t("password")}" />
                    </div>
                    ` : ''}

                    ${!hasPassword && is2FA ? `
                    <div class="mb-6">
                        <label class="block mb-2 font-semibold text-gray-400 text-xs tracking-wide uppercase">${t("verification_code")}</label>
                        <input type="text" id="delete2FACode" 
                            class="w-full bg-black/30 border border-white/10 text-white p-3 rounded focus:outline-none focus:border-red-500 focus:shadow-[0_0_10px_rgba(220,38,38,0.2)] transition-all text-center tracking-[0.5em] text-xl"
                            placeholder="000000" maxlength="6" />
                    </div>
                    ` : ''}

                    <div class="flex gap-3">
                        <button id="cancelDeleteBtn" class="flex-1 bg-white/5 border border-white/10 text-gray-300 py-3 rounded hover:bg-white/10 transition font-cyber text-sm tracking-widest">
                            ${t("cancel")}
                        </button>
                        <button id="confirmDeleteBtn" class="flex-1 bg-red-500/20 border border-red-500/50 text-red-400 py-3 rounded hover:bg-red-500/30 hover:text-red-300 transition font-cyber text-sm tracking-widest">
                            ${t("confirm")}
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            const cancelBtn = modal.querySelector("#cancelDeleteBtn");
            cancelBtn?.addEventListener("click", () => {
                document.body.removeChild(modal);
            });
            const confirmBtn = modal.querySelector("#confirmDeleteBtn");

            confirmBtn?.addEventListener("click", async () => {
                let password = "";
                let code = "";

                if (hasPassword) {
                    const passwordInput = modal.querySelector("#deleteConfirmPassword") as HTMLInputElement;
                    password = passwordInput.value;
                    if (!password) {
                        passwordInput.classList.add("border-red-500");
                        return;
                    }
                } else if (is2FA) {
                    const codeInput = modal.querySelector("#delete2FACode") as HTMLInputElement;
                    code = codeInput.value;
                    if (code.length !== 6) {
                        codeInput.classList.add("border-red-500");
                        return;
                    }
                }

                try {
                    await deleteAccount(password, code);
                    document.body.removeChild(modal);
                    localStorage.removeItem("token");
                    sessionStorage.removeItem("token");
                    navigate("/register");
                } catch (error: any) {
                    showToast(t(error.message) || t("delete_account_failed"), "error");
                }
            });

            modal.addEventListener("click", (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        });
    }

    const themeBtn = document.getElementById("themeToggleBtn");
    const themeLabel = document.getElementById("themeStateLabel");
    const themeKnob = document.getElementById("themeToggleKnob");
    const themeTrack = themeBtn?.querySelector("div");
    // i nabbed this muehehehehe { MAKE SURE TO REMOVE THIS COMMENT BEFORE SUBMITTING lol }
    if (themeBtn && themeLabel && themeKnob && themeTrack) {
        const updateUI = (isLight: boolean) => {
            if (isLight) {
                themeLabel.textContent = t("light");
                themeLabel.style.color = "#1a1a1a"; 
                themeKnob.style.transform = "translateX(24px)";
                themeKnob.style.backgroundColor = "#ff9900";
                themeKnob.style.boxShadow = "0 0 10px #ff9900";
                themeTrack.style.backgroundColor = "rgba(255,255,255,0.5)";
                themeTrack.style.borderColor = "#ff9900";
            } else {
                themeLabel.textContent = t("dark");
                themeLabel.style.color = "#9ca3af"; 
                themeKnob.style.transform = "translateX(0)";
                themeKnob.style.backgroundColor = "#00f3ff";
                themeKnob.style.boxShadow = "0 0 10px #00f3ff";
                themeTrack.style.backgroundColor = "rgba(0,0,0,0.5)";
                themeTrack.style.borderColor = "rgba(255,255,255,0.2)";
            }
        };

        updateUI(document.body.classList.contains("light-mode"));

        themeBtn.addEventListener("click", () => {
            document.body.classList.toggle("light-mode");
            const isLightNow = document.body.classList.contains("light-mode");
            localStorage.setItem("theme", isLightNow ? "light" : "dark");
            updateUI(isLightNow);
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

