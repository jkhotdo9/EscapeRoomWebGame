class Door {
    constructor(game, x, y, width, height, destinationRoom, spawnX, spawnY, lockedSpritePath, openSpritePath, isLocked = true, opacity = 1.0, depthOverride = 50,) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.destinationRoom = destinationRoom; 
        this.spawnX = spawnX; 
        this.spawnY = spawnY;
        this.isLocked = isLocked;
        this.removeFromWorld = false;
        this.canTrigger = true;
        this.depthOverride = depthOverride; 
        this.opacity = opacity; //NOTE: i made this when we were using the same door image so i have to find a way to make half of them clear, but now its a door per each room so maybe we dont need this in the final version 
        this.showingOpen = false;


        this.lockedDORE = ASSET_MANAGER.getAsset(lockedSpritePath);
        this.openDORE   = ASSET_MANAGER.getAsset(openSpritePath);
    }
    
    update() {

        if (this.destinationRoom === "ending" && this.isLocked) {
            if (this.game.sceneManager.puzzleStates.room5?.postTalkSequencePlayed) {
                this.unlock();
            }
        }

        if (!this.canTrigger) return;
    
        if (this.isLocked) {
            // Check Room 1 -> Room 2 door
            if (this.destinationRoom === "room2" && this.game.sceneManager.puzzleStates.room1.door1Open) {
                this.unlock();
            }
            
            // Check Room 2 -> Room 3 door
            if (this.destinationRoom === "room3" && this.game.sceneManager.puzzleStates.room2.door2Open) {
                this.unlock();
            }
            
            // Check Room 3 -> Room 4 door (medallion door)
            if (this.destinationRoom === "room4" && this.game.sceneManager.puzzleStates.room3.door3Open) {
                this.unlock();
            }
    }
        // Block door interaction while dialogue or examining is active
        if (this.game.sceneManager.dialogueBox.active || this.game.examining) {
            return;
        }

        // Only trigger once per key press
        if (this.isTouchingLily() && this.game.E && this.canTrigger) {
            if (!this.isLocked) {
                this.game.E = false; // only consume E when door is actually usable
                this.canTrigger = false;

            // Room 2 -> Room 3: must say goodbye to Shiannel first
            if (this.destinationRoom === "room3") {
                const r2 = this.game.sceneManager.puzzleStates.room2;
                const shi = this.game.sceneManager.npcStates.shiannel;

                // block if Shiannel hasn't had her goodbye yet
                if (!r2.saidGoodbyeToShiannel) {
                    // only show the nudge dialogue once
                    if (!r2.nudgedToShiannel) {
                        r2.nudgedToShiannel = true;
                        this.game.examining = true;

                        this.game.sceneManager.dialogueBox.startSequence(
                            [{ speaker: "Lily", text: "Hmm... I should let Shiannel know I got the door open first." }],
                            null, null,
                            () => {
                                this.game.examining = false;
                                this.canTrigger = true;
                                this.game.sceneManager.npcStates.shiannel.stage = 2;
                            }
                        );
                    } else {
                        // nudge already shown, just reset canTrigger so they can walk away
                        this.canTrigger = true;
                    }
                    return;
                }
            }

            // Special ending door behaviour
            if (this.destinationRoom === "ending") {
                SOUND_MANAGER.play("./SFX/OpeningDoor.mp3", this.game);
                this.showingOpen = true; // show open sprite briefly
                this.game.examining = true;
                setTimeout(() => {
                    this.game.sceneManager.loadRoom("ending", 0, 0);
                }, 1500);
                return;
            }

            this.game.sceneManager.loadRoom(
                this.destinationRoom,
                this.spawnX,
                this.spawnY
            );
            }
        }

        // Reset trigger when Lily walks away
        if (!this.isTouchingLily()) {
            this.canTrigger = true;
        }
    }
    
    isTouchingLily() {
        let lily = this.game.lily || this.game.sceneManager.lily;

        if (!lily.BB) return false;
        
        // must use the bouding box collisions of lily, not the size or xy of her
        return (
            this.x < lily.BB.x + lily.BB.width &&
            this.x + this.width > lily.BB.x &&
            this.y < lily.BB.y + lily.BB.height &&
            this.y + this.height > lily.BB.y
        );
    }
    
    unlock() {
        this.isLocked = false;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        // Ending door always shows locked sprite until player triggers it
        let sprite;
        if (this.destinationRoom === "ending") {
            sprite = this.showingOpen ? this.openDORE : this.lockedDORE;
        } else {
            sprite = this.isLocked ? this.lockedDORE : this.openDORE;
        }

        ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        ctx.restore();

        if (this.isTouchingLily() && !this.game.examining) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";

            let text;
            if (this.destinationRoom === "ending") {
                text = this.isLocked ? "Door is locked" : "Press E to Escape";
            } else {
                text = this.isLocked ? "Door is locked" : "Press E to enter";
            }

            let textX = this.x + this.width/2 - ctx.measureText(text).width/2;
            let textY = this.destinationRoom === "ending" ? this.y + 40 : this.y - 20;

            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
    }

    get depth() {
        return this.depthOverride ?? (this.BB ? this.BB.bottom : this.y + this.height);
    }
}