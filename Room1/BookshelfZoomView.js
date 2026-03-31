/**
 * Represents the zoomed-in view of the bookshelf puzzle.
 * Handles rendering, interaction, and puzzle state logic
 * for the locked diamond book, draggable key, and hidden paper.
 */
class BookshelfZoomView {
    /**
     * 
     * @param {GameEngine} game - The main game engine instance 
     * @param {Object} bookshelf - The bookshelf object entity that holds these states, methods, and sprites
     */
    constructor(game, bookshelf) {
        this.game = game;
        this.bookshelf = bookshelf;
        this.isPopup = true;
        
        // Initialize zoom view dimensions and xy coordinates
        this.width = 700;
        this.height = 800;
        this.x = (1380 - this.width) / 2;
        this.y = (882 - this.height) / 2;
        
        // Initialize book, paper, key, drag-and-drop, and zoom view states
        this.bookUnlocked = this.bookshelf.bookOpened;
        this.paperTaken = this.game.sceneManager.puzzleStates.room1.paperTaken; 
        this.hasKey = this.game.sceneManager.hasItem("diamond_key");
        
        // Load in sprites
        this.lockedBookSprite = ASSET_MANAGER.getAsset("./Sprites/Room1/LockedDiamondBook.png");   
        this.openBookSprite = ASSET_MANAGER.getAsset("./Sprites/Room1/OpenDiamondBook.png");        
        this.paperSprite = ASSET_MANAGER.getAsset("./Sprites/Room1/Room1Note.png");               
        this.keySprite = ASSET_MANAGER.getAsset("./Sprites/Room1/DiamondKey.png");                
        
        // Closed book position and size 
        this.closedBookX = this.x + 150;
        this.closedBookY = this.y + 200;
        this.closedBookWidth = 391;
        this.closedBookHeight = 544;

        // Open book position and size 
        this.openBookX = this.x - 50;
        this.openBookY = this.y + 100;
        this.openBookWidth = 836;
        this.openBookHeight = 596;
        
        // Blurred paper position and size
        this.paperX = this.openBookX + 400; 
        this.paperY = this.openBookY + 50; 
        this.paperWidth = 400;
        this.paperHeight = 400;
        
        // Key position 
        this.keyX = this.x + 50;
        this.keyY = this.y + 50;
        this.keyWidth = 60;
        this.keyHeight = 120;

        this.draggingKey = false; // NOTE: the drag and drop stuff must be at end of constructor or else key won't spawn in 
        this.dragKeyX = this.keyX; 
        this.dragKeyY = this.keyY;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        
        this.removeFromWorld = false;
    }
    
     /**
     * Updates the zoom view state each frame.
     * Handles closing logic, clicking interactions,
     * and drag-and-drop behavior.
     */
    update() {
        // press ESC to close out of window 
        if (this.game.keys["Escape"]) {
            this.close();
            return;
        }
        
        // handles when a user clicks somewhere on BookshelfZoomView
        if (this.game.click) {
            let clickX = this.game.click.x;
            let clickY = this.game.click.y;
            
            // If user clicks outside the view, close the view
            if (clickX < this.x || clickX > this.x + this.width ||
                clickY < this.y || clickY > this.y + this.height) {
                this.close();
                this.game.click = null;
                return;
            }
            
            // If user clicks on paper, take it 
            if (this.bookUnlocked && !this.paperTaken) {
                SOUND_MANAGER.play("./SFX/Room1/PaperRustling.mp3", this.game);
                if (clickX >= this.paperX && clickX <= this.paperX + this.paperWidth &&
                    clickY >= this.paperY && clickY <= this.paperY + this.paperHeight) {
                    this.takePaper();
                }
            }
            
            this.game.click = null;
        }

        // handles if user clicks and holds key for drag and drop 
        if (this.hasKey && !this.bookUnlocked) {
            this.handleKeyDragAndDrop();
        }        
    }

    /**
     * Handles drag-and-drop logic for placing the key
     * onto the locked book to unlock it.
     */
    handleKeyDragAndDrop() {
        if (!this.game.mouse) {
            return;
        }        
        let mx = this.game.mouse.x;
        let my = this.game.mouse.y;
        
        // Start dragging on mouse down over key
        if (this.game.mouseDown && !this.draggingKey) {
            // Check if mouse is over the key
            if (mx >= this.dragKeyX && mx <= this.dragKeyX + this.keyWidth &&
                my >= this.dragKeyY && my <= this.dragKeyY + this.keyHeight) {
                this.draggingKey = true;
                this.dragOffsetX = mx - this.dragKeyX;
                this.dragOffsetY = my - this.dragKeyY;
            }
        }
        
        // While dragging, follow mouse
        if (this.draggingKey && this.game.mouseDown) {
            this.dragKeyX = mx - this.dragOffsetX;
            this.dragKeyY = my - this.dragOffsetY;
        }
        
        // Release mouse - check if over book
        if (this.draggingKey && !this.game.mouseDown) {
            // Check if key was dropped on the book
            let keyCenterX = this.dragKeyX + this.keyWidth / 2;
            let keyCenterY = this.dragKeyY + this.keyHeight / 2;
            
            let keyOverBook = (
                keyCenterX >= this.closedBookX &&
                keyCenterX <= this.closedBookX + this.closedBookWidth &&
                keyCenterY >= this.closedBookY &&
                keyCenterY <= this.closedBookY + this.closedBookHeight 
            );
            
            // Release mouse - check if over book
            if (keyOverBook) {
                SOUND_MANAGER.play("./SFX/Room1/KeyUnlock.mp3", this.game);

                // Wait for key unlock sound to finish, THEN open the book
                const keySound = SOUND_MANAGER.cache["./SFX/Room1/KeyUnlock.mp3"];
                const delay = keySound ? keySound.duration * 1000 : 1000; // fallback to 1 second

                setTimeout(() => {
                    SOUND_MANAGER.play("./SFX/Room1/BookUnlocking.mp3", this.game);
                    this.unlockBook();
                }, delay);

            } else {
                // Snap key back to original position
                this.dragKeyX = this.keyX;
                this.dragKeyY = this.keyY;
            }
            
            this.draggingKey = false;
        }
    }
    
