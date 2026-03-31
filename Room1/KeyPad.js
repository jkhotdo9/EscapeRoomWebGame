/**
 * Represents the keypad entity in the normal room view. 
 * Handles proximty interaction with character 
 * and opens the KeyPadZoomView when examined
 */
class KeyPad {

    /**
     * @param {GameEngine} game - The main game engine instance 
     * @param {number} x - The x-coordinate of the bookshelf
     * @param {number} y - The y-coordinate of the bookshelf
     */
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 50;  
        this.height = 50;
        
        this.codeEntered = this.game.sceneManager.puzzleStates.room1.codeEntered;
        this.showingResult = false; // Showing red/green feedback
        this.resultTimer = 0;
        this.isRed = false; 
        
        this.isSolid = false;
        this.removeFromWorld = false;
        
        // Load keypad sprites
        this.spriteWhite = ASSET_MANAGER.getAsset("./Sprites/Room1/pixelPinpadWhite.png");
        this.spriteRed = ASSET_MANAGER.getAsset("./Sprites/Room1/pixelPinpadRed.png");
        this.spriteGreen = ASSET_MANAGER.getAsset("./Sprites/Room1/pixelPinpadGreen.png");
    }
    
    /** 
     * Updates the normal keypad view after user enters a code
     */
    update() {

    // Handle red flash timer (wrong code)
    if (this.showingResult && this.isRed) {
        this.resultTimer += this.game.clockTick;

        if (this.resultTimer > 1.5) {
            this.showingResult = false;
            this.isRed = false;
            this.resultTimer = 0;
        }
    }

    // Only allow interaction if not solved
    if (!this.codeEntered && this.isNearLily() && this.game.E && !this.game.examining) {

        this.game.examining = true;
        this.game.E = false;

        // First description line
        this.game.sceneManager.dialogueBox.openLine(
            "Looks like a keypad. It needs a 3 digit code.",
            "./Sprites/UI/LilyPortrait.png",
            "Lily",
            () => {

                // Yes / No choice
                this.game.sceneManager.dialogueBox.openChoice(
                    "Interact with it?",
                    [
                        {
                            label: "Yes",
                           onSelect: () => {
                           this.openZoomView();
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
}
    
    /**
     * Checks if Lily is within interaction distance of the keypad
     *
     * @returns {boolean} True if Lily is close enough to interact
     */
    isNearLily() {
        let lily = this.game.sceneManager.lily;
        if (!lily.BB) return false;
        
        let distance = Math.sqrt(
            Math.pow((this.x + this.width/2) - (lily.BB.x + lily.BB.width/2), 2) + 
            Math.pow((this.y + this.height/2) - (lily.BB.y + lily.BB.height/2), 2)
        );
        
        return distance < 100;
    }
    
    /**
     * Opens the zoomed-in keypad view.
     * Sets examining state to prevent other interactions.
     */
    openZoomView() {
        let zoomView = new KeypadZoomView(this.game, this);
        this.game.addEntity(zoomView);
        
        this.game.examining = true;
        this.game.E = false;
    }
    
    // Called by KeypadZoomView when wrong code entered
    onWrongCode() {
        this.showingResult = true;
        this.isRed = true;
        this.resultTimer = 0;
    }
    
    // Called by KeypadZoomView when correct code entered
    onCorrectCode() {

    this.codeEntered = true;
    this.showingResult = true;
    this.game.sceneManager.puzzleStates.room1.codeEntered = true;

    // Unlock the door to Room 2
    this.game.sceneManager.puzzleStates.room1.door1Open = true;

    this.game.entities.forEach(entity => {
        if (entity instanceof Door && entity.destinationRoom === "room2") {
            // sound effect for door unlocking
            SOUND_MANAGER.play("./SFX/OpeningDoor.mp3", this.game);
            entity.unlock();
        }
    });
}
    
    draw(ctx) {
        // Choose sprite based on state
        let sprite;
        if (this.codeEntered) {
            sprite = this.spriteGreen; // Stay green forever
        } else if (this.showingResult && this.isRed) {
            sprite = this.spriteRed; // Flash red
        } else {
            sprite = this.spriteWhite; // Default
        }
        
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            // Placeholder
            let color = this.codeEntered ? "#00FF00" : (this.isRed ? "#FF0000" : "#CCCCCC");
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "black";
            ctx.font = "12px Arial";
            ctx.fillText("KEYPAD", this.x + 20, this.y + this.height/2);
        }
        
        // Show interaction prompt (only if not solved)
        if (!this.codeEntered && !this.hasOpenedOnce && this.isNearLily() && !this.game.examining) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";
            
            let text = "Press E to Examine";
            let textX = this.x + this.width/2 - ctx.measureText(text).width/2;
            let textY = this.y - 10;
            
            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
    }
}