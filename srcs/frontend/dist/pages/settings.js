import { navigate } from "../router.js";
export function SettingsPage() {
    return `
    <div class="relative min-h-screen flex flex-col items-center pt-20 text-black">

      <img 
        src="/assets/title.png"
        class="w-full max-w-sm mb-10 drop-shadow-xl"
      />

      <div class="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md text-center">
        <h2 class="text-3xl font-bold mb-4">Settings</h2>

        <button 
          id="logoutBtn"
          class="w-full bg-red-500 text-white py-2 rounded-lg mt-4 hover:bg-red-600 transition">
          Logout
        </button>
      </div>
    </div>
  `;
}
export function mountSettingsPage() {
    const btn = document.getElementById("logoutBtn");
    if (btn) {
        btn.addEventListener("click", () => {
            localStorage.removeItem("isLoggedIn");
            sessionStorage.removeItem("isLoggedIn");
            navigate("/lock");
        });
    }
}
