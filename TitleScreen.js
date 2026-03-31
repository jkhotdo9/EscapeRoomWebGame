class TitleScreen {
    constructor(game) {
        this.game = game;

        // ===== ASSETS =====
        this.bgPath = "./Sprites/Start/TitleScreen.png";
        this.lightningSheetPath = "./Sprites/Start/LightningSheet.png";

        this.startSignPath = "./Sprites/Start/StartSign.png";
        this.controlsSignPath = "./Sprites/Start/ControlsSign.png";
        this.selectorSignPath = "./Sprites/Start/SelectorSign.png";

        // ===== MENU LAYOUT =====
        this.menuX = 70;
        this.menuY = 520;
        this.menuSpacing = 75;

        this.selectedIndex = 0;
        this.menuCooldown = 0;
        this.showControls = false;

        // ===== HITBOX TUNED =====
        this.hitW = 260;
        this.hitH = 60;
        this.hitOffsetX = 70;
        this.hitOffsetY = 120;

        // ===== DEBUG =====
        this.debugHitbox = false; 

        // ===== BACKGROUND CROP =====
        this.cropX = 1055;
        this.cropY = 277;
        this.cropW = 939;
        this.cropH = 588;

        // ===== LIGHTNING =====
        this.lightningCols = 8;
        this.lightningRows = 4;
        this.lightningCellW = 256;
        this.lightningCellH = 307;

        this.lightningPhase = "idle";
        this.lightningPhaseTime = 0;
        this.lightningAlpha = 0;

        this.nextLightning = this.randRange(2.2, 2.8);
        this.nextLightningAfter = () => this.randRange(6.0, 9.0);

        this.lightningSequence = [0, 2, 4, 6, 8, 6, 4, 2, 0];
        this.lightningFps = 14;

        this.bgRect = null;
        this.startRect = null;
        this.controlsRect = null;

        // Intro BGM
        if (this.game.introAudio && this.game.introAudio.paused) {
            this.game.introAudio.play().catch(() => {});
        }
    }

    update() {
        this.updateLightning();

        if (this.menuCooldown > 0) this.menuCooldown--;

        // ===== CONTROLS OVERLAY =====
        if (this.showControls) {
            // Enter to close
            if (this.game.keys["Enter"] && this.menuCooldown === 0) {
                this.game.keys["Enter"] = false;
                this.showControls = false;
                this.menuCooldown = 12;
            }

            // Click to close
            if (this.game.click && this.menuCooldown === 0) {
                this.game.click = null;
                this.showControls = false;
                this.menuCooldown = 12;
            }

            return;
        }

        // ===== HITBOX DEFINITIONS =====
        this.startRect = {
            x: this.menuX + this.hitOffsetX,
            y: this.menuY + this.hitOffsetY,
            w: this.hitW,
            h: this.hitH
        };

        this.controlsRect = {
            x: this.menuX + this.hitOffsetX,
            y: this.menuY + this.menuSpacing + this.hitOffsetY,
            w: this.hitW,
            h: this.hitH
        };

        // ===== MOUSE INPUT =====
        if (this.game.mouse && this.menuCooldown === 0 && !this.game.keyboardActive) {
            const { x, y } = this.game.mouse;

            if (this.pointInRect(x, y, this.startRect)) {
                this.selectedIndex = 0;
            } else if (this.pointInRect(x, y, this.controlsRect)) {
                this.selectedIndex = 1;
            }

            if (this.game.click) {
                const { x: cx, y: cy } = this.game.click;

                if (this.pointInRect(cx, cy, this.startRect)) {
                    this.startGame();
                    this.menuCooldown = 12;
                } else if (this.pointInRect(cx, cy, this.controlsRect)) {
                    this.showControls = true;
                    this.menuCooldown = 12;
                }

                this.game.click = null;
            }
        }

        // ===== KEYBOARD INPUT =====
        if (this.menuCooldown === 0) {
            if (this.game.keys["ArrowDown"] || this.game.keys["s"] || this.game.keys["S"]) {
                this.game.keys["ArrowDown"] = false;
                this.game.keys["s"] = false;
                this.game.keys["S"] = false;

                this.selectedIndex = Math.min(1, this.selectedIndex + 1);
                this.menuCooldown = 10;

            } else if (this.game.keys["ArrowUp"] || this.game.keys["w"] || this.game.keys["W"]) {
                this.game.keys["ArrowUp"] = false;
                this.game.keys["w"] = false;
                this.game.keys["W"] = false;

                this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                this.menuCooldown = 10;

            } else if (this.game.keys["Enter"]) {
                this.game.keys["Enter"] = false;

                if (this.selectedIndex === 0) {
                    this.startGame();
                } else {
                    this.showControls = true;
                }

                this.menuCooldown = 12;
            }
        }
    }

    pointInRect(px, py, r) {
        return (
            px >= r.x &&
            px <= r.x + r.w &&
            py >= r.y &&
            py <= r.y + r.h
        );
    }

    updateLightning() {
        this.nextLightning -= this.game.clockTick;

        if (this.lightningPhase === "idle" && this.nextLightning <= 0) {
            this.lightningPhase = "flash";
            this.lightningPhaseTime = 0;
            this.lightningAlpha = 1;
        }

        if (this.lightningPhase !== "idle") {
            this.lightningPhaseTime += this.game.clockTick;
            const total = this.lightningSequence.length / this.lightningFps;
            const t = Math.min(1, this.lightningPhaseTime / total);
            this.lightningAlpha = (1 - t) * 0.85 + 0.15;

            if (this.lightningPhaseTime >= total) {
                this.lightningPhase = "idle";
                this.lightningPhaseTime = 0;
                this.lightningAlpha = 0;
                this.nextLightning = this.nextLightningAfter();
            }
        }
    }

    draw(ctx) {
        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cw, ch);

        const bg = ASSET_MANAGER.getAsset(this.bgPath);
        if (bg) {
            const scale = Math.max(cw / this.cropW, ch / this.cropH);
            const dw = this.cropW * scale;
            const dh = this.cropH * scale;
            const dx = (cw - dw) / 2;
            const dy = (ch - dh) / 2;

            this.bgRect = { x: dx, y: dy, w: dw, h: dh };

            ctx.drawImage(
                bg,
                this.cropX, this.cropY, this.cropW, this.cropH,
                dx, dy, dw, dh
            );
        }

        this.drawLightning(ctx);

        const startSign = ASSET_MANAGER.getAsset(this.startSignPath);
        const controlsSign = ASSET_MANAGER.getAsset(this.controlsSignPath);
        const selectorSign = ASSET_MANAGER.getAsset(this.selectorSignPath);

        if (startSign) ctx.drawImage(startSign, this.menuX, this.menuY);
        if (controlsSign) ctx.drawImage(controlsSign, this.menuX, this.menuY + this.menuSpacing);

        if (selectorSign) {
            const selectorX = this.menuX - 32;
            let selY = this.menuY + this.menuSpacing * this.selectedIndex;
            const ref = this.selectedIndex === 0 ? startSign : controlsSign;
            if (ref) selY += (ref.height - selectorSign.height) / 2;
            ctx.drawImage(selectorSign, selectorX, selY);
        }

        // ===== CONTROLS OVERLAY DRAW =====
        if (this.showControls) {
            ctx.save();
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, cw, ch);
            ctx.restore();

            ctx.fillStyle = "#fff";
            ctx.font = "28px Arial";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText("Controls", 80, 120);

            ctx.font = "20px Arial";
            ctx.fillText("WASD or Arrow Keys: Move", 80, 170);
            ctx.fillText("E: Interact", 80, 205);
            ctx.fillText("I: Inventory", 80, 240);
            ctx.fillText("Enter / Click / Esc: Back", 80, 275);
        }

        // ===== DEBUG HITBOX DRAW =====
        if (this.debugHitbox && this.startRect && this.controlsRect) {
            ctx.save();
            ctx.globalAlpha = 0.35;
            ctx.lineWidth = 2;

            ctx.strokeStyle = "lime";
            ctx.strokeRect(
                this.startRect.x,
                this.startRect.y,
                this.startRect.w,
                this.startRect.h
            );

            ctx.strokeStyle = "cyan";
            ctx.strokeRect(
                this.controlsRect.x,
                this.controlsRect.y,
                this.controlsRect.w,
                this.controlsRect.h
            );

            ctx.restore();
        }
        this.drawFlash(ctx);
    }

    drawLightning(ctx) {
        if (this.lightningPhase === "idle") return;
        if (!this.bgRect) return;

        const sheet = ASSET_MANAGER.getAsset(this.lightningSheetPath);
        if (!sheet) return;

        const idx = Math.floor(this.lightningPhaseTime * this.lightningFps);
        const frame = this.lightningSequence[Math.min(idx, this.lightningSequence.length - 1)];

        const col = frame % this.lightningCols;
        const row = Math.floor(frame / this.lightningCols);

        const sx = col * this.lightningCellW;
        const sy = row * this.lightningCellH;

        const r = this.bgRect;

        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = this.lightningAlpha * 0.55;

        ctx.drawImage(
            sheet,
            sx, sy, this.lightningCellW, this.lightningCellH,
            r.x - r.w * 0.1,
            r.y - r.h * 0.1,
            r.w * 0.5,
            r.h * 1.25
        );

        ctx.restore();
    }

    startGame() {
        if (this.game.introAudio) {
            this.game.introAudio.pause();
            this.game.introAudio.currentTime = 0;
        }
        this.game.sceneManager.resetGame();
    }

    randRange(min, max) {
        return min + Math.random() * (max - min);
    }

    drawFlash(ctx) {
    if (this.lightningPhase === "idle") return;

    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;

    ctx.save();

  
    ctx.globalAlpha = this.lightningAlpha * 0.35;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cw, ch);

    ctx.restore();
}
}
