import { meRequest } from "../api/auth.js";
export function AccountPage() {
    return `
    <div class="relative min-h-screen flex flex-col items-center pt-20"
         style="background: url('../assets/bg.png') center/cover no-repeat fixed;">
      
      <h1 class="arcade-title text-white text-6xl md:text-7xl mb-12 drop-shadow-[0_0_15px_rgba(255,255,0,0.8)]">
        Account
      </h1>

      <div class="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-black flex flex-col gap-6">
        
        <!-- Profile Picture -->
        <div class="flex flex-col items-center">
          <div class="w-32 h-32 rounded-full bg-gray-200 border-4 border-blue-500 overflow-hidden mb-4 shadow-md">
            <img id="profilePic" src="https://via.placeholder.com/150" alt="Profile" class="w-full h-full object-cover" />
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
            // if user hasprofile pic url, set it here. using placeholder rnn.
            // if (user.avatarUrl && profilePic) profilePic.src = user.avatarUrl;
        }
    })
        .catch((err) => {
        console.error("Failed to fetch user data:", err);
        alert("Failed to load account info. Please login again.");
    });
    document.getElementById("changeUsernameBtn")?.addEventListener("click", () => {
        alert("Change Username feature coming soon!");
    });
    document.getElementById("changePasswordBtn")?.addEventListener("click", () => {
        alert("Change Password feature coming soon!");
    });
}
