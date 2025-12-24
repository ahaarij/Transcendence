import { meRequest, changePasswordRequest } from "../api/auth";
import { updateProfile } from "../api/user";
import { showToast, showInputModal } from "../utils/ui";
import { t } from "../lang";
import { config } from "../config";

export function AccountPage() {
  return `
    <div class="cyber-grid"></div>
    
    <div class="page-overlay"></div>

    <div class="relative min-h-screen flex flex-col items-center pt-16 md:pt-20 px-4">
      
      <h1 class="text-4xl md:text-7xl mb-8 md:mb-12 font-cyber font-bold text-white tracking-tight">
        ${t("account")}
      </h1>

      <div class="glass-card p-6 md:p-8 w-full max-w-md rounded-xl border border-white/10 flex flex-col gap-6">
        
        <!-- Profile Picture -->
        <div class="flex flex-col items-center relative group">
          <div class="w-32 h-32 rounded-full bg-black/50 border-2 border-[#00f3ff] overflow-hidden mb-4 shadow-[0_0_15px_rgba(0,243,255,0.3)] relative">
            <img id="profilePic" src="https://via.placeholder.com/150" alt="Profile" class="w-full h-full object-cover" />
            
            <input type="file" id="avatarInput" accept="image/*" class="hidden" />
            
            <div id="changeAvatarOverlay" class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer backdrop-blur-sm">
                <span class="text-[#00f3ff] text-xs font-bold font-cyber tracking-widest">${t("change")}</span>
                <span class="text-gray-300 text-[10px] mt-1">${t("drop_or_click")}</span>
            </div>
          </div>
          <h2 id="usernameDisplay" class="text-2xl font-bold text-white font-cyber tracking-wide">${t("loading")}</h2>
          <p id="userIdDisplay" class="text-sm text-gray-500 font-mono">ID: ...</p>
        </div>

        <div class="flex flex-col gap-4 border-t border-white/10 pt-4">
          <div>
            <label class="block text-xs font-semibold text-[#00f3ff] tracking-widest mb-1 uppercase">${t("email")}</label>
            <p id="emailDisplay" class="text-lg font-medium text-gray-200">...</p>
          </div>
          
          <div>
            <label class="block text-xs font-semibold text-[#00f3ff] tracking-widest mb-1 uppercase">${t("member_since")}</label>
            <p id="createdAtDisplay" class="text-lg font-medium text-gray-200">...</p>
          </div>
        </div>

        <div class="flex flex-col gap-3 mt-4">
          <button id="changeUsernameBtn" class="btn-neon w-full font-cyber font-bold text-sm py-3">
            ${t("change_username")}
          </button>
          
          <button id="changePasswordBtn" class="w-full bg-transparent border border-white/20 text-gray-400 hover:text-white hover:border-white/50 py-3 rounded transition font-semibold text-sm tracking-wide">
            ${t("change_password")}
          </button>
        </div>

      </div>
    </div>
  `;
}

export function mountAccountPage() {
  const usernameDisplay = document.getElementById("usernameDisplay");
  const userIdDisplay = document.getElementById("userIdDisplay");
  const emailDisplay = document.getElementById("emailDisplay");
  const createdAtDisplay = document.getElementById("createdAtDisplay");
  const profilePic = document.getElementById("profilePic") as HTMLImageElement;
  const changeAvatarOverlay = document.getElementById("changeAvatarOverlay");
  const avatarInput = document.getElementById("avatarInput") as HTMLInputElement;

  const loadUser = () => {
      meRequest()
        .then((res) => {
          const user = res.user;
          if (user) {
            if (usernameDisplay) usernameDisplay.textContent = user.username;
            if (userIdDisplay) userIdDisplay.textContent = `ID: ${user.id}`;
            if (emailDisplay) emailDisplay.textContent = user.email;
            
            if (createdAtDisplay && user.createdAt) {
              const date = new Date(user.createdAt);
              createdAtDisplay.textContent = date.toLocaleDateString();
            }

            if (user.avatar && profilePic) {
                if (user.avatar.startsWith("http") || user.avatar.startsWith("data:")) {
                    profilePic.src = user.avatar;
                } else if (user.avatar.startsWith("/public/")) {
                    profilePic.src = `${config.API_BASE_URL}${user.avatar}`;
                } else {
                    profilePic.src = user.avatar;
                }
            }
          }
        })
        .catch((err) => {
          console.error("Failed to fetch user data:", err);
        });
  };

  loadUser();

  // file selection
  const handleFile = async (file: File) => {
      if (!file.type.startsWith("image/")) {
          showToast(t("select_image_error"), "error");
          return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
          const base64 = e.target?.result as string;
          if (base64) {
              try {
                  await updateProfile({ avatar: base64 });
                  showToast(t("avatar_updated"), "success");
                  loadUser();
              } catch (err: any) {
                  showToast(err.message || t("avatar_update_failed"), "error");
              }
          }
      };
      reader.readAsDataURL(file);
  };

  // click to upload
  changeAvatarOverlay?.addEventListener("click", () => {
      avatarInput?.click();
  });

  avatarInput?.addEventListener("change", (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
  });

  // drag and DRop
  const dropZone = changeAvatarOverlay?.parentElement;
  
  dropZone?.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("ring-4", "ring-blue-400");
  });

  dropZone?.addEventListener("dragleave", () => {
      dropZone.classList.remove("ring-4", "ring-blue-400");
  });

  dropZone?.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("ring-4", "ring-blue-400");
      
      const file = e.dataTransfer?.files[0];
      if (file) handleFile(file);
  });

  document.getElementById("changeUsernameBtn")?.addEventListener("click", () => {
    const modal = document.createElement("div");
    modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm";
    modal.innerHTML = `
        <div class="glass-card p-8 w-full max-w-md rounded-xl border border-[#00f3ff]/30 shadow-[0_0_30px_rgba(0,243,255,0.2)]">
            <h3 class="text-2xl font-cyber font-bold text-[#00f3ff] mb-4 tracking-widest">${t("change_username")}</h3>
            
            <div class="mb-6">
                <label class="block mb-2 font-semibold text-gray-400 text-xs tracking-wide uppercase">${t("username")}</label>
                <input type="text" id="newUsernameInput" 
                    class="w-full bg-black/30 border border-white/10 text-white p-3 rounded focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all"
                    placeholder="${t("enter_new_username")}" />
            </div>

            <div class="flex gap-3">
                <button id="cancelChangeUserBtn" class="flex-1 bg-white/5 border border-white/10 text-gray-300 py-3 rounded hover:bg-white/10 transition font-cyber text-sm tracking-widest">
                    ${t("cancel")}
                </button>
                <button id="confirmChangeUserBtn" class="flex-1 bg-[#00f3ff]/20 border border-[#00f3ff]/50 text-[#00f3ff] py-3 rounded hover:bg-[#00f3ff]/30 transition font-cyber text-sm tracking-widest">
                    ${t("confirm")}
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector("#cancelChangeUserBtn")?.addEventListener("click", close);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) close();
    });

    modal.querySelector("#confirmChangeUserBtn")?.addEventListener("click", async () => {
        const newUsername = (modal.querySelector("#newUsernameInput") as HTMLInputElement).value;

        if (!newUsername) {
            showToast(t("fill_all_fields"), "error");
            return;
        }

        try {
            await updateProfile({ username: newUsername });
            showToast(t("username_updated"), "success");
            loadUser();
            close();
        } catch (err: any) {
            showToast(err.message || t("username_update_failed"), "error");
        }
    });
  });

  document.getElementById("changePasswordBtn")?.addEventListener("click", () => {
    const modal = document.createElement("div");
    modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm";
    modal.innerHTML = `
        <div class="glass-card p-8 w-full max-w-md rounded-xl border border-[#00f3ff]/30 shadow-[0_0_30px_rgba(0,243,255,0.2)]">
            <h3 class="text-2xl font-cyber font-bold text-[#00f3ff] mb-4 tracking-widest">${t("change_password") || "CHANGE PASSWORD"}</h3>
            
            <div class="mb-4">
                <label class="block mb-2 font-semibold text-gray-400 text-xs tracking-wide uppercase">${t("current_password") || "CURRENT PASSWORD"}</label>
                <input type="password" id="currentPasswordInput" 
                    class="w-full bg-black/30 border border-white/10 text-white p-3 rounded focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all"
                    placeholder="********" />
            </div>

            <div class="mb-6">
                <label class="block mb-2 font-semibold text-gray-400 text-xs tracking-wide uppercase">${t("new_password") || "NEW PASSWORD"}</label>
                <input type="password" id="newPasswordInput" 
                    class="w-full bg-black/30 border border-white/10 text-white p-3 rounded focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all"
                    placeholder="********" />
            </div>

            <div class="flex gap-3">
                <button id="cancelChangePassBtn" class="flex-1 bg-white/5 border border-white/10 text-gray-300 py-3 rounded hover:bg-white/10 transition font-cyber text-sm tracking-widest">
                    ${t("cancel")}
                </button>
                <button id="confirmChangePassBtn" class="flex-1 bg-[#00f3ff]/20 border border-[#00f3ff]/50 text-[#00f3ff] py-3 rounded hover:bg-[#00f3ff]/30 transition font-cyber text-sm tracking-widest">
                    ${t("confirm")}
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector("#cancelChangePassBtn")?.addEventListener("click", close);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) close();
    });

    modal.querySelector("#confirmChangePassBtn")?.addEventListener("click", async () => {
        const currentPass = (modal.querySelector("#currentPasswordInput") as HTMLInputElement).value;
        const newPass = (modal.querySelector("#newPasswordInput") as HTMLInputElement).value;

        if (!currentPass || !newPass) {
            showToast(t("fill_all_fields"), "error");
            return;
        }

        try {
            await changePasswordRequest(currentPass, newPass);
            showToast("Password changed successfully", "success");
            close();
        } catch (error: any) {
            showToast(error.message || "Failed to change password", "error");
        }
    });
  });
}
