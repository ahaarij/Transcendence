import { t } from "../lang.js";
export function LockPage() {
    return `
    <div 
      class="relative min-h-screen flex flex-col items-center pt-32"
      style="background: url('../assets/bg.png') center/cover no-repeat fixed;">

        <h1 class="arcade-title text-white text-6xl md:text-7xl mb-12 drop-shadow-[0_0_15px_rgba(255,255,0,0.8)]">
            Ding Dong
        </h1>

        <div class="flex gap-10 mt-10">

        <div 
          class="bg-white shadow-xl rounded-2xl p-8 text-black cursor-pointer hover:scale-[1.03] transition flex flex-col items-center justify-center w-40 h-40"
          data-link
          href="/login"
        >
         <!-- <img src="/assets/login-icon.png" class="w-12 h-12 mb-3 opacity-80" /> -->
          <span class="text-xl font-semibold">${t("login")}</span>
        </div>

        <div 
          class="bg-white shadow-xl rounded-2xl p-8 text-black cursor-pointer hover:scale-[1.03] transition flex flex-col items-center justify-center w-40 h-40"
          data-link
          href="/register"
        >
         <!-- <img src="/assets/register-icon.png" class="w-12 h-12 mb-3 opacity-80" /> -->
          <span class="text-xl font-semibold">${t("register")}</span>
        </div>

      </div>

    </div>
  `;
}
export function mountLockPage() { }
