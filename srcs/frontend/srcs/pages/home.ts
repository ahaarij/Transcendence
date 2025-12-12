import { t } from "../lang";

let animationFrameId: number | null = null;
let resizeHandler: (() => void) | null = null;

export function HomePage() {
  return `
    <div class="cyber-grid"></div>
    
    <div class="fixed inset-0 bg-gradient-to-b from-transparent via-[#050505]/90 to-[#050505] pointer-events-none -z-1"></div>

    <main class="flex-grow flex flex-col items-center justify-center text-center px-4 relative z-10 mt-10 w-full min-h-[80vh]">
        
        <h1 class="text-6xl md:text-8xl font-bold font-cyber mb-8 text-white tracking-tight">
            Ding Dong
        </h1>

        <p class="text-gray-400 text-lg max-w-xl mb-12 leading-relaxed font-light">
            ${t('home_play_desc')}
        </p>

        <div class="flex gap-6">
            <div data-link href="/play" class="btn-neon font-cyber">
                ${t('play')}
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-32 w-full max-w-7xl px-4">
            
            <div class="glass-card p-8 rounded-sm" data-link href="/play">
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

    <canvas id="bgCanvas" class="fixed inset-0 z-0 opacity-50 pointer-events-none"></canvas>
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

  const canvas = document.getElementById('bgCanvas') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  let width: number, height: number;
  let particles: Particle[] = [];

  function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
  }
  resizeHandler = resize;
  window.addEventListener('resize', resize);
  resize();


  // basically the background particles
  class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;

      constructor() {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.vx = (Math.random() - 0.5) * 0.2;
          this.vy = (Math.random() - 0.5) * 0.2;
          this.size = Math.random() * 1.5;
          this.color = Math.random() > 0.5 ? '#00f3ff' : '#ffffff';
      }

      update() {
          this.x += this.vx;
          this.y += this.vy;

          if (this.x < 0) this.x = width;
          if (this.x > width) this.x = 0;
          if (this.y < 0) this.y = height;
          if (this.y > height) this.y = 0;
      }

      draw() {
          if (!ctx) return;
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
      }
  }

  for (let i = 0; i < 40; i++) {
      particles.push(new Particle());
  }

  function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
          p.update();
          p.draw();
      });
      
      // connecting lines (constellation types)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist < 120) {
                  ctx.beginPath();
                  ctx.moveTo(particles[i].x, particles[i].y);
                  ctx.lineTo(particles[j].x, particles[j].y);
                  ctx.stroke();
              }
          }
      }
      
      animationFrameId = requestAnimationFrame(animate);
  }
  animate();
}

export function unmountHomePage() {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
        resizeHandler = null;
    }
}