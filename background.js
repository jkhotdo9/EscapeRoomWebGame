class Background {
    constructor(game, imagePath, width, height) {
        this.game = game;
        this.image = ASSET_MANAGER.getAsset(imagePath);
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
    }
    
    update() {
        // Backgrounds usually don't update
    }
    
    draw(ctx) {
        ctx.drawImage(this.image, 0, 0, this.width, this.height);
    }
}