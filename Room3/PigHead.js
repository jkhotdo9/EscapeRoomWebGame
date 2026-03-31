class PigHead {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;        
        this.y = y;
        this.width = 100;  
        this.height = 80; 
        
        this.medallionTaken = this.game.sceneManager.puzzleStates.room3.snowflakeMedallion;
        this.isSolid = false; 
        
        // Load sprite
        this.pigHead = ASSET_MANAGER.getAsset("./Sprites/Room3/PigHead_Medallion.png"); 
        this.pigHeadNoMedallion = ASSET_MANAGER.getAsset("./Sprites/Room3/PigHeadEmptyMouth.png"); 
        this.removeFromWorld = false;
    }
    
    update() {
    // Only allows interaction if not already examining
    if (this.isNearLily() && this.game.E && !this.game.examining && !this.medallionTaken) {

        this.game.examining = true;
        this.game.E = false;

        // Line 1
        this.game.sceneManager.dialogueBox.openLine(
            "Eugh… it stinks…",
            "./Sprites/UI/LilyPortrait.png",
            "Lily",
            () => {

                // Line 2 (after Line 1 closes)
                this.game.sceneManager.dialogueBox.openLine(
                    "Wait! Something is shining inside its mouth…",
                    "./Sprites/UI/LilyPortrait.png",
                    "Lily",
                    () => {

                        // After Line 2 closes -> show choice
                        this.game.sceneManager.dialogueBox.openChoice(
                            "Inspect it?",
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
        this.game.addEntity(new PigHeadZoomView(this.game, this));
        this.game.examining = true;
        this.game.E = false;
    }

    // Called by PigHeadZoomView when key is taken
    onMedallionTaken() {
        this.medallionTaken = true;
        this.game.sceneManager.puzzleStates.room3.snowflakeMedallion = true;
    }
    
    draw(ctx) {
        // Use sprite without key if already taken
        let sprite = this.medallionTaken ? this.pigHeadNoMedallion : this.pigHead;
        
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            // Placeholder if key sprite isnt loaded or broken 
            ctx.fillStyle = this.keyTaken ? "#6b345f" : "#8B4444";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Show interaction prompt
        if (this.isNearLily() && !this.game.examining && !this.medallionTaken) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";
            
            let text = "Press E to Examine";
            let textX = this.x + this.width/2 - ctx.measureText(text).width/2 ;
            let textY = this.y - 10;
            
            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
    }

    get depth() {
        return this.y + this.height + 50;
    }

}