class CodexPickup {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;

        this.sprite = ASSET_MANAGER.getAsset("./Sprites/Room3/Room3Codex.png");
        this.width = 90;
        this.height = 80;

        this.BB = new BoundingBox(this.x, this.y, this.width, this.height);
        this.removeFromWorld = false;
    }

    update() {
        const sm = this.game.sceneManager;
        const player = sm.lily;

        if (!player || !player.BB) return;

        const near = this.BB.collide(player.BB);

        if (near && this.game.E) {
            if (!sm.puzzleStates.room3.codexPickedUp) {

                SOUND_MANAGER.play("./SFX/Room1/PaperRustling.mp3", this.game);

                sm.puzzleStates.room3.codexPickedUp = true;
                sm.puzzleStates.room3.hasCandleCodex = true;

                sm.addToInventory("Candle Codex", "./Sprites/Room3/Room3Codex.png");
                this.removeFromWorld = true;
            }

            this.game.E = false;
        }
    }

    get depth() {
        return (this.BB ? this.BB.bottom : this.y + this.height) - 140;
    }

    draw(ctx) {

        if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        } else {
            // fallback placeholder
            ctx.fillStyle = "yellow";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        if (this.game.debug) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }
}