class RosePainting {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;         // location on screen I think 
        this.y = y;
        this.width = 135;  // change width of sprite here
        this.height = 135; // change height of sprite here 
        this.depth = 150;
        
        this.keyTaken = this.game.sceneManager.puzzleStates.room1.hasKey;
        this.isSolid = false; // Not a collision object
        
        // Load sprite
        this.sprite = ASSET_MANAGER.getAsset("./Sprites/Room1/RosePaintingWithKey.png"); 
        this.spriteNoKey = ASSET_MANAGER.getAsset("./Sprites/Room1/RosePaintingNoKey.png"); 
        this.removeFromWorld = false;
    }
    
    // rose painting keeps checking until following happens
   update() {

    // If key already taken, disable interaction
    if (this.keyTaken) return;

    if (this.isNearLily() && this.game.E && !this.game.examining) {

        this.game.examining = true;
        this.game.E = false;

        // First description line
        this.game.sceneManager.dialogueBox.openLine(
            "Looks like a beautiful painting of a fallen rose… but it looks like there is something stuck against it.",
            "./Sprites/UI/LilyPortrait.png",
            "Lily",
            () => {

                // After description closes → show choice
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
        this.game.addEntity(new PaintingZoomView(this.game, this));
        this.game.examining = true;
        this.game.E = false;
    }

    // Called by PaintingZoomView when key is taken
  onKeyTaken() {
    this.keyTaken = true;
    this.game.sceneManager.puzzleStates.room1.hasKey = true;
}
    
    draw(ctx) {
        // Use sprite without key if already taken
        let sprite = this.keyTaken ? this.spriteNoKey : this.sprite;
        
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            // Placeholder if key sprite isnt loaded or broken 
            ctx.fillStyle = this.keyTaken ? "#6b345f" : "#8B4444";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Show interaction prompt
        if (!this.keyTaken && this.isNearLily() && !this.game.examining) {
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