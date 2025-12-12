import { meRequest } from "../api/auth";
import { updateProfile } from "../api/user";
import { showToast, showInputModal } from "../utils/ui";
import { t } from "../lang";

export function AccountPage() {
  return `
    <div class="cyber-grid"></div>
    
    <div class="fixed inset-0 bg-gradient-to-b from-transparent via-[#050505]/90 to-[#050505] pointer-events-none -z-1"></div>

    <div class="relative min-h-screen flex flex-col items-center pt-20">
      
      <h1 class="text-6xl md:text-7xl mb-12 font-cyber font-bold text-white tracking-tight">
        ${t("account")}
      </h1>

      <div class="glass-card p-8 w-full max-w-md rounded-xl border border-white/10 flex flex-col gap-6">
        
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
                profilePic.src = user.avatar;
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
    showInputModal(t("change_username"), t("enter_new_username"), async (newUsername) => {
        try {
            await updateProfile({ username: newUsername });
            showToast(t("username_updated"), "success");
            loadUser();
        } catch (err: any) {
            showToast(err.message || t("username_update_failed"), "error");
        }
    });
  });

  document.getElementById("changePasswordBtn")?.addEventListener("click", () => {
    showToast(t("change_password_soon"), "success");
  });
}
