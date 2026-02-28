import { useEffect, useRef } from 'react';

const COLORS = ['#8b5cf6', '#c084fc', '#e879f9', '#2dd4bf', '#f472b6'];
const POOL_SIZE = 400; // Max particles allowed on screen at once

class Particle {
    active: boolean = false;
    x: number = 0;
    y: number = 0;
    size: number = 0;
    angle: number = 0;
    speedX: number = 0;
    speedY: number = 0;
    life: number = 0;
    maxLife: number = 0;
    color: string = '';
    rotationSpeed: number = 0;

    // We no longer constructor-initialize, we "spawn" to reuse the same memory chunk
    spawn(x: number, y: number, color: string) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 4;
        this.angle = Math.random() * Math.PI * 2;

        const speedMultiplier = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * speedMultiplier;
        this.speedY = (Math.random() - 0.5) * speedMultiplier;

        this.life = 0;
        this.maxLife = Math.random() * 30 + 40;
        this.color = color;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        if (!this.active) return;
        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += this.rotationSpeed;
        this.life++;

        this.speedX *= 0.98;
        this.speedY *= 0.98;

        if (this.life >= this.maxLife) {
            this.active = false;
        }
    }

    draw(ctx: CanvasRenderingContext2D, dpr: number) {
        if (!this.active) return;

        const progress = this.life / this.maxLife;
        const opacity = 1 - progress;
        const currentSize = this.size * (1 - progress);

        ctx.globalAlpha = opacity;
        ctx.fillStyle = this.color;

        // Uses setTransform instead of save/restore for better iteration performance
        ctx.setTransform(dpr, 0, 0, dpr, this.x * dpr, this.y * dpr);
        ctx.rotate(this.angle);

        ctx.beginPath();
        ctx.moveTo(0, -currentSize);
        ctx.lineTo(currentSize * 0.866, currentSize * 0.5);
        ctx.lineTo(-currentSize * 0.866, currentSize * 0.5);
        ctx.closePath();
        ctx.fill();
    }
}

const CustomCursor = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 1. Maintain a single pre-allocated pool (Data-Oriented approach)
    const particlePool = useRef<Particle[]>([]);
    const poolIndex = useRef(0);

    const lastMouse = useRef({ x: 0, y: 0 });
    const isReady = useRef(false);

    // 2. Track whether the loop is currently running to prevent dual-loops
    const isAnimating = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true }); // optimize browser compositing
        if (!ctx) return;

        // Initialize particle pool once
        if (particlePool.current.length === 0) {
            particlePool.current = Array.from({ length: POOL_SIZE }, () => new Particle());
        }

        if (!isReady.current) {
            lastMouse.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            isReady.current = true;
        }

        let animationFrameId: number;
        let dpr = window.devicePixelRatio || 1;

        const render = () => {
            // Need to apply DPR identity prior to clearing
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let hasActiveParticles = false;

            for (let i = 0; i < POOL_SIZE; i++) {
                const p = particlePool.current[i];
                if (p.active) {
                    p.update();
                    p.draw(ctx, dpr);
                    hasActiveParticles = true;
                }
            }

            // 4. Auto-pause the simulation when done
            if (hasActiveParticles) {
                isAnimating.current = true;
                animationFrameId = requestAnimationFrame(render);
            } else {
                isAnimating.current = false;
            }
        };

        const resize = () => {
            dpr = window.devicePixelRatio || 1;
            // 3. Retina display pixel ratio fixes
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            // Re-render immediately on resize to prevent flickering
            if (!isAnimating.current) render();
        };

        window.addEventListener('resize', resize);
        resize();

        const spawnParticle = (x: number, y: number) => {
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const particle = particlePool.current[poolIndex.current];
            particle.spawn(x, y, color);

            // Ring buffer increments
            poolIndex.current = (poolIndex.current + 1) % POOL_SIZE;
        };



        const onMouseMove = (e: MouseEvent) => {
            const currentMouse = { x: e.clientX, y: e.clientY };
            const dx = currentMouse.x - lastMouse.current.x;
            const dy = currentMouse.y - lastMouse.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const spawnCount = Math.min(Math.floor(dist / 5), 10);

            if (spawnCount > 0) {
                for (let i = 0; i < spawnCount; i++) {
                    const t = Math.random();
                    const px = lastMouse.current.x + dx * t;
                    const py = lastMouse.current.y + dy * t;
                    spawnParticle(px, py);
                }
            } else if (Math.random() > 0.5) {
                spawnParticle(currentMouse.x, currentMouse.y);
            }

            lastMouse.current = currentMouse;

            // Reboot the animation loop if it was asleep
            if (!isAnimating.current) {
                isAnimating.current = true;
                render();
            }
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true }); // Optimize wheel/scroll jank

        // Kick off first render
        render();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                pointerEvents: 'none', // Critical, allows clicks to pass through
                zIndex: 9999
            }}
        />
    );
};

export default CustomCursor;
