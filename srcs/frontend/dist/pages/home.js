export function HomePage() {
    return `
   <div 
      class="relative min-h-screen flex flex-col items-center pt-20"
      style="background: url('../assets/bg.png') center/cover no-repeat fixed;"
    >

      <h1 class="arcade-title text-white text-6xl md:text-7xl mb-12 drop-shadow-[0_0_15px_rgba(255,255,0,0.8)]">
        Ding Dong
      </h1>

      <div class="relative grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-6">

        <div 
          class="bg-white shadow-xl rounded-2xl p-6 text-black cursor-pointer hover:scale-[1.02] transition 
                 text-center flex flex-col items-center justify-center"
          data-link
          href="/play"
        >
          <h2 class="text-2xl font-bold mb-2">Play</h2>
          <p>Start a match or play AI mode.</p>
        </div>

        <div 
          class="bg-white shadow-xl rounded-2xl p-6 text-black cursor-pointer hover:scale-[1.02] transition
                 text-center flex flex-col items-center justify-center"
          data-link
          href="/account"
        >
          <h2 class="text-2xl font-bold mb-2">Account</h2>
          <p>Change username, password, email, or profile picture.</p>
        </div>

        <div 
          class="bg-white shadow-xl rounded-2xl p-6 text-black cursor-pointer hover:scale-[1.02] transition
                 text-center flex flex-col items-center justify-center"
          data-link
          href="/stats"
        >
          <h2 class="text-2xl font-bold mb-2">Stats</h2>
          <p>View win ratio, match history, and leaderboard.</p>
        </div>

        <div 
          class="bg-white shadow-xl rounded-2xl p-6 text-black cursor-pointer hover:scale-[1.02] transition
                 text-center flex flex-col items-center justify-center"
          data-link
          href="/friends"
        >
          <h2 class="text-2xl font-bold mb-2">Friends</h2>
          <p>See your friends list and online status.</p>
        </div>

      </div>

    </div>
  `;
}
export function mountHomePage() {
    // Make entire card clickable
    document.querySelectorAll("[href][data-link]").forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            const href = el.getAttribute("href");
            if (href)
                history.pushState({}, "", href);
            window.dispatchEvent(new Event("popstate"));
        });
    });
}
