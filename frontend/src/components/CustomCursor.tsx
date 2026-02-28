import { useEffect, useRef } from 'react';

const COLORS = ['#8b5cf6', '#c084fc', '#e879f9', '#2dd4bf', '#f472b6'];

class Particle {
    x: number;
    y: number;
    size: number;
    angle: number;
    speedMultiplier: number;
    speedX: number;
    speedY: number;
    life: number;
    maxLife: number;
    color: string;
    rotationSpeed: number;

    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 4; // 4 to 12
        this.angle = Math.random() * Math.PI * 2;
        this.speedMultiplier = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * this.speedMultiplier;
        this.speedY = (Math.random() - 0.5) * this.speedMultiplier;
        this.life = 0;
        this.maxLife = Math.random() * 30 + 40; // 40 to 70 frames
        this.color = color;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += this.rotationSpeed;
        this.life++;
        // slight drag
        this.speedX *= 0.98;
        this.speedY *= 0.98;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const progress = this.life / this.maxLife;
        const opacity = 1 - progress;
        const currentSize = this.size * (1 - progress);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.globalAlpha = opacity;
        ctx.fillStyle = this.color;

        // Draw triangle
        ctx.beginPath();
        // Pointing up: (0, -size), bottom right: (size*cos30, size*sin30), bottom left: (-size*cos30, size*sin30)
        ctx.moveTo(0, -currentSize);
        ctx.lineTo(currentSize * 0.866, currentSize * 0.5);
        ctx.lineTo(-currentSize * 0.866, currentSize * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

const CustomCursor = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);

    // Use an object to hold the ref value, but initialize it inside useEffect
    // to avoid accessing window during SSR (though this shouldn't be an issue in Vite SPA).
    const lastMouse = useRef({ x: 0, y: 0 });
    const isReady = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (!isReady.current) {
            lastMouse.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            isReady.current = true;
        }

        let animationFrameId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        const onMouseMove = (e: MouseEvent) => {
            const currentMouse = { x: e.clientX, y: e.clientY };
            const dx = currentMouse.x - lastMouse.current.x;
            const dy = currentMouse.y - lastMouse.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Spawn particles based on distance moved
            const spawnCount = Math.min(Math.floor(dist / 5), 10);

            if (spawnCount > 0) {
                for (let i = 0; i < spawnCount; i++) {
                    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
                    const t = Math.random();
                    const px = lastMouse.current.x + dx * t;
                    const py = lastMouse.current.y + dy * t;
                    particles.current.push(new Particle(px, py, color));
                }
            } else {
                // Even if moving slowly, spawn at least one occasionally
                if (Math.random() > 0.5) {
                    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
                    particles.current.push(new Particle(currentMouse.x, currentMouse.y, color));
                }
            }
            lastMouse.current = currentMouse;
        };

        window.addEventListener('mousemove', onMouseMove);

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const newParticles = [];
            for (const p of particles.current) {
                p.update();
                if (p.life < p.maxLife) {
                    p.draw(ctx);
                    newParticles.push(p);
                }
            }
            particles.current = newParticles;

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 9999
            }}
        />
    );
};

export default CustomCursor;
