class HealthUI {
    constructor(game) {
        this.game = game;
        this.isPopup = true; // Always drawn on top
        this.removeFromWorld = false;
        
        // Position (top-left corner)
        this.x = 30;
        this.y = 20;
        this.heartSize = 50;
        this.heartSpacing = 60;
        
        // Load heart sprites
        this.heartSprite = ASSET_MANAGER.getAsset("./Sprites/UI/Heart.png");
        this.emptyHeartSprite = ASSET_MANAGER.getAsset("./Sprites/UI/EmptyHeart.png");
        this.frostyHeartSprite = ASSET_MANAGER.getAsset("./Sprites/UI/FrostyHeart.png");
        this.frostyEmptyHeartSprite = ASSET_MANAGER.getAsset("./Sprites/UI/FrostyHeartEmpty.png");
    }
    
    update() {
        // No update logic needed
    }
    
    draw(ctx) {
        // Determine which sprite set to use based on current room
        let isFrosty = this.game.sceneManager.currentRoom === "room2";
        let filledSprite = isFrosty ? this.frostyHeartSprite : this.heartSprite;
        let emptySprite = isFrosty ? this.frostyEmptyHeartSprite : this.emptyHeartSprite;
        
        // Draw 3 hearts
        for (let i = 0; i < 3; i++) {
            let heartX = this.x + i * this.heartSpacing;
            let heartY = this.y;
            
            // Determine if this heart should be filled or empty
            let isFilled = i < this.game.sceneManager.health;
            let sprite = isFilled ? filledSprite : emptySprite;
            
            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                ctx.drawImage(sprite, heartX, heartY, this.heartSize, this.heartSize);
            } else {
                // Placeholder
                ctx.fillStyle = isFilled ? (isFrosty ? "#00BFFF" : "#FF0000") : "#555";
                ctx.beginPath();
                ctx.arc(heartX + this.heartSize/2, heartY + this.heartSize/2, this.heartSize/2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}