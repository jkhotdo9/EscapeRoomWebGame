class MusicNoteFrame {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 135;
        this.height = 135;
        
        this.pipeTaken = this.game.sceneManager.puzzleStates.room2.pipeObtained;
        
        this.closedSprite = ASSET_MANAGER.getAsset("./Sprites/Room2/MusicNoteFrameClosed.png");
        this.openSprite = ASSET_MANAGER.getAsset("./Sprites/Room2/MusicNoteFrameOpen.png");
        
        this.isSolid = false;
        this.removeFromWorld = false;
    }
    
    update() {

    if (
        this.isNearLily() &&
        this.game.E &&
        !this.game.examining &&
        !this.game.sceneManager.dialogueBox.active &&
        this.game.sceneManager.npcStates.shiannel.met
    ) {

        this.game.E = false;

        // If pipe already taken, show different dialogue
        if (this.pipeTaken) {

            this.game.examining = true;

            this.game.sceneManager.dialogueBox.openLine(
                "To think a weapon was hidden behind this painting...",
                "./Sprites/UI/LilyPortrait.png",
                "Lily",
                () => {
                    this.game.examining = false;
                }
            );

            return;
        }

        // Normal interaction flow before pipe is taken
        this.game.examining = true;

        this.game.sceneManager.dialogueBox.openLine(
            "Huh, a music note...",
            "./Sprites/UI/LilyPortrait.png",
            "Lily",
            () => {

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
        
        this.game.addEntity(new MusicNoteZoomView(this.game, this));
        
        this.game.examining = true;
        this.game.E = false;
    }
    
    onPipeTaken() {
        this.pipeTaken = true;
        this.game.sceneManager.puzzleStates.room2.pipeObtained = true;
    }
    
    draw(ctx) {
        let sprite = this.pipeTaken ? this.openSprite : this.closedSprite;
        
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            // Placeholder
            ctx.fillStyle = this.pipeTaken ? "#6B8E23" : "#8B7355";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "12px Arial";
            ctx.fillText("Music Frame", this.x + 10, this.y + this.height/2);
        }
        
        // Show interaction prompt
        if (this.isNearLily() && !this.game.examining && this.game.sceneManager.npcStates.shiannel.met) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";
            
            let text = "Press E to Examine";
            let textX = this.x + this.width/2 - ctx.measureText(text).width/2 + 0;
            let textY = this.y - 20;
            
            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
    }
    
    get depth() {
        return this.y + this.height;
    }
}