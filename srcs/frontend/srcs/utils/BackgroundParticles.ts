export class BackgroundParticles {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private width: number = 0;
    private height: number = 0;
    private particles: Particle[] = [];
    private animationFrameId: number | null = null;

    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'global-bg-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0'; // On top of grid (-1), behind content (10)
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.opacity = '0.8';
        document.body.appendChild(this.canvas);

        const context = this.canvas.getContext('2d');
        if (!context) throw new Error('Could not get 2d context');
        this.ctx = context;

        this.resize = this.resize.bind(this);
        this.animate = this.animate.bind(this);

        window.addEventListener('resize', this.resize);
        this.resize();
        this.initParticles();
        this.animate();
    }

    private resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    private initParticles() {
        this.particles = [];
        for (let i = 0; i < 40; i++) {
            this.particles.push(new Particle(this.width, this.height));
        }
    }

    private animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.particles.forEach(p => {
            p.update(this.width, this.height);
            p.draw(this.ctx);
        });
        
        // connecting lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
        
        this.animationFrameId = requestAnimationFrame(this.animate);
    }
}

class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;

    constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 2.0;
        this.color = Math.random() > 0.5 ? '#00f3ff' : '#ffffff';
    }

    update(width: number, height: number) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
