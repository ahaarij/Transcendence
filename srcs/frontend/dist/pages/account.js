import { meRequest } from "../api/auth.js";
import { updateProfile } from "../api/user.js";
import { showToast, showInputModal } from "../utils/ui.js";
export function AccountPage() {
    return `
    <div class="relative min-h-screen flex flex-col items-center pt-20"
         style="background: url('../assets/bg.png') center/cover no-repeat fixed;">
      
      <h1 class="arcade-title text-white text-6xl md:text-7xl mb-12 drop-shadow-[0_0_15px_rgba(255,255,0,0.8)]">
        Account
      </h1>

      <div class="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-black flex flex-col gap-6">
        
        <!-- Profile Picture -->
        <div class="flex flex-col items-center relative group">
          <div class="w-32 h-32 rounded-full bg-gray-200 border-4 border-blue-500 overflow-hidden mb-4 shadow-md relative">
            <img id="profilePic" src="https://via.placeholder.com/150" alt="Profile" class="w-full h-full object-cover" />
            
            <!-- Hidden File Input -->
            <input type="file" id="avatarInput" accept="image/*" class="hidden" />
            
            <!-- Overlay -->
            <div id="changeAvatarOverlay" class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <span class="text-white text-xs font-bold">Change</span>
                <span class="text-white text-[10px]">(Drop or Click)</span>
            </div>
          </div>
          <h2 id="usernameDisplay" class="text-2xl font-bold text-gray-800">Loading...</h2>
          <p id="userIdDisplay" class="text-sm text-gray-500">ID: ...</p>
        </div>

        <!-- User Info -->
        <div class="flex flex-col gap-4 border-t pt-4">
          <div>
            <label class="block text-sm font-semibold text-gray-600">Email</label>
            <p id="emailDisplay" class="text-lg font-medium text-gray-900">...</p>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-600">Member Since</label>
            <p id="createdAtDisplay" class="text-lg font-medium text-gray-900">...</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3 mt-4">
          <button id="changeUsernameBtn" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow transition font-semibold">
            Change Username
          </button>
          
          <button id="changePasswordBtn" class="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-lg shadow transition font-semibold">
            Change Password
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
    const profilePic = document.getElementById("profilePic");
    const changeAvatarOverlay = document.getElementById("changeAvatarOverlay");
    const avatarInput = document.getElementById("avatarInput");
    const loadUser = () => {
        meRequest()
            .then((res) => {
            const user = res.user;
            if (user) {
                if (usernameDisplay)
                    usernameDisplay.textContent = user.username;
                if (userIdDisplay)
                    userIdDisplay.textContent = `ID: ${user.id}`;
                if (emailDisplay)
                    emailDisplay.textContent = user.email;
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
    const handleFile = async (file) => {
        if (!file.type.startsWith("image/")) {
            showToast("Please select an image file.", "error");
            return;
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target?.result;
            if (base64) {
                try {
                    await updateProfile({ avatar: base64 });
                    showToast("Avatar updated successfully!", "success");
                    loadUser();
                }
                catch (err) {
                    showToast(err.message || "Failed to update avatar", "error");
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
        const file = e.target.files?.[0];
        if (file)
            handleFile(file);
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
        if (file)
            handleFile(file);
    });
    document.getElementById("changeUsernameBtn")?.addEventListener("click", () => {
        showInputModal("Change Username", "Enter new username", async (newUsername) => {
            try {
                await updateProfile({ username: newUsername });
                showToast("Username updated successfully!", "success");
                loadUser();
            }
            catch (err) {
                showToast(err.message || "Failed to update username", "error");
            }
        });
    });
    document.getElementById("changePasswordBtn")?.addEventListener("click", () => {
        showToast("Change Password feature coming soon!", "success");
    });
}
