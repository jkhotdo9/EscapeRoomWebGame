class PaperView {
    constructor(game) {
        this.game = game;
        
        // Paper dimensions (large, readable)
        this.width = 700;
        this.height = 800;
        this.x = (1380 - this.width) / 2;
        this.y = (882 - this.height) / 2;
        
        // Load the readable riddle sprite
        this.paperSprite = ASSET_MANAGER.getAsset("./Sprites/Room1/067Codex.png");
        
        this.isPopup = true;  // mark as popup
        this.wasIPressed = true;
    }
    
    update() {
        // ESC or I to close
        if (this.game.keys["Escape"] || (this.game.I && !this.wasIPressed)) {
            this.close();
            return;
        }
        this.wasIPressed = this.game.I;
        
        // Click outside to close
        if (this.game.click) {
            let clickX = this.game.click.x;
            let clickY = this.game.click.y;
            
            if (clickX < this.x || clickX > this.x + this.width ||
                clickY < this.y || clickY > this.y + this.height) {
                this.close();
            }
            
            this.game.click = null;
        }
    }
    
    close() {
        this.removeFromWorld = true; 
        this.game.examining = false;
    }
    
    draw(ctx) {
        // Darken background
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, 1380, 882);
        
        // Draw paper with riddle
        if (this.paperSprite && this.paperSprite.complete && this.paperSprite.naturalWidth > 0) {
            ctx.drawImage(this.paperSprite, this.x, this.y, this.width, this.height);
        }
        
        // Instructions
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("Press I, ESC, or click outside to close", this.x + 160, this.y + this.height + 30);
    }
}
