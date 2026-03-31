class FrozenLock {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 60;
        
        // Check saved state
        this.lockBroken = this.game.sceneManager.puzzleStates.room2.lockBroken;

        if (this.lockBroken && this.game.sceneManager.puzzleStates.room2.lockPosition) {
            // Use saved broken position
            this.x = this.game.sceneManager.puzzleStates.room2.lockPosition.x;
            this.y = this.game.sceneManager.puzzleStates.room2.lockPosition.y;
        } else {
            // Use initial position
            this.x = x;
            this.y = y;
        }
        
        this.isSolid = false;
        this.removeFromWorld = false;
        
        // Load sprites
        this.frozenSprite = ASSET_MANAGER.getAsset("./Sprites/Room2/pixelFrozenLock2.png");
        this.brokenSprite = ASSET_MANAGER.getAsset("./Sprites/Room2/pixelBrokenFrozenLock.png");
    }
    
    update() {
        // console.log(
        //     "lockBroken:", this.lockBroken,
        //     "| near:", this.isNearLily(),
        //     "| E:", this.game.E,
        //     "| examining:", this.game.examining
        // );
        
        if (!this.lockBroken && this.isNearLily() && this.game.E && !this.game.examining) {
            this.openZoomView();
        }
    }
    
    isNearLily() {
        let lily = this.game.sceneManager.lily;
        if (!lily.BB) return false;
        
        let distance = Math.sqrt(
            Math.pow((this.x + this.width/2) - (lily.BB.x + lily.BB.width/2), 2) + 
            Math.pow((this.y + this.height/2) - (lily.BB.y + lily.BB.height/2), 2)
        );
        
        return distance < 100;
    }
    
    openZoomView() {

        this.game.addEntity(new FrozenLockZoomView(this.game, this));
        this.game.examining = true;
        this.game.E = false;
    }
    
    // Called by FrozenLockZoomView when pipe is used
    onLockBroken() {
        this.lockBroken = true;
        this.game.sceneManager.puzzleStates.room2.lockBroken = true;
        this.x += 20;   // once lock is broken, move it to floor next to door
        this.y += 75;

        this.game.sceneManager.puzzleStates.room2.lockPosition = {
            x: this.x,
            y: this.y
        };
        
        
        SOUND_MANAGER.play("./SFX/OpeningDoor.mp3", this.game);

        // Unlock the door to room 3
        this.game.sceneManager.puzzleStates.room2.door2Open = true;

        this.game.entities.forEach(entity => {
            if (entity instanceof Door && entity.destinationRoom === "room3") {
                entity.unlock();
            }
        });
    }
    
    draw(ctx) {
        // Use broken sprite if lock is broken
        let sprite = this.lockBroken ? this.brokenSprite : this.frozenSprite;
        
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            // Placeholder
            ctx.fillStyle = this.lockBroken ? "#808080" : "#B0E0E6";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "12px Arial";
            ctx.fillText(this.lockBroken ? "Broken" : "Frozen", this.x + 10, this.y + this.height/2);
        }
        
        // Show interaction prompt (only if not broken)
        if (!this.lockBroken && this.isNearLily() && !this.game.examining) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";
            
            let text = "Press E to examine";
            let textX = this.x + this.width/2 - ctx.measureText(text).width/2;
            let textY = this.y - 10;
            
            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
    }
    
    get depth() {

        if (this.lockBroken) {
            return this.y + this.height - 100; 
        }
        return this.y + this.height; 
    }
}