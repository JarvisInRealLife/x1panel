class LetterGlitch {
    constructor(container, options = {}) {
        this.container = typeof container === 'string'
            ? document.querySelector(container) : container;
        if (!this.container) return;

        this.glitchColors = options.glitchColors || ['#062010', '#0d3d1a', '#083318'];
        this.glitchSpeed = options.glitchSpeed || 60;
        this.smooth = options.smooth !== undefined ? options.smooth : true;
        this.outerVignette = options.outerVignette !== undefined ? options.outerVignette : true;
        this.characters = options.characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01!@#$%&*{}[]<>/\\|~^';

        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
        this.fontSize = this.isMobile ? 12 : 16;
        this.charWidth = this.isMobile ? 8 : 10;
        this.charHeight = this.isMobile ? 16 : 20;

        if (this.isMobile) {
            this.glitchSpeed = Math.max(this.glitchSpeed, 120);
            this.smooth = false;
        }

        this.letters = [];
        this.grid = { columns: 0, rows: 0 };
        this.ctx = null;
        this.animationId = null;
        this.lastGlitchTime = Date.now();

        this.init();
    }

    init() {
        this.container.style.overflow = 'hidden';

        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = 'display:block;width:100%;height:100%;position:absolute;top:0;left:0;';
        this.container.appendChild(this.canvas);

        if (this.outerVignette) {
            const v = document.createElement('div');
            v.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;' +
                'background:radial-gradient(circle,rgba(0,0,0,0) 40%,rgba(0,0,0,0.9) 100%)';
            this.container.appendChild(v);
        }

        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.animate();

        let resizeTimer;
        this._resizeHandler = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                cancelAnimationFrame(this.animationId);
                this.resize();
                this.animate();
            }, 150);
        };
        window.addEventListener('resize', this._resizeHandler);
    }

    getRandomChar() {
        return this.characters[Math.floor(Math.random() * this.characters.length)];
    }
    getRandomColor() {
        return this.glitchColors[Math.floor(Math.random() * this.glitchColors.length)];
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = this.container.clientWidth || window.innerWidth;
        const h = this.container.clientHeight || window.innerHeight;

        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const cols = Math.ceil(w / this.charWidth);
        const rows = Math.ceil(h / this.charHeight);
        this.grid = { columns: cols, rows: rows };

        this.letters = [];
        const total = cols * rows;
        for (let i = 0; i < total; i++) {
            this.letters.push({
                char: this.getRandomChar(),
                color: this.getRandomColor()
            });
        }
        this.draw();
    }

    draw() {
        if (!this.ctx || !this.letters.length) return;
        const w = this.canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
        const h = this.canvas.height / (Math.min(window.devicePixelRatio || 1, 2));
        this.ctx.clearRect(0, 0, w, h);
        this.ctx.font = `${this.fontSize}px monospace`;
        this.ctx.textBaseline = 'top';
        for (let i = 0, len = this.letters.length; i < len; i++) {
            this.ctx.fillStyle = this.letters[i].color;
            this.ctx.fillText(
                this.letters[i].char,
                (i % this.grid.columns) * this.charWidth,
                Math.floor(i / this.grid.columns) * this.charHeight
            );
        }
    }

    update() {
        const count = Math.max(1, Math.floor(this.letters.length * (this.isMobile ? 0.02 : 0.05)));
        for (let i = 0; i < count; i++) {
            const idx = Math.floor(Math.random() * this.letters.length);
            this.letters[idx].char = this.getRandomChar();
            this.letters[idx].color = this.getRandomColor();
        }
    }

    animate() {
        const now = Date.now();
        if (now - this.lastGlitchTime >= this.glitchSpeed) {
            this.update();
            this.draw();
            this.lastGlitchTime = now;
        }
        this.animationId = requestAnimationFrame(() => this.animate());
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
