class Victor {
    constructor(game, x, y, isSolid) {
        this.game = game;
        this.scale = 0.45;
        this.animator = new Animator(
            ASSET_MANAGER.getAsset("./Sprites/Room3/Alive_VictorSpriteSheet.png"), 
            196, 126,      // xStart, yStart (bottom row)
            384, 350,     // width, height of each frame
            2, 0.6      // 2 frames, 0.6 seconds per frame
        );
        
        this.x = x;
        this.y = y;
        this.width = 338 * this.scale;
        this.height = 319 * this.scale;

        this.bbOffset = {
            x: 5,       
            y: 60,     
            w: 50,       
            h: 100     
        };

        this.BB = new BoundingBox(
            this.x + this.bbOffset.x,
            this.y + this.bbOffset.y,
            this.width - this.bbOffset.w,
            this.height - this.bbOffset.h
        );

        this.isSolid = isSolid;
        this.removeFromWorld = false;

        this.medallionTaken = true; // hidden until Victor gives it after stage 2

        
        this.medallionX = this.x -120;
        this.medallionY = this.y + 120;
        this.medallionWidth = 60;
        this.medallionHeight = 60;
        
        this.medallionSprite = ASSET_MANAGER.getAsset("./Sprites/Room3/LeafMedallion.png");
    }

    update() {
        // Victor just stands in place breathing
        this.BB.x = this.x + this.bbOffset.x;
        this.BB.y = this.y + this.bbOffset.y;

        if (!this.medallionTaken && this.isNearMedallion() && this.game.E && !this.game.examining) {
            this.takeMedallion();
        }
    }

    isNearMedallion() {
        let lily = this.game.sceneManager.lily;
        if (!lily.BB) return false;
        
        let distance = Math.sqrt(
            Math.pow((this.medallionX + this.medallionWidth/2) - (lily.BB.x + lily.BB.width/2), 2) + 
            Math.pow((this.medallionY + this.medallionHeight/2) - (lily.BB.y + lily.BB.height/2), 2)
        );
        
        return distance < 80;
    }

    takeMedallion() {

        SOUND_MANAGER.play("./SFX/Room3/PickUpCoin.mp3", this.game);

        this.game.sceneManager.addToInventory("Leaf Medallion", "./Sprites/Room3/LeafMedallion.png");
        this.medallionTaken = true;
        this.game.sceneManager.puzzleStates.room3.leafMedallion = true;
        console.log("Leaf Medallion taken!");
    }

    get depth() {
        let baseDepth = this.BB.bottom;
        if (!this.medallionTaken) {
        let lily = this.game.sceneManager.lily;
        if (lily && lily.BB) {
            return lily.BB.bottom - 140;
        }
    }
        return baseDepth;
    }
    

    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

        if (!this.medallionTaken) {
            if (this.medallionSprite && this.medallionSprite.complete && this.medallionSprite.naturalWidth > 0) {
                ctx.drawImage(this.medallionSprite, this.medallionX, this.medallionY, 
                             this.medallionWidth, this.medallionHeight);
            } else {
                // Placeholder
                ctx.fillStyle = "green";
                ctx.beginPath();
                ctx.arc(this.medallionX + this.medallionWidth/2, this.medallionY + this.medallionHeight/2, 
                       this.medallionWidth/2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            if (this.isNearMedallion() && !this.game.examining) {
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.lineWidth = 3;
                ctx.font = "16px Arial";
                
                let text = "Press E to take";
                let textX = this.medallionX - 20;
                let textY = this.medallionY - 10;
                
                ctx.strokeText(text, textX, textY);
                ctx.fillText(text, textX, textY);
            }
        }

        if (this.game.debug) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }

    // Dialogue data lives with the NPC, SceneManager decides when to play it.
static getDialogue(stage) {

    if (stage === 0) {
        return [
            "Be careful, just try to interact with everything that you can."
        ];
    }

    if (stage === 1) {
        return [
            "There's a puzzle that has something to do with the candles.",
            "If you can find something that explains the order, it might give you something."
        ];
    }

    if (stage === 2) {
        return [
            "I also found this medallion before he found us. Take this as well, it will be more useful to you than it will be to me."
        ];
    }

    return [
        "You don't have much time."
    ];
}
}