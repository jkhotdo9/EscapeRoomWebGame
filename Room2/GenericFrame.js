class GenericFrame {
    constructor(game, x, y, spritePath, width = 10, height = 10, depthOverride = null) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.depthOverride = depthOverride;

        this.sprite = ASSET_MANAGER.getAsset(spritePath);

        this.hasBeenViewed = false;
        this.isSolid = false;
        this.removeFromWorld = false;
    }

    update() {
        if (
            this.isNearLily() &&
            this.game.E &&
            !this.game.examining &&
            !this.game.sceneManager.dialogueBox.active &&
            this.game.sceneManager.npcStates.shiannel.met
        ) {
            this.openZoomView();
        }
    }

    isNearLily() {
        let lily = this.game.sceneManager.lily;
        if (!lily.BB) return false;

         if (lily.BB.y + lily.BB.height < this.y + this.height * 0.5) {
            return false;
        }

        let distance = Math.sqrt(
            Math.pow((this.x + this.width  / 2) - (lily.BB.x + lily.BB.width  / 2), 2) +
            Math.pow((this.y + this.height / 2) - (lily.BB.y + lily.BB.height / 2), 2)
        );

        return distance < 100;
    }

    openZoomView() {
        this.hasBeenViewed = true;
        this.game.examining = true;
        this.game.E = false;

        this.game.sceneManager.dialogueBox.openLine(
            "It looks like an expensive painting...",
            "./Sprites/UI/LilyPortrait.png",
            "Lily",
            () => {
                this.game.sceneManager.dialogueBox.openChoice(
                    "Interact with it?",
                    [
                        {
                            label: "Yes",
                            onSelect: () => {
                                this.game.sceneManager.takeDamage();
                                this.game.addEntity(new FrameZoomView(this.game, this));
                                this.game.examining = true;
                            }
                        },
                        {
                            label: "No",
                            onSelect: () => {
                                this.game.examining = false;
                            }
                        }
                    ],
                    "Prompt"
                );
            }
        );
    }

    draw(ctx) {
        // Draw the frame sprite
        if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = "#8B7355";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "12px Arial";
            ctx.fillText("Frame", this.x + 10, this.y + this.height / 2);
        }

        // Hover highlight when Lily is nearby
        if (this.isNearLily() && !this.game.examining && this.game.mouse) {
            let mx = this.game.mouse.x;
            let my = this.game.mouse.y;

            if (mx >= this.x && mx <= this.x + this.width &&
                my >= this.y && my <= this.y + this.height) {
                ctx.strokeStyle = "yellow";
                ctx.lineWidth = 3;
                ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
        }

        // Press E prompt
        if (this.isNearLily() && !this.game.examining && this.game.sceneManager.npcStates.shiannel.met) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";

            let text = "Press E to Examine";
            let textX = this.x + this.width / 2 - ctx.measureText(text).width / 2;
            let textY = this.y - 20;

            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
    }

    get depth() {
        return this.depthOverride !== null ? this.depthOverride : this.y + this.height;
    }
}