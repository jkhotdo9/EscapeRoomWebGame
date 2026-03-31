/**
 * Represents the bookshelf entity in the normal room view.
 * Handles proximity interaction with Lily and opens the
 * BookshelfZoomView when examined.
 */
class Bookshelf {
    
    /**
     * @param {GameEngine} game - The main game engine instance 
     * @param {number} x - The x-coordinate of the bookshelf
     * @param {number} y - The y-coordinate of the bookshelf
     */
    constructor(game, x, y) {
        this.game = game;

        // Initialize bookshelf dimensions and xy coordinates
        this.x = x;
        this.y = y;
        this.width = 200;  
        this.height = 250;
        
        this.bookOpened = this.game.sceneManager.puzzleStates.room1.bookUnlocked;
        this.isSolid = true;
        this.removeFromWorld = false;
        this.bbOffset = { x: 5, y: 80, w: 0, h: 150 };
        
        // Initialize sprites
        this.sprite = ASSET_MANAGER.getAsset("./Sprites/Room1/BookshelfWithBook.png");
        this.spriteOpened = ASSET_MANAGER.getAsset("./Sprites/Room1/BookshelfWithOpenBook.png");
    }
    
    /**
     * Updates bookshelf logic each frame
     * Handles player proximity interaction and bounding box updates.
     */
   update() {

    //If paper already taken, disable interaction
    if (this.game.sceneManager.puzzleStates.room1.paperTaken) {
        this.updateBB();
        return;
    }

    // Only allow interaction if not already examining something
    if (this.isNearLily() && this.game.E && !this.game.examining) {

        this.game.examining = true;
        this.game.E = false;

        // First description line
        this.game.sceneManager.dialogueBox.openLine(
            "Looks like a plain old bookshelf, but a certain book stands out among the rest.",
            "./Sprites/UI/LilyPortrait.png",
            "Lily",
            () => {

                // Yes/No prompt
                this.game.sceneManager.dialogueBox.openChoice(
                    "Interact with it?",
                    [
                        {
                            label: "Yes",
                            onSelect: () => {

                                const hasKey = this.game.sceneManager.hasItem("diamond_key");

                                const line = hasKey
                                    ? "I have the key for this!"
                                    : "It’s a book with a diamond-shaped lock. Looks like a key can fit in there…";

                                this.game.sceneManager.dialogueBox.openLine(
                                    line,
                                    "./Sprites/UI/LilyPortrait.png",
                                    "Lily",
                                    () => {
                                        this.openZoomView();
                                    }
                                );
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

    this.updateBB();
}

    /**
     * Updates the bounding box used for collision detection.
     */
    updateBB() {
        this.BB = new BoundingBox(
            this.x + this.bbOffset.x, 
            this.y + this.bbOffset.y, 
            this.width - this.bbOffset.w, 
            this.height - this.bbOffset.h
        );
    }

    /**
     * getter for depth logic
     */
    get depth() {
        return this.BB ? this.BB.bottom : this.y + this.height;
    }
    
    /**
     * Checks if Lily is within interaction distance of the bookshelf
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
        
        return distance < 140; // Within 120 pixels
    }
    
     /**
     * Opens the zoomed-in bookshelf puzzle view.
     * Sets examining state to prevent other interactions.
     */
    openZoomView() {
        this.game.addEntity(new BookshelfZoomView(this.game, this));
        this.game.examining = true;
        this.game.E = false;
    }
    
    /**
     * Sets the state of book to open in Bookshelf class and sceneManager 
     */
    onBookOpened() {
        this.bookOpened = true;
        this.game.sceneManager.puzzleStates.room1.bookUnlocked = true;
    }
    
     /**
     * Draws the bookshelf and interaction prompt when user is next to bookshelf
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        // Use opened sprite if book was unlocked
        let sprite = this.bookOpened ? this.spriteOpened : this.sprite; 
        
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            // Placeholder if image is bugging 
            // need to change this size here
            ctx.fillStyle = this.bookOpened ? "#654321" : "#8B4513";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText("Bookshelf", this.x + 50, this.y + this.height/2);
        }
        
        // Show interaction prompt
        if (!this.game.sceneManager.puzzleStates.room1.paperTaken &&
            this.isNearLily() &&
            !this.game.examining) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";
            
            let text = "Press E to Examine";
            let textX = this.x + this.width/2 - ctx.measureText(text).width/2;
            let textY = this.y + 65;
            
            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }

        //debug hitbox stuff
        if (this.game.debug) {
            ctx.strokeStyle = "blue";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }
}