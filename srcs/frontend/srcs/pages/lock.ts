import { t } from "../lang";

export function LockPage() {
  return `
    <div class="cyber-grid"></div>
    
    <div class="fixed inset-0 bg-gradient-to-b from-transparent via-[#050505]/90 to-[#050505] pointer-events-none -z-1"></div>

    <div class="relative min-h-screen flex flex-col items-center justify-center">

        <h1 class="text-6xl md:text-8xl font-bold font-cyber mb-12 text-white tracking-tight">
            Ding Dong
        </h1>

        <div class="flex gap-10 mt-10">

        <div 
          class="glass-card p-8 rounded-xl flex flex-col items-center justify-center w-48 h-48 hover:border-[#00f3ff] group transition-all duration-300"
          data-link
          href="/login"
        >
          <div class="mb-4 opacity-80 group-hover:text-[#00f3ff] transition-colors">
             <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
          </div>
          <span class="text-xl font-cyber font-bold tracking-widest text-white group-hover:text-[#00f3ff] transition-colors">${t("login")}</span>
        </div>

        <div 
          class="glass-card p-8 rounded-xl flex flex-col items-center justify-center w-48 h-48 hover:border-[#ff00ff] group transition-all duration-300"
          data-link
          href="/register"
        >
          <div class="mb-4 opacity-80 group-hover:text-[#ff00ff] transition-colors">
             <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          </div>
          <span class="text-xl font-cyber font-bold tracking-widest text-white group-hover:text-[#ff00ff] transition-colors">${t("register")}</span>
        </div>

      </div>

    </div>
  `;
}

export function mountLockPage() {}