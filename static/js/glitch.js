class LetterGlitch {
    constructor(container, options = {}) {
        this.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;

        this.glitchColors = options.glitchColors || ['#0a3d1a', '#00ff41', '#00b33c'];
        this.glitchSpeed = options.glitchSpeed || 50;
        this.smooth = options.smooth !== undefined ? options.smooth : true;
        this.outerVignette = options.outerVignette !== undefined ? options.outerVignette : true;
        this.characters = options.characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789';

        this.fontSize = 16;
        this.charWidth = 10;
        this.charHeight = 20;
        this.letters = [];
        this.grid = { columns: 0, rows: 0 };
        this.ctx = null;
        this.animationId = null;
        this.lastGlitchTime = Date.now();

        this.init();
    }

    init() {
        /* Keep container fixed via CSS; only set overflow so we don't override position/width/height */
        this.container.style.overflow = 'hidden';

        this.canvas = document.createElement('canvas');
        this.canvas.style.display = 'block';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.container.appendChild(this.canvas);

        if (this.outerVignette) {
            const vignette = document.createElement('div');
            Object.assign(vignette.style, {
                position: 'absolute',
                top: '0', left: '0', width: '100%', height: '100%',
                pointerEvents: 'none',
                background: 'radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.9) 100%)'
            });
            this.container.appendChild(vignette);
        }

        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.animate();

        this._resizeHandler = () => {
            clearTimeout(this._resizeTimeout);
            this._resizeTimeout = setTimeout(() => {
                cancelAnimationFrame(this.animationId);
                this.resize();
                this.animate();
            }, 100);
        };
        window.addEventListener('resize', this._resizeHandler);
    }

    getRandomChar() {
        return this.characters[Math.floor(Math.random() * this.characters.length)];
    }

    getRandomColor() {
        return this.glitchColors[Math.floor(Math.random() * this.glitchColors.length)];
    }

    hexToRgb(hex) {
        hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_, r, g, b) => r+r+g+g+b+b);
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return m ? { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) } : null;
    }

    interpolateColor(s, e, f) {
        return `rgb(${Math.round(s.r+(e.r-s.r)*f)},${Math.round(s.g+(e.g-s.g)*f)},${Math.round(s.b+(e.b-s.b)*f)})`;
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const cols = Math.ceil(rect.width / this.charWidth);
        const rows = Math.ceil(rect.height / this.charHeight);
        this.grid = { columns: cols, rows: rows };

        this.letters = Array.from({ length: cols * rows }, () => ({
            char: this.getRandomChar(),
            color: this.getRandomColor(),
            targetColor: this.getRandomColor(),
            colorProgress: 1
        }));
        this.draw();
    }

    draw() {
        if (!this.ctx || !this.letters.length) return;
        const { width, height } = this.canvas.getBoundingClientRect();
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.font = `${this.fontSize}px monospace`;
        this.ctx.textBaseline = 'top';
        this.letters.forEach((l, i) => {
            this.ctx.fillStyle = l.color;
            this.ctx.fillText(
                l.char,
                (i % this.grid.columns) * this.charWidth,
                Math.floor(i / this.grid.columns) * this.charHeight
            );
        });
    }

    update() {
        const count = Math.max(1, Math.floor(this.letters.length * 0.05));
        for (let i = 0; i < count; i++) {
            const idx = Math.floor(Math.random() * this.letters.length);
            const letter = this.letters[idx];
            if (!letter) continue;
            letter.char = this.getRandomChar();
            letter.targetColor = this.getRandomColor();
            letter.colorProgress = this.smooth ? 0 : 1;
            if (!this.smooth) letter.color = letter.targetColor;
        }
    }

    smoothTransitions() {
        let redraw = false;
        this.letters.forEach(l => {
            if (l.colorProgress < 1) {
                l.colorProgress = Math.min(1, l.colorProgress + 0.05);
                const s = this.hexToRgb(l.color);
                const e = this.hexToRgb(l.targetColor);
                if (s && e) {
                    l.color = this.interpolateColor(s, e, l.colorProgress);
                    redraw = true;
                }
            }
        });
        if (redraw) this.draw();
    }

    animate() {
        const now = Date.now();
        if (now - this.lastGlitchTime >= this.glitchSpeed) {
            this.update();
            this.draw();
            this.lastGlitchTime = now;
        }
        if (this.smooth) this.smoothTransitions();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this._resizeHandler);
        this.container.innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const bg = document.getElementById('glitch-bg');
    if (bg) {
        new LetterGlitch(bg, {
            glitchColors: ['#062010', '#0d3d1a', '#083318'],
            glitchSpeed: 60,
            smooth: true,
            outerVignette: true,
            characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01!@#$%&*{}[]<>/\\|~^'
        });
    }
});
