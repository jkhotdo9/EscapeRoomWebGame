class FrozenLockZoomView {
    constructor(game, lock) {
        this.game = game;
        this.lock = lock;
        this.isPopup = true;
        
        // Zoom view dimensions
        this.width = 600;
        this.height = 700;
        this.x = (1380 - this.width) / 2;
        this.y = (882 - this.height) / 2;
        
        // Load sprites
        this.frozenLockSprite = ASSET_MANAGER.getAsset("./Sprites/Room2/FrozenLock.png");
        this.brokenLockSprite = ASSET_MANAGER.getAsset("./Sprites/Room2/BrokenLock.png");
        this.pipeSprite = ASSET_MANAGER.getAsset("./Sprites/Room2/Pipe.png");
        
        // Check if player has the pipe
        this.hasPipe = this.game.sceneManager.hasItem("Lead Pipe");
        
        // Lock position in zoom view
        this.lockX = this.x + 150;
        this.lockY = this.y + 200;
        this.lockWidth = 300;
        this.lockHeight = 350;
        
        // Pipe position and size
        this.pipeInventoryX = this.x + 50;
        this.pipeInventoryY = this.y + 55;
        this.pipeWidth = 80;
        this.pipeHeight = 90;
        
        // Drag state
        this.draggingPipe = false;
        this.dragPipeX = this.pipeInventoryX;
        this.dragPipeY = this.pipeInventoryY;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        
        // State
        this.lockBroken = false;
        this.showSuccessMessage = false;
        this.successTimer = 0;
        
        this.removeFromWorld = false;
    }
    
    update() {
        // Handle success message timer
        if (this.showSuccessMessage) {
            this.successTimer += this.game.clockTick;
            if (this.successTimer > 2) {
                // After 2 seconds, close the view
                this.close();
                return;
            }
        }
        
        // ESC to close
        if (this.game.keys["Escape"]) {
            this.close();
            return;
        }
        
        // Click outside to close
        if (this.game.click) {
            let clickX = this.game.click.x;
            let clickY = this.game.click.y;
            
            if (clickX < this.x || clickX > this.x + this.width ||
                clickY < this.y || clickY > this.y + this.height) {
                this.close();
                this.game.click = null;
                return;
            }
            
            this.game.click = null;
        }
        
        // Drag-and-drop logic
        if (this.hasPipe && !this.lockBroken) {
            this.handlePipeDragAndDrop();
        }
    }
    
    handlePipeDragAndDrop() {
        if (!this.game.mouse) return;
        
        let mx = this.game.mouse.x;
        let my = this.game.mouse.y;
        
        // Start dragging on mouse down over pipe
        if (this.game.mouseDown && !this.draggingPipe) {
            if (mx >= this.dragPipeX && mx <= this.dragPipeX + this.pipeWidth &&
                my >= this.dragPipeY && my <= this.dragPipeY + this.pipeHeight) {
                this.draggingPipe = true;
                this.dragOffsetX = mx - this.dragPipeX;
                this.dragOffsetY = my - this.dragPipeY;
            }
        }
        
        // While dragging, follow mouse
        if (this.draggingPipe && this.game.mouseDown) {
            this.dragPipeX = mx - this.dragOffsetX;
            this.dragPipeY = my - this.dragOffsetY;
        }
        
        // Release mouse - check if over lock
        if (this.draggingPipe && !this.game.mouseDown) {
            
            // Check if pipe was dropped on the lock
            let pipeCenterX = this.dragPipeX + this.pipeWidth / 2;
            let pipeCenterY = this.dragPipeY + this.pipeHeight / 2;
            
            let pipeOverLock = (
                pipeCenterX >= this.lockX &&
                pipeCenterX <= this.lockX + this.lockWidth &&
                pipeCenterY >= this.lockY &&
                pipeCenterY <= this.lockY + this.lockHeight
            );
            
            if (pipeOverLock) {
                this.breakLock();
            } else {
                // Snap pipe back to original position
                this.dragPipeX = this.pipeInventoryX;
                this.dragPipeY = this.pipeInventoryY;
            }
            
            this.draggingPipe = false;
        }
    }
    
    breakLock() {

    SOUND_MANAGER.play("./SFX/Room2/FrozenLockBreaking.mp3", this.game);    

    this.game.sceneManager.markItemAsUsed("Lead Pipe");
    this.hasPipe = false;

    this.lockBroken = true;

    // Notify the lock in the world
    this.lock.onLockBroken();

    // Close zoom first
    this.close();

    // Show success dialogue after zoom disappears
    setTimeout(() => {

        this.game.examining = true;

        this.game.sceneManager.dialogueBox.openLine(
            "We did it! We are out!",
            "./Sprites/UI/LilyPortrait.png",
            "Lily",
            () => {
                this.game.examining = false;
            }
        );

    }, 0);
}
    
    close() {
        this.removeFromWorld = true;
        this.game.examining = false;
    }
    
    draw(ctx) {
        // Darken background
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, 1380, 882);
        
        // Draw lock (frozen or broken)
        let lockSprite = this.lockBroken ? this.brokenLockSprite : this.frozenLockSprite;
        
        if (lockSprite && lockSprite.complete && lockSprite.naturalWidth > 0) {
            ctx.drawImage(lockSprite, this.lockX, this.lockY, this.lockWidth, this.lockHeight);
        } else {
            // Placeholder
            ctx.fillStyle = this.lockBroken ? "#808080" : "#B0E0E6";
            ctx.fillRect(this.lockX, this.lockY, this.lockWidth, this.lockHeight);
            ctx.fillStyle = "white";
            ctx.font = "24px Arial";
            ctx.fillText(this.lockBroken ? "Broken Lock" : "Frozen Lock", this.lockX + 70, this.lockY + this.lockHeight/2);
        }
        
        // Draw inventory area if player has pipe
        if (this.hasPipe && !this.lockBroken) {
            ctx.fillStyle = "#333";
            ctx.fillRect(this.x + 5, this.y + 30, 140, 120);
            
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText("INVENTORY:", this.x + 55, this.y + 40);
            
            // Draw pipe at dragged position
            if (this.pipeSprite && this.pipeSprite.complete && this.pipeSprite.naturalWidth > 0) {
                ctx.drawImage(this.pipeSprite, this.dragPipeX, this.dragPipeY, this.pipeWidth, this.pipeHeight);
            } else {
                ctx.fillStyle = "#708090";
                ctx.fillRect(this.dragPipeX, this.dragPipeY, this.pipeWidth, this.pipeHeight);
                ctx.fillStyle = "white";
                ctx.font = "12px Arial";
                ctx.fillText("Pipe", this.dragPipeX + 20, this.dragPipeY + 25);
            }
        }
        
        // Instructions
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        
        if (!this.lockBroken && !this.hasPipe) {
            ctx.fillText("You need something to break this lock...", this.x + this.width/2, this.y + this.height - 30);
        } else if (!this.lockBroken && this.hasPipe) {
            ctx.fillText("Drag the pipe onto the lock to break it", this.x + this.width/2, this.y + this.height - 30);
        }
        
        if (!this.showSuccessMessage) {
            ctx.fillText("Press ESC or click outside to close", this.x + this.width/2, this.y + this.height - 10);
        }
    }
}