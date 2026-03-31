class PaintingZoomView {
    constructor(game, painting) {
       
        this.game = game;
        this.painting = painting; // painting is the RosePainting class that called this
        this.isPopup = true;
        
        // Zoom view dimensions (change these values to get the painting large and centered)
        this.width = 800;
        this.height = 800;
        this.x = 300
        this.y = 50
        
        // load zoomed in painting image
        this.paintingImage = ASSET_MANAGER.getAsset("./Sprites/Room1/RosePaintingZoom.png"); 
        
        // Diamond key sprite will be layed on top of painting 
        this.keySprite = ASSET_MANAGER.getAsset("./Sprites/Room1/DiamondKey.png"); 
        
        // Key position on painting 
        this.keyX = this.x + 535; 
        this.keyY = this.y + 474; 
        this.keyWidth = 96;
        this.keyHeight = 192;
        //162x322 is key ratio about half 
        
        this.keyTaken = this.painting.keyTaken;
        this.removeFromWorld = false;
    }
    
    update() {
        // Check for ESC key to closedw
        if (this.game.keys["Escape"]) {
            this.close();
            return;
        }
        
        // Check for click outside the view to close
        if (this.game.click) {
            let clickX = this.game.click.x;
            let clickY = this.game.click.y;
            
            // if user clicks outside the painting it will close 
            if (clickX < this.x || clickX > this.x + this.width ||
                clickY < this.y || clickY > this.y + this.height) {
                this.close();
                this.game.click = null;
                return;
            }
            
            // if key isnt taken and user clicks the key 
            if (!this.keyTaken && 
                clickX >= this.keyX && clickX <= this.keyX + this.keyWidth &&
                clickY >= this.keyY && clickY <= this.keyY + this.keyHeight) {
                this.takeKey();
            }
            this.game.click = null;
        }
    }
    
    // if key is clicked on, add to inventory, update the painting, and change state 
takeKey() {
    SOUND_MANAGER.play("./SFX/Room1/KeyOnPainting.mp3", this.game);
    this.game.sceneManager.addToInventory("diamond_key", "./Sprites/Room1/DiamondKey.png");
    this.painting.onKeyTaken();
    this.keyTaken = true;

    // Close zoom first
    this.close();

    // Small delay so zoom fully disappears
    setTimeout(() => {
        this.game.examining = true;

        this.game.sceneManager.dialogueBox.openLine(
            "It’s a diamond key!",
            "./Sprites/UI/LilyPortrait.png",
            "Lily",
            () => {
                this.game.examining = false;
            }
        );
    }, 0);
}
    
    close() {
        this.removeFromWorld = true; // remove zoomed painting from world 
        this.game.examining = false;
    }
    
    draw(ctx) {
        // Darken the background (transparaent so it's just shade darker to focus on painting)
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, 1380, 882);
        
        // Draw the zoomed painting
        if (this.paintingImage) {
            ctx.drawImage(this.paintingImage, this.x, this.y, this.width, this.height);
        // if image fails draw lame ahh red rectangle 
        } else {
            // Placeholder
            ctx.fillStyle = "#8B4444";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.fillText("Rose Painting (Zoomed)", this.x + 150, this.y + this.height/2);
        }
        
        // Draw the diamond key on painting (if not taken)
        if (!this.keyTaken) {
            if (this.keySprite) {
                ctx.drawImage(this.keySprite, this.keyX, this.keyY, this.keyWidth, this.keyHeight);
            } else {
                // Placeholder key if bro fails 
                ctx.fillStyle = "cyan";
                ctx.fillRect(this.keyX, this.keyY, this.keyWidth, this.keyHeight);
            }

        // Hover effect when hovering over the key 
            if (this.game.mouse) {
                let mx = this.game.mouse.x;
                let my = this.game.mouse.y;
                
                if (mx >= this.keyX && mx <= this.keyX + this.keyWidth &&
                    my >= this.keyY && my <= this.keyY + this.keyHeight) {
                    // Draw highlight border
                    ctx.strokeStyle = "yellow";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(this.keyX - 5, this.keyY - 5, this.keyWidth + 10, this.keyHeight + 10);
                }
            }
        }

        // TODO: shift location of the instruction so it actaully shows up
        // Instructions
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("Press ESC or click outside to close", this.x + 180, this.y + this.height + 30);

    }
}