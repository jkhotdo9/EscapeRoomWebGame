class StartSplashScreen {
    constructor(game) {
        this.game = game;

        // TitleScreen.png (2048x2048, two 1024x1024 frames side by side)
        this.sheetPath = "./Sprites/Start/TitleScreen.png";
        this.sheet = ASSET_MANAGER.getAsset(this.sheetPath);

        this.frameW = 1024;
        this.frameH = 1024;

        // Crop values
        this.cropX = 60;
        this.cropY = 277;
        this.cropW = 920;
        this.cropH = 588;

        // Lock to the left frame
        this.frameIndex = 0;

        this.pulse = 0;
    }

    update() {
        this.pulse += this.game.clockTick;

        // On click or Enter key, switch to TitleScreen
        if (this.game.click || (this.game.keys && this.game.keys["Enter"])) {
            this.game.click = null;
            if (this.game.keys) this.game.keys["Enter"] = false;
            this.goToTitle();
        }
    }

    goToTitle() {
        if (this.game.entities) this.game.entities.length = 0;
        this.game.addEntity(new TitleScreen(this.game));
    }

    draw(ctx) {
        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;

        // Fill background with black
        ctx.save();
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cw, ch);
        ctx.restore();

        const sheet = this.sheet || ASSET_MANAGER.getAsset(this.sheetPath);
        if (!sheet) return;

        // Draw only the cropped area from the left frame, scaled to fill the screen
        const sx = this.frameIndex * this.frameW + this.cropX;
        const sy = this.cropY;

        ctx.imageSmoothingEnabled = false;
        
        ctx.drawImage(
            sheet,
            sx, sy, this.cropW, this.cropH,
            0, 0, cw, ch
        );

        // Pulsing instruction text
        const t = 0.5 + 0.5 * Math.sin(this.pulse * 2.6);
        ctx.save();
        ctx.fillStyle = `rgba(255,255,255,${0.6 + 0.3 * t})`;
        ctx.font = "22px Arial";
        ctx.textAlign = "center";
        ctx.fillText("CLICK IF YOU DARE", cw / 2, ch - 40);
        ctx.restore();
    }
}
