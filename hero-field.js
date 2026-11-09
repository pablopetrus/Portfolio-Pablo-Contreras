/* Quiet vector flow: a still mathematical drawing with slight pointer parallax. */
(() => {
    const canvas = document.getElementById('hero-canvas');
    const hero = canvas?.closest('.hero');
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!hero || !ctx) return;

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const state = { width: 0, height: 0, dpr: 1, x: 0, y: 0, targetX: 0, targetY: 0, frame: 0 };

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));
        const dpr = Math.min(devicePixelRatio || 1, 1.5);
        if (width === state.width && height === state.height && dpr === state.dpr) return;
        state.width = width;
        state.height = height;
        state.dpr = dpr;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw();
    }

    function point(lane, progress) {
        const { width: w, height: h } = state;
        const x = (-0.16 + progress * 1.32) * w + state.x * 9;
        const baseline = h * (0.78 + lane * 0.275);
        const lift = h * (0.5 + lane * 0.045) * Math.sin(progress * Math.PI * 0.87);
        const wave = h * 0.031 * Math.sin(progress * Math.PI * 2.1 + lane * 3.6);
        return [x, baseline - lift + wave + state.y * 6];
    }

    function draw() {
        const { width: w, height: h } = state;
        ctx.clearRect(0, 0, w, h);
        const mobile = w < 700;
        const count = mobile ? 17 : 43;
        const steps = mobile ? 56 : 96;
        ctx.lineCap = 'round';

        for (let i = 0; i < count; i++) {
            const lane = (i / (count - 1)) * 2 - 1;
            const accent = mobile ? i === 6 : (i === 10 || i === 16 || i === 22 || i === 29);
            const gradient = ctx.createLinearGradient(0, h * 0.72, w, h * 0.12);
            if (accent) {
                gradient.addColorStop(0, `rgba(232,117,0,${mobile ? 0.26 : 0.52})`);
                gradient.addColorStop(0.48, `rgba(232,117,0,${mobile ? 0.16 : 0.34})`);
                gradient.addColorStop(1, 'rgba(232,117,0,0.02)');
            } else {
                const alpha = mobile ? 0.10 : 0.17 + (i % 5 === 0 ? 0.06 : 0);
                gradient.addColorStop(0, `rgba(28,28,28,${alpha})`);
                gradient.addColorStop(0.55, `rgba(72,69,65,${alpha * 0.72})`);
                gradient.addColorStop(1, 'rgba(90,86,82,0.02)');
            }
            ctx.strokeStyle = gradient;
            ctx.lineWidth = accent ? 1.25 : mobile ? 0.65 : 0.82;
            ctx.beginPath();
            for (let step = 0; step <= steps; step++) {
                const [x, y] = point(lane, step / steps);
                if (step === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Keep the name, proposition and calls to action on clean paper.
        ctx.globalCompositeOperation = 'destination-out';
        const centerX = w * 0.5;
        const centerY = h * 0.44;
        const radius = Math.min(w * 0.38, h * 0.58);
        const clearing = ctx.createRadialGradient(centerX, centerY, radius * 0.34,
            centerX, centerY, radius);
        clearing.addColorStop(0, 'rgba(0,0,0,0.98)');
        clearing.addColorStop(0.55, 'rgba(0,0,0,0.86)');
        clearing.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = clearing;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
    }

    function settle() {
        state.frame = 0;
        if (document.hidden || reducedMotion.matches) return;
        state.x += (state.targetX - state.x) * 0.11;
        state.y += (state.targetY - state.y) * 0.11;
        draw();
        if (Math.abs(state.targetX - state.x) + Math.abs(state.targetY - state.y) > 0.002) {
            state.frame = requestAnimationFrame(settle);
        }
    }
    function schedule() {
        if (!state.frame && !document.hidden && !reducedMotion.matches) {
            state.frame = requestAnimationFrame(settle);
        }
    }
    hero.addEventListener('pointermove', event => {
        if (state.width < 700 || reducedMotion.matches) return;
        const rect = canvas.getBoundingClientRect();
        state.targetX = (event.clientX - rect.left) / rect.width * 2 - 1;
        state.targetY = (event.clientY - rect.top) / rect.height * 2 - 1;
        schedule();
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
        state.targetX = 0;
        state.targetY = 0;
        schedule();
    }, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    reducedMotion.addEventListener('change', () => {
        state.x = state.y = state.targetX = state.targetY = 0;
        draw();
    });
    new ResizeObserver(resize).observe(canvas);
    resize();
})();