    /**
     * Marks key as used and updates the state of the book and bookshelf
     */
    unlockBook() {        
        this.game.sceneManager.markItemAsUsed("diamond_key");
         
        // Unlock the book
        this.bookUnlocked = true;
        this.hasKey = false; // Key is gone
        
        // update bookshelf state to change to the other sprite 
        this.bookshelf.onBookOpened();
    }
    
     /**
     * Adds the paper to inventory and sets state to paper taken 
     */ 
    takePaper() {
    if (this.paperTaken) return;

    // 1) Take paper immediately
    this.game.sceneManager.addToInventory("Strange Note", "./Sprites/Room1/Room1Note.png");
    this.game.sceneManager.puzzleStates.room1.paperTaken = true;
    this.paperTaken = true;

    // 2) Close zoom view first so dialogue is visible
    this.close();

    // 3) Next frame: show dialogue on top
    setTimeout(() => {
        this.game.examining = true;

        this.game.sceneManager.dialogueBox.openLine(
            "A note! It gives me some numbers, I wonder what this is for...",
            "./Sprites/UI/LilyPortrait.png",
            "Lily",
            () => {
                this.game.examining = false;
            }
        );
    }, 0);
}
    
    /**
     * Closes the BookshelfZoomView
     */
    close() {
        this.removeFromWorld = true;
        this.game.examining = false;
    }
    
    /**
     * Draws the zoom view and all interactive elements and sprites
     * Displays messages, text, manages background tint, effects, etc. 
     * @param {CanvasRenderingContext2D} ctx - The rendering context
     */
    draw(ctx) {
        // Darken background
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, 1380, 882);
         
        // Draw the book (locked or open)
        if (!this.bookUnlocked) {
            // Locked book
            if (this.lockedBookSprite && this.lockedBookSprite.complete) {
                ctx.drawImage(this.lockedBookSprite, this.closedBookX, this.closedBookY, this.closedBookWidth, this.closedBookHeight);
            } else {
                ctx.fillStyle = "#8B4513";
                ctx.fillRect(this.closedBookX, this.closedBookY, this.closedBookWidth, this.closedBookHeight);
                ctx.fillStyle = "white";
                ctx.font = "16px Arial";
                ctx.fillText("Locked Book", this.closedBookX + 80, this.closedBookY + this.closedBookHeight/2); 
            }
            
        } else {
            // Open book
            if (this.openBookSprite && this.openBookSprite.complete) {
                ctx.drawImage(this.openBookSprite, this.openBookX, this.openBookY, this.openBookWidth, this.openBookHeight); 
            } else {
                ctx.fillStyle = "#d28cb3";
                ctx.fillRect(this.openBookX, this.openBookY, this.openBookWidth, this.openBookHeight);
            }
            
            // Draw paper inside (if not taken)
            if (!this.paperTaken) {
                if (this.paperSprite && this.paperSprite.complete) {
                    ctx.drawImage(this.paperSprite, this.paperX, this.paperY, this.paperWidth, this.paperHeight);
                } else {
                    ctx.fillStyle = "#FFF8DC";
                    ctx.fillRect(this.paperX, this.paperY, this.paperWidth, this.paperHeight);
                }
                
                // Hover effect on paper
                if (this.game.mouse) {
                    let mx = this.game.mouse.x;
                    let my = this.game.mouse.y;
                    
                    if (mx >= this.paperX && mx <= this.paperX + this.paperWidth &&
                        my >= this.paperY && my <= this.paperY + this.paperHeight) {
                        ctx.strokeStyle = "yellow";
                        ctx.lineWidth = 3;
                        ctx.strokeRect(this.paperX - 5, this.paperY - 5, this.paperWidth + 10, this.paperHeight + 10);
                    }
                }
            }
        }

        // Draw inventory area label if player has key
        if (this.hasKey) {
            ctx.fillStyle = "#333";
            ctx.fillRect(this.x + 20, this.y + 20, 125, 175);
            
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText("INVENTORY:", this.x + 40, this.y + 40);
            
            // Draw the diamond key at dragged position (or original if not dragging)
            if (this.keySprite && this.keySprite.complete) {
                ctx.drawImage(this.keySprite, this.dragKeyX, this.dragKeyY, this.keyWidth, this.keyHeight);
            } else {
                ctx.fillStyle = "cyan";
                ctx.fillRect(this.dragKeyX, this.dragKeyY, this.keyWidth, this.keyHeight);
            }
        }
        
        // Instructions
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("Press ESC or click outside to close", this.x + 180, this.y + this.height + 30);
    }
}
