class CodexZoomView {
    constructor(game) {
        this.game = game;
        this.removeFromWorld = false;
        this.isPopup = true;

        this.img = ASSET_MANAGER.getAsset("./Sprites/Room3/Codex.png");

        // Prevent instant close if I was used to open inventory
        this.wasIPressed = true;
    }

    update() {
        // Close on a fresh I press
        if (this.game.I && !this.wasIPressed) {
            this.removeFromWorld = true;
            this.game.examining = false;
            return;
        }
        this.wasIPressed = this.game.I;

        // ESC to close
        if (this.game.keys["Escape"]) {
            this.removeFromWorld = true;
            this.game.examining = false;
            return;
        }
    }

    draw(ctx) {
        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;

        // Dark overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, cw, ch);

        // Draw codex centered and large
        const maxW = cw * 0.9;
        const maxH = ch * 0.9;

        const w = Math.min(maxW, maxH); // keep it square-ish
        const h = w;

        const x = (cw - w) / 2;
        const y = (ch - h) / 2;

        if (this.img && this.img.complete && this.img.naturalWidth > 0) {
            ctx.drawImage(this.img, x, y, w, h);
        }

        // Small hint text
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("Press I or ESC to close", x + 20, y + h - 20);
    }
}