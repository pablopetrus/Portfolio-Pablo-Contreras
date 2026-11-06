/* A quiet particle field with a soft, orbiting response to the pointer. */
(() => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const hero = canvas.closest('.hero');
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!hero || !ctx) return;

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(pointer: fine)');
    const pointer = { x: -500, y: -500, targetX: -500, targetY: -500, strength: 0, active: false };
    const state = { width: 0, height: 0, dpr: 1, particles: [], ripples: [], visible: true, frame: 0, lastTime: 0 };
    const TAU = Math.PI * 2;
    const noise = n => {
        const value = Math.sin(n * 127.1 + 47.7) * 43758.5453;
        return value - Math.floor(value);
    };

    function buildParticles() {
        const desktop = finePointer.matches && state.width >= 720;
        const target = Math.min(desktop ? 520 : 125,
            Math.max(48, Math.round(state.width * state.height / (desktop ? 3400 : 4400))));
        const columns = Math.max(8, Math.round(Math.sqrt(target * state.width / state.height)));
        const rows = Math.max(6, Math.round(target / columns));
        const gapX = state.width / columns;
        const gapY = state.height / rows;
        state.particles = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const id = row * columns + col;
                const depth = 0.55 + noise(id + 31) * 0.85;
                const x = (col + 0.5 + (noise(id + 1) - 0.5) * 0.68) * gapX;
                const y = (row + 0.5 + (noise(id + 2) - 0.5) * 0.68) * gapY;
                state.particles.push({ x, y, baseX: x, baseY: y, vx: 0, vy: 0,
                    size: (0.65 + noise(id + 3) * 1.05) * depth,
                    phase: noise(id + 4) * TAU, depth, tone: noise(id + 5),
                    right: col < columns - 1 ? id + 1 : -1,
                    down: row < rows - 1 ? id + columns : -1 });
            }
        }
    }

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));
        const dpr = Math.min(devicePixelRatio || 1, 1.75);
        if (width === state.width && height === state.height && dpr === state.dpr) return;
        state.width = width;
        state.height = height;
        state.dpr = dpr;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildParticles();
        draw(performance.now(), 0);
    }

    function draw(now, step) {
        const { width, height, particles } = state;
        ctx.clearRect(0, 0, width, height);
        const time = now * 0.00035;
        const following = 1 - Math.pow(0.76, step);
        pointer.x += (pointer.targetX - pointer.x) * following;
        pointer.y += (pointer.targetY - pointer.y) * following;
        pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * (1 - Math.pow(0.84, step));
        const engaged = pointer.strength > 0.015 && !reduceMotion.matches;

        if (engaged) {
            const halo = ctx.createRadialGradient(pointer.x, pointer.y, 15, pointer.x, pointer.y, 195);
            halo.addColorStop(0, `rgba(232,117,0,${0.035 * pointer.strength})`);
            halo.addColorStop(0.48, `rgba(232,117,0,${0.022 * pointer.strength})`);
            halo.addColorStop(1, 'rgba(232,117,0,0)');
            ctx.fillStyle = halo;
            ctx.fillRect(pointer.x - 195, pointer.y - 195, 390, 390);
            ctx.save();
            ctx.translate(pointer.x, pointer.y);
            ctx.rotate(time * 0.8);
            ctx.lineWidth = 0.8;
            ctx.setLineDash([34, 37, 11, 44]);
            ctx.strokeStyle = `rgba(232,117,0,${0.18 * pointer.strength})`;
            ctx.beginPath();
            ctx.arc(0, 0, 125, 0, TAU);
            ctx.stroke();
            ctx.rotate(-time * 1.5);
            ctx.setLineDash([6, 29]);
            ctx.strokeStyle = `rgba(22,22,22,${0.11 * pointer.strength})`;
            ctx.beginPath();
            ctx.arc(0, 0, 93, 0, TAU);
            ctx.stroke();
            ctx.restore();
        }

        for (const particle of particles) {
            const ambient = reduceMotion.matches ? 0 : 2.4;
            let tx = particle.baseX + Math.cos(time * (1 + particle.depth * 0.2) + particle.phase) * ambient;
            let ty = particle.baseY + Math.sin(time * 0.8 + particle.phase) * ambient;
            if (engaged) {
                const dx = particle.baseX - pointer.x;
                const dy = particle.baseY - pointer.y;
                const distance = Math.max(1, Math.hypot(dx, dy));
                const influence = Math.max(0, 1 - distance / 205);
                if (influence) {
                    const lift = Math.pow(influence, 1.15) * 90 * particle.depth * pointer.strength;
                    const orbit = Math.sin(time * 2.3 + particle.phase * 0.5) * influence * 21 * pointer.strength;
                    tx += dx / distance * lift - dy / distance * orbit;
                    ty += dy / distance * lift + dx / distance * orbit;
                }
            }
            for (const ripple of state.ripples) {
                const dx = particle.baseX - ripple.x;
                const dy = particle.baseY - ripple.y;
                const distance = Math.max(1, Math.hypot(dx, dy));
                const age = Math.max(0, (now - ripple.start) / 740);
                const band = Math.exp(-Math.pow((distance - age * 255) / 54, 2));
                const push = band * (1 - age) * 39;
                tx += dx / distance * push;
                ty += dy / distance * push;
            }
            if (step) {
                const spring = 0.067 * step;
                const damping = Math.pow(0.79, step);
                particle.vx = (particle.vx + (tx - particle.x) * spring) * damping;
                particle.vy = (particle.vy + (ty - particle.y) * spring) * damping;
                particle.x += particle.vx * step;
                particle.y += particle.vy * step;
            }
        }

        // A small number of near neighbours hint at a technical mesh.
        ctx.lineWidth = 0.65;
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            for (const neighbour of [p.right, p.down]) {
                if (neighbour < 0 || noise(i * 3 + neighbour) > 0.34) continue;
                const q = particles[neighbour];
                if (Math.hypot(p.x - q.x, p.y - q.y) > 90) continue;
                const midX = (p.x + q.x) / 2;
                const midY = (p.y + q.y) / 2;
                const near = engaged ? Math.max(0, 1 - Math.hypot(midX - pointer.x, midY - pointer.y) / 190) * pointer.strength : 0;
                ctx.strokeStyle = near > 0.06 ? `rgba(232,117,0,${0.05 + near * 0.25})` : 'rgba(20,20,20,0.075)';
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(q.x, q.y);
                ctx.stroke();
            }
        }

        for (const p of particles) {
            const near = engaged ? Math.max(0, 1 - Math.hypot(p.x - pointer.x, p.y - pointer.y) / 220) * pointer.strength : 0;
            const orange = p.tone < 0.13 || near > 0.18 && p.tone < 0.69;
            ctx.fillStyle = orange ? `rgba(232,117,0,${0.42 + near * 0.46})` :
                p.tone < 0.57 ? `rgba(24,24,24,${0.26 + near * 0.24})` : `rgba(110,107,102,${0.26 + near * 0.2})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size + near * 0.48, 0, TAU);
            ctx.fill();
        }

        state.ripples = state.ripples.filter(ripple => now - ripple.start < 740);
        for (const ripple of state.ripples) {
            const age = Math.max(0, (now - ripple.start) / 740);
            ctx.strokeStyle = `rgba(232,117,0,${(1 - age) * 0.2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, age * 255, 0, TAU);
            ctx.stroke();
        }
    }

    function frame(now) {
        state.frame = 0;
        if (!state.visible || document.hidden || reduceMotion.matches) return;
        const step = Math.min(2, (now - (state.lastTime || now - 16.7)) / 16.7);
        state.lastTime = now;
        draw(now, step);
        schedule();
    }
    function schedule() {
        if (!state.frame && state.visible && !document.hidden && !reduceMotion.matches) {
            state.frame = requestAnimationFrame(frame);
        }
    }
    function movePointer(event) {
        if (!finePointer.matches) return;
        const rect = canvas.getBoundingClientRect();
        pointer.targetX = event.clientX - rect.left;
        pointer.targetY = event.clientY - rect.top;
        pointer.active = pointer.targetX >= 0 && pointer.targetX <= rect.width &&
            pointer.targetY >= 0 && pointer.targetY <= rect.height;
        schedule();
    }
    window.addEventListener('pointermove', movePointer, { passive: true });
    hero.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });
    hero.addEventListener('pointerdown', event => {
        if (!finePointer.matches || reduceMotion.matches) return;
        const rect = canvas.getBoundingClientRect();
        state.ripples.push({ x: event.clientX - rect.left, y: event.clientY - rect.top, start: performance.now() });
        schedule();
    }, { passive: true });
    document.addEventListener('visibilitychange', () => { state.lastTime = 0; schedule(); });
    reduceMotion.addEventListener('change', () => { state.lastTime = 0; resize(); draw(performance.now(), 0); schedule(); });
    new IntersectionObserver(entries => {
        state.visible = entries[0].isIntersecting;
        state.lastTime = 0;
        schedule();
    }).observe(hero);
    new ResizeObserver(resize).observe(canvas);
    resize();
    schedule();
})();
