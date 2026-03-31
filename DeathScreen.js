class DeathScreen {
    constructor(game) {
        this.game = game;
        this.isPopup = true;
        this.removeFromWorld = false;    
        // Screen dimensions (fullscreen)
        this.width = this.game.ctx.canvas.width;
        this.height = this.game.ctx.canvas.height;
        this.x = 0;
        this.y = 0;
        
        // Button dimensions
        this.buttonWidth = 350;
        this.buttonHeight = 100;
        this.buttonSpacing = 40;

        // Center buttons on screen
        this.playAgainButton = {
            width: this.buttonWidth,
            height: this.buttonHeight,
            x: this.width / 2 - this.buttonWidth / 2,
            y: this.height / 2 + 50
        };

        this.titleButton = {
            width: this.buttonWidth,
            height: this.buttonHeight,
            x: this.width / 2 - this.buttonWidth / 2,
            y: this.playAgainButton.y + this.buttonHeight + this.buttonSpacing
        };

        this.backgroundSprite = ASSET_MANAGER.getAsset("./Sprites/EndGameScreens/DeathScreen.png");
        this.mainMenuButt = ASSET_MANAGER.getAsset("./Sprites/EndGameScreens/MainMenuButton.png");
        this.playAgainButt = ASSET_MANAGER.getAsset("./Sprites/EndGameScreens/PlayAgainButton.png");

    }
    
    update() {
        // Handle button clicks
        if (this.game.click) {
            let clickX = this.game.click.x;
            let clickY = this.game.click.y;
            
            // Play Again button
            if (clickX >= this.playAgainButton.x && clickX <= this.playAgainButton.x + this.playAgainButton.width &&
                clickY >= this.playAgainButton.y && clickY <= this.playAgainButton.y + this.playAgainButton.height) {
                this.playAgain();
            }
            
            // Return to Title button
            if (clickX >= this.titleButton.x && clickX <= this.titleButton.x + this.titleButton.width &&
                clickY >= this.titleButton.y && clickY <= this.titleButton.y + this.titleButton.height) {
                this.returnToTitle();
            }
            
            this.game.click = null;
        }
    }
    
    playAgain() {
        // Reset everything and load Room 1
        SOUND_MANAGER.stop("./SFX/Room2/ClairDeLuneMuffled.mp3");
        this.game.sceneManager.clearEntities();
        this.game.sceneManager.resetGame();
        this.removeFromWorld = true;
    }
    
    returnToTitle() {
        SOUND_MANAGER.stop("./SFX/Room2/ClairDeLuneMuffled.mp3");
        if (this.game.room1Audio) {
        this.game.room1Audio.pause();
        this.game.room1Audio.currentTime = 0;
        }
        // Start intro BGM again
        if (this.game.introAudio) {
            this.game.introAudio.currentTime = 0;
            this.game.introAudio.play().catch(() => {});
        }
        
        // Clear all entities and show title screen
        this.game.sceneManager.clearEntities();
        this.game.addEntity(new TitleScreen(this.game));
        this.removeFromWorld = true;
    }
    
    draw(ctx) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.drawImage(this.backgroundSprite, 0, 0, this.width, this.height);

        
        ctx.drawImage(this.playAgainButt,this.playAgainButton.x,this.playAgainButton.y,this.playAgainButton.width,this.playAgainButton.height);

        if (this.isHovering(this.playAgainButton)) {
            ctx.strokeStyle = "rgb(255, 255, 255)"; 
            ctx.lineWidth = 4;
            ctx.strokeRect(
                this.playAgainButton.x,
                this.playAgainButton.y,
                this.playAgainButton.width,
                this.playAgainButton.height
            );
        }

    
        ctx.drawImage(this.mainMenuButt,this.titleButton.x,this.titleButton.y,this.titleButton.width,this.titleButton.height);

        if (this.isHovering(this.titleButton)) {
            ctx.strokeStyle = "rgb(255, 255, 255)";
            ctx.lineWidth = 4;
            ctx.strokeRect(
                this.titleButton.x,
                this.titleButton.y,
                this.titleButton.width,
                this.titleButton.height
            );
        }
    }
    isHovering(button) {
        if (!this.game.mouse) return false;

        let mx = this.game.mouse.x;
        let my = this.game.mouse.y;

        return (
            mx >= button.x &&
            mx <= button.x + button.width &&
            my >= button.y &&
            my <= button.y + button.height
        );
    }
    
    drawButton(ctx, button, text) {
        // Check if mouse is hovering
        let isHovering = false;
        if (this.game.mouse) {
            let mx = this.game.mouse.x;
            let my = this.game.mouse.y;
            
            if (mx >= button.x && mx <= button.x + button.width &&
                my >= button.y && my <= button.y + button.height) {
                isHovering = true;
            }
        }
        
        // Button background
        ctx.fillStyle = isHovering ? "#555" : "#333";
        ctx.fillRect(button.x, button.y, button.width, button.height);
        
        // Button border
        ctx.strokeStyle = isHovering ? "#FFF" : "#888";
        ctx.lineWidth = 3;
        ctx.strokeRect(button.x, button.y, button.width, button.height);
        
        // Button text
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(text, button.x + button.width/2, button.y + button.height/2 + 8);
    }
}