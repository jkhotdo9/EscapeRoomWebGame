class PigHeadZoomView {

    constructor(game, PigHead) {
        this.game = game;
        this.PigHead = PigHead; 
        this.isPopup = true;
        
        this.width = 800;
        this.height = 800;
        this.x = 300
        this.y = 50
        
        // load zoomed in PigHead image
        this.pigHeadImage = ASSET_MANAGER.getAsset("./Sprites/Room3/PigHeadEmptyMouth.png"); 
        
        // Medallion will be layed on top of PigHead 
        // TODO: should be a bloody version of the snowflake key as its own sprite ?
        this.medallionSprite = ASSET_MANAGER.getAsset("./Sprites/Room3/SnowflakeMedallion.png"); 
        
        // Medallion position on PigHead 
        this.medallionX = this.x + 315;
        this.medallionY = this.y + 500; 
        this.medallionWidth = 175;
        this.medallionHeight = 175;
        
        this.medallionTaken = this.PigHead.medallionTaken;
        this.removeFromWorld = false;
        this.medallionJustTaken = false;
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
            
            // if user clicks outside the PigHead it will close 
            if (clickX < this.x || clickX > this.x + this.width ||
                clickY < this.y || clickY > this.y + this.height) {
                this.close();
                this.game.click = null;
                return;
            }
            
            // if medallions is not taken and user clicks it 
            if (!this.medallionTaken && 
                clickX >= this.medallionX && clickX <= this.medallionX + this.medallionWidth &&
                clickY >= this.medallionY && clickY <= this.medallionY + this.medallionHeight) {
                this.takeMedallion();

                SOUND_MANAGER.play("./SFX/Room3/PigheadGuts.mp3", this.game);

            }
            this.game.click = null;
        }
    }
    
    // if medallion is clicked on, add to inventory, update pighead image, and change state 
    takeMedallion() {
        this.game.sceneManager.addToInventory(
            "Snowflake Medallion",
            "./Sprites/Room3/SnowflakeMedallion.png"
        );

        this.PigHead.onMedallionTaken();
        this.medallionTaken = true;
        this.medallionJustTaken = true;

        SOUND_MANAGER.play("./SFX/Room3/PigheadGuts.mp3", this.game);
    }
    
    close() {
        this.removeFromWorld = true;
        this.game.examining = false;

        if (this.medallionJustTaken) {
            setTimeout(() => {
                this.game.examining = true;

                this.game.sceneManager.dialogueBox.openLine(
                    "It’s a medallion! It has a snowflake on it…",
                    "./Sprites/UI/LilyPortrait.png",
                    "Lily",
                    () => {
                        this.game.examining = false;
                    }
                );
            }, 0);
            this.medallionJustTaken = false;
        }
    }
    
    draw(ctx) {
        // Darken the background (transparaent so it's just shade darker to focus on PigHead)
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, 1380, 882);
        
        // Draw the zoomed paintPigHeading
        if (this.pigHeadImage) {
            ctx.drawImage(this.pigHeadImage, this.x, this.y, this.width, this.height);
        // if image fails draw lame ahh red rectangle 
        } else {
            // Placeholder
            ctx.fillStyle = "#8B4444";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.fillText("Rose Painting (Zoomed)", this.x + 150, this.y + this.height/2);
        }
        
        // Draw the medallion on the pig head if not taken 
        if (!this.medallionTaken) {
            if (this.medallionSprite) {
                ctx.drawImage(this.medallionSprite, this.medallionX, this.medallionY, this.medallionWidth, this.medallionHeight);
            } else {
                // Placeholder coin if bro fails 
                ctx.fillStyle = "cyan";
                ctx.fillRect(this.medallionX, this.medallionY, this.medallionWidth, this.medallionHeight);
            }

        // Hover effect when hovering over the medallion 
            if (this.game.mouse) {
                let mx = this.game.mouse.x;
                let my = this.game.mouse.y;
                
                if (mx >= this.medallionX && mx <= this.medallionX + this.medallionWidth &&
                    my >= this.medallionY && my <= this.medallionY + this.medallionHeight) {
                    // Draw highlight border
                    ctx.strokeStyle = "yellow";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(this.medallionX - 5, this.medallionY - 5, this.medallionWidth + 10, this.medallionHeight + 10);
                }
            }
        }

        // TODO: shift location of the instruction so it actaully shows up
        // Instructions
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("Press ESC or click outside to close", this.x + 280, this.y + this.height - 10);

    }
}