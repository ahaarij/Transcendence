import { t } from "../lang";

export function HomePage() {
  return `
    <div class="cyber-grid"></div>
    
    <div class="page-overlay"></div>

    <main class="flex-grow flex flex-col items-center justify-center text-center px-4 relative z-10 mt-10 w-full min-h-[80vh]">
        
        <h1 class="text-4xl md:text-8xl font-bold font-cyber mb-8 text-white tracking-tight">
            Ding Dong
        </h1>

        <p class="text-gray-400 text-base md:text-lg max-w-xl mb-12 leading-relaxed font-light">
            ${t('home_play_desc')}
        </p>

        <div class="flex gap-6">
            <div data-link href="/play" class="btn-neon font-cyber">
                ${t('play')}
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 md:mt-32 w-full max-w-7xl px-4">
            
            <div class="glass-card p-6 md:p-8 rounded-sm" data-link href="/play">
                <div class="mb-4 opacity-80">
                    <svg class="w-6 h-6 text-[#00f3ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 class="text-lg font-cyber font-bold mb-2 text-white">${t('play')}</h3>
                <p class="text-gray-500 text-sm leading-relaxed">${t('home_play_desc')}</p>
            </div>

            <div class="glass-card p-8 rounded-sm" data-link href="/account">
                <div class="mb-4 opacity-80">
                    <svg class="w-6 h-6 text-[#ff00ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <h3 class="text-lg font-cyber font-bold mb-2 text-white">${t('account')}</h3>
                <p class="text-gray-500 text-sm leading-relaxed">${t('home_account_desc')}</p>
            </div>

            <div class="glass-card p-8 rounded-sm" data-link href="/stats">
                <div class="mb-4 opacity-80">
                    <svg class="w-6 h-6 text-[#00f3ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h3 class="text-lg font-cyber font-bold mb-2 text-white">${t('stats')}</h3>
                <p class="text-gray-500 text-sm leading-relaxed">${t('home_stats_desc')}</p>
            </div>

            <div class="glass-card p-8 rounded-sm" data-link href="/friends">
                <div class="mb-4 opacity-80">
                    <svg class="w-6 h-6 text-[#ff00ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <h3 class="text-lg font-cyber font-bold mb-2 text-white">${t('friends')}</h3>
                <p class="text-gray-500 text-sm leading-relaxed">${t('home_friends_desc')}</p>
            </div>

        </div>
    </main>

    <footer class="w-full p-8 text-center text-gray-700 text-xs relative z-10 tracking-widest mt-auto">
        <p>by ahaarij, abdsayed, and mshaheen</p>
    </footer>
  `;
}

export function mountHomePage() {
  document.querySelectorAll("[href][data-link]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const href = el.getAttribute("href");
      if (href) {
        history.pushState({}, "", href);
        window.dispatchEvent(new Event("popstate"));
      }
    });
  });
}

export function unmountHomePage() {
}
