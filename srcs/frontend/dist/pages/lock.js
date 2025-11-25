import { t } from "../lang.js";
export function LockPage() {
    return `
    <div 
      class="relative min-h-screen flex flex-col items-center pt-32"
      style="background: url('/assets/background.png') center/cover no-repeat fixed;">

      <img 
        src="/assets/title.png"
        alt="Transcendence"
        class="relative w-full max-w-md mb-20 drop-shadow-xl"
      />

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
