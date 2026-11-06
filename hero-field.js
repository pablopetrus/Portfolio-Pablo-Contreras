/* Sparse, drifting particle current. No drawn cursor rings or mesh. */
(() => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const hero = canvas.closest('.hero');
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!hero || !ctx) return;

    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(pointer: fine)');
    const TAU = Math.PI * 2;
    const pointer = { x: 0, y: 0, toX: 0, toY: 0, active: false, force: 0 };
    const field = { width: 0, height: 0, dpr: 1, radius: 0, particles: [], dust: [],
        visible: true, frame: 0, last: 0 };
    function random(seed) {
        const n = Math.sin(seed * 127.1 + 78.233) * 43758.5453;
        return n - Math.floor(n);
    }

    function position(p, time) {
        const movement = motion.matches ? 0 : time;
        const centerX = field.width * (0.44 + Math.sin(movement * 0.23) * 0.11) -
            (pointer.x - field.width * 0.5) * 0.70 * pointer.force;
        const centerY = field.height * (0.51 + Math.cos(movement * 0.19) * 0.10) -
            (pointer.y - field.height * 0.5) * 0.30 * pointer.force;
        const ratio = p.radius / field.radius;
        const angle = p.angle + movement * (0.095 + ratio * 0.055) +
            Math.sin(movement * 0.37 + p.phase) * 0.025;
        const radius = p.radius + Math.sin(movement * 0.7 + p.phase) * 3;
        let x = centerX + Math.cos(angle) * radius * 1.17;
        let y = centerY + Math.sin(angle) * radius * 0.80;

        // The cursor opens a quiet area in the current; particles have inertia.
        if (pointer.force > 0.01) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const distance = Math.max(1, Math.hypot(dx, dy));
            const reach = 290;
            if (distance < reach) {
                const influence = Math.pow(1 - distance / reach, 1.6) * pointer.force;
                x += dx / distance * influence * 145;
                y += dy / distance * influence * 145;
            }
        }
        return { x, y, angle };
    }

    function makeField() {
        const desktop = finePointer.matches && field.width >= 720;
        const target = Math.min(desktop ? 460 : 130,
            Math.max(70, Math.round(field.width * field.height / (desktop ? 2400 : 5300))));
        const spokes = desktop ? 24 : 17;
        const rings = Math.ceil(target / spokes);
        field.radius = Math.max(field.width, field.height) * (desktop ? 0.52 : 0.72);
        field.particles = [];
        for (let i = 0; i < spokes * rings; i++) {
            const ring = Math.floor(i / spokes);
            const spoke = i % spokes;
            const progress = (ring + 0.32 + random(i + 4) * 0.52) / rings;
            const radius = (55 + Math.pow(progress, 0.88) * field.radius) *
                (0.94 + random(i + 9) * 0.12);
            const angle = spoke * TAU / spokes + progress * 1.7 + (random(i + 13) - 0.5) * 0.40;
            const p = { radius, angle, phase: random(i + 20) * TAU,
                length: 2.7 + random(i + 40) * 2.6,
                width: 1.05 + random(i + 51) * 0.55,
                tone: random(i + 72), alpha: 0.86 + random(i + 84) * 0.14,
                x: 0, y: 0, vx: 0, vy: 0 };
            const initial = position(p, 0);
            p.x = initial.x;
            p.y = initial.y;
            field.particles.push(p);
        }
        field.dust = Array.from({ length: desktop ? 105 : 35 }, (_, i) => ({
            x: random(i + 1100) * field.width,
            y: random(i + 1200) * field.height,
            alpha: 0.07 + random(i + 1300) * 0.09
        }));
    }

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));
        const dpr = Math.min(devicePixelRatio || 1, 1.75);
        if (width === field.width && height === field.height && dpr === field.dpr) return;
        field.width = width;
        field.height = height;
        field.dpr = dpr;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        makeField();
        paint(0, 0);
    }

    function paint(time, step) {
        ctx.clearRect(0, 0, field.width, field.height);
        if (step) {
            const follow = 1 - Math.pow(0.78, step);
            pointer.x += (pointer.toX - pointer.x) * follow;
            pointer.y += (pointer.toY - pointer.y) * follow;
            pointer.force += ((pointer.active ? 1 : 0) - pointer.force) * (1 - Math.pow(0.84, step));
        }
        ctx.fillStyle = '#202020';
        for (const speck of field.dust) {
            ctx.globalAlpha = speck.alpha;
            ctx.fillRect(speck.x, speck.y, 0.9, 0.9);
        }
        ctx.globalAlpha = 1;
        ctx.lineCap = 'round';
        for (const p of field.particles) {
            const target = position(p, time);
            if (step) {
                const spring = 0.072 * step;
                const drag = Math.pow(0.81, step);
                p.vx = (p.vx + (target.x - p.x) * spring) * drag;
                p.vy = (p.vy + (target.y - p.y) * spring) * drag;
                p.x += p.vx * step;
                p.y += p.vy * step;
            }
            const depth = p.radius / field.radius;
            const dashLength = p.length * (0.65 + depth * 0.55);
            const direction = target.angle + Math.PI * 0.44;
            const dx = Math.cos(direction) * dashLength * 0.5;
            const dy = Math.sin(direction) * dashLength * 0.5;
            const textDistance = Math.hypot(
                (p.x - field.width * 0.5) / (field.width * 0.28),
                (p.y - field.height * 0.45) / (field.height * 0.35));
            const clarity = 0.32 + Math.min(1, textDistance) * 0.68;
            ctx.globalAlpha = Math.min(1, p.alpha * (0.78 + depth * 0.22) * clarity);
            const warmth = Math.sin(p.angle + 0.7) + (p.tone - 0.5) * 0.45;
            ctx.strokeStyle = warmth > 0.54 ? '#e87500' :
                warmth > 0.34 ? '#bd6a2a' :
                p.tone < 0.64 ? '#262626' : '#5c5752';
            ctx.lineWidth = p.width * (0.75 + depth * 0.45);
            ctx.beginPath();
            ctx.moveTo(p.x - dx, p.y - dy);
            ctx.lineTo(p.x + dx, p.y + dy);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    function tick(now) {
        field.frame = 0;
        if (!field.visible || document.hidden || motion.matches) return;
        const step = Math.min(2, Math.max(0, (now - (field.last || now - 16.7)) / 16.7));
        field.last = now;
        paint(now * 0.001, step);
        schedule();
    }
    function schedule() {
        if (!field.frame && field.visible && !document.hidden && !motion.matches) {
            field.frame = requestAnimationFrame(tick);
        }
    }
    function move(event) {
        if (!finePointer.matches) return;
        const rect = canvas.getBoundingClientRect();
        pointer.toX = event.clientX - rect.left;
        pointer.toY = event.clientY - rect.top;
        pointer.active = pointer.toX >= 0 && pointer.toX <= rect.width &&
            pointer.toY >= 0 && pointer.toY <= rect.height;
        schedule();
    }
    window.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });
    document.addEventListener('visibilitychange', () => { field.last = 0; schedule(); });
    motion.addEventListener('change', () => { field.last = 0; paint(0, 0); schedule(); });
    new IntersectionObserver(entries => {
        field.visible = entries[0].isIntersecting;
        field.last = 0;
        schedule();
    }).observe(hero);
    new ResizeObserver(resize).observe(canvas);
    resize();
    schedule();
})();
