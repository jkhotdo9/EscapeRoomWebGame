class MedallionDoor {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 155;
        this.height = 187;
        
        // Get slot contents from puzzle state
        this.slotContents = this.game.sceneManager.puzzleStates.room3.medallionSlots || [null, null, null];
        
        this.removeFromWorld = false;
        
        // Load medallion sprites
        this.medallionSprites = {
            snowflake: ASSET_MANAGER.getAsset("./Sprites/Room3/SnowflakeMedallion.png"),
            candle: ASSET_MANAGER.getAsset("./Sprites/Room3/CandleMedallion.png"),
            leaf: ASSET_MANAGER.getAsset("./Sprites/Room3/LeafMedallion.png")
        };
        
        // Medallion positions on door (adjust these to match your door sprite's slot positions)
        this.medallionSlots = [
            { x: this.x + 28, y: this.y + 50, width: 30, height: 30 },   // Left slot
            { x: this.x + 62, y: this.y + 50, width: 30, height: 30 },   // Middle slot
            { x: this.x + 94, y: this.y + 50, width: 30, height: 30 }    // Right slot
        ];
    }
    
    update() {
        // Sync with puzzle state
        this.slotContents = this.game.sceneManager.puzzleStates.room3.medallionSlots || [null, null, null];
        
        // Interaction
        if (this.isNearLily() && this.game.E && !this.game.examining) {
            this.openZoomView();
        }
    }
    
    isNearLily() {
        let lily = this.game.sceneManager.lily;
        if (!lily.BB) return false;
        
        let distance = Math.sqrt(
            Math.pow((this.x + this.width/2) - (lily.BB.x + lily.BB.width/2), 2) + 
            Math.pow((this.y + this.height/2) - (lily.BB.y + lily.BB.height/2), 2)
        );
        
        return distance < 120;
    }
    
    openZoomView() {

    const sm = this.game.sceneManager;

    const hasAllMedallions =
        sm.hasItem("Snowflake Medallion") &&
        sm.hasItem("Candle Medallion") &&
        sm.hasItem("Leaf Medallion");

    const r3 = sm.puzzleStates.room3;

    // dialogue once when all medallions obtained
    if (hasAllMedallions && !r3.medallionDialoguePlayed) {

        r3.medallionDialoguePlayed = true;

        this.game.examining = true;
        this.game.E = false;

        sm.dialogueBox.startSequence(
            [
                { speaker: "Lily", text: "Okay, I have all medallions! Huh? What's this?" },
                { speaker: "", text: "[Lily notices something scratched onto the door, some sort of message.]" },
                { speaker: "Lily", text: " \"Room order\" ...? Huh. it must be some sort of hint for the medallions." },
                
            ],
            "./Sprites/UI/LilyPortrait.png",
            null,
            () => {
                this.game.addEntity(new MedallionDoorZoomView(this.game, this));
            }
        );

    } else {

        this.game.addEntity(new MedallionDoorZoomView(this.game, this));
        this.game.examining = true;
        this.game.E = false;
    }
}

    draw(ctx) {

        if (this.game.sceneManager.puzzleStates.room3.medallionDoor) {
            return; // Door is unlocked, don't draw anything
        }
        
        // ONLY draw medallions if door is still locked
        for (let i = 0; i < this.slotContents.length; i++) {
            let medallionType = this.slotContents[i];
            if (medallionType) {
                let slot = this.medallionSlots[i];
                let sprite = this.medallionSprites[medallionType];
                
                if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                    ctx.drawImage(sprite, slot.x, slot.y, slot.width, slot.height);
                } else {
                    // Placeholder
                    ctx.fillStyle = "gold";
                    ctx.beginPath();
                    ctx.arc(slot.x + slot.width/2, slot.y + slot.height/2, slot.width/2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        // Interaction prompt (also hide when unlocked)
        if (this.isNearLily() && !this.game.examining) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";
            
            let text = "Press E to examine";
            let textX = this.x + this.width/2 - ctx.measureText(text).width/2;
            let textY = this.y + 20;
            
            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
    }
    
    get depth() {
        return this.y + this.height - 50; // Draw on top of door
    }
}