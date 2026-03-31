class CandleTable {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 150; // these are only used for if near lily maybe we fix or refactor this later
        this.height = 100; // these are only used for if near lily maybe we fix or refactor this later
        
        // Check if puzzle is solved
        this.puzzleSolved = this.game.sceneManager.puzzleStates.room3.candlesArranged;
        this.medallionTaken = this.game.sceneManager.puzzleStates.room3.candleMedallion;
        
        // Medallion spawn position (appears when puzzle solved)
        this.medallionX = this.x + 10;
        this.medallionY = this.y + 180;
        this.medallionWidth = 60;
        this.medallionHeight = 60;
        
        this.isSolid = false;
        this.removeFromWorld = false;
        
        // Load sprites
        this.medallionSprite = ASSET_MANAGER.getAsset("./Sprites/Room3/CandleMedallion.png");
    }
    
    update() {
        // Interaction with table (dialogue + choice before puzzle)
    if (this.isNearLily() && this.game.E && !this.game.examining) {

        // Consume E to prevent retrigger
        this.game.E = false;
        this.game.examining = true;

        this.game.sceneManager.dialogueBox.startSequence(
            [
                { speaker: "", text: "[In front of Lily, there is a table with different colored candles on them]" }
            ],
            null,
            null,
            () => {

                this.game.sceneManager.dialogueBox.openChoice(
                    "Interact?",
                    [
                        {
                            label: "Yes",
                            onSelect: () => {
    // Mark that Lily interacted with the candle table at least once
    this.game.sceneManager.puzzleStates.room3.talkedAboutCandles = true;

    // Check if the player already obtained the candle codex
    const hasCodexFlag = !!this.game.sceneManager.puzzleStates.room3.hasCandleCodex;
    const hasCodexItem = (typeof this.game.sceneManager.hasItem === "function")
        ? this.game.sceneManager.hasItem("Candle Codex")
        : false;

    if (!hasCodexFlag && !hasCodexItem) {

        // Player does not have the codex yet, guide them to talk to Victor/Jin
        this.game.sceneManager.dialogueBox.openLine(
            "Hm, looks like I can move them around… I should ask Victor and Jin first, maybe they know something that can help me.",
            "./Sprites/UI/LilyPortrait.png",
            "Lily",
            () => {
                this.game.examining = false;
            }
        );

        return;
    }

    // Player has the codex, allow the puzzle
    this.game.sceneManager.dialogueBox.openLine(
        "Okay, got the codex. Let me see if I can figure out the order…",
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
                                this.game.sceneManager.dialogueBox.openLine(
                                    "Let me look somewhere else first…",
                                    null,
                                    "Lily",
                                    () => {
                                        this.game.examining = false;
                                    }
                                );
                            }
                        }
                    ],
                    "Prompt"
                );
            }
        );
    }
        
        // Pick up medallion if puzzle solved
        if (this.puzzleSolved && !this.medallionTaken && this.isNearMedallion() && this.game.E) {
            this.takeMedallion();
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
    
    isNearMedallion() {
        let lily = this.game.sceneManager.lily;
        if (!lily.BB) return false;
        
        let distance = Math.sqrt(
            Math.pow((this.medallionX + this.medallionWidth/2) - (lily.BB.x + lily.BB.width/2), 2) + 
            Math.pow((this.medallionY + this.medallionHeight/2) - (lily.BB.y + lily.BB.height/2), 2)
        );
        
        return distance < 80;
    }
    
    openZoomView() {
        this.game.addEntity(new CandleTableZoomView(this.game, this));
        this.game.examining = true;
        this.game.E = false;
    }
    
    onPuzzleSolved() {
        this.puzzleSolved = true;
        this.game.sceneManager.puzzleStates.room3.candlesArranged = true;
        SOUND_MANAGER.play("./SFX/Room3/MedallionDrop.mp3", this.game);
    }
    
    takeMedallion() {

        SOUND_MANAGER.play("./SFX/Room3/PickUpCoin.mp3", this.game);

        this.game.sceneManager.addToInventory("Candle Medallion", "./Sprites/Room3/CandleMedallion.png");
        this.medallionTaken = true;
        this.game.sceneManager.puzzleStates.room3.candleMedallion = true;
    }
    
    draw(ctx) {

        let candleOrder = this.game.sceneManager.puzzleStates.room3.candleOrder;
    
        // Candle positions on table
        let candleStartX = this.x + 30;
        let candleY = this.y - 40;
        let candleSpacing = 40;
        let candleWidth = 30;
        let candleHeight = 65;
        
        // Load candle sprites
        let candleSprites = {
            pink: ASSET_MANAGER.getAsset("./Sprites/Room3/PinkCandle.png"),
            purple: ASSET_MANAGER.getAsset("./Sprites/Room3/PurpleCandle.png"),
            blue: ASSET_MANAGER.getAsset("./Sprites/Room3/BlueCandle.png"),
            green: ASSET_MANAGER.getAsset("./Sprites/Room3/GreenCandle.png"),
            yellow: ASSET_MANAGER.getAsset("./Sprites/Room3/YellowCandle.png")
        };

        // Draw each candle
        for (let i = 0; i < candleOrder.length; i++) {
            let candleX = candleStartX + i * candleSpacing;
            let color = candleOrder[i];
            let sprite = candleSprites[color];
            
            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                ctx.drawImage(sprite, candleX, candleY, candleWidth, candleHeight);
            } else {
                // Placeholder
                let colorMap = {
                    pink: "#e330f3",
                    purple: "#4c1f9e",
                    blue: "#388edf",
                    green: "#09ff00",
                    yellow: "#ebee39"
                };
                
                ctx.fillStyle = colorMap[color] || "#888";
                ctx.fillRect(candleX, candleY, candleWidth, candleHeight);
            }
        }
 
        // Draw medallion if puzzle solved and not taken
        if (this.puzzleSolved && !this.medallionTaken) {

            //SOUND_MANAGER.play("./SFX/Room3/MedallionDrop.mp3", this.game);

            if (this.medallionSprite && this.medallionSprite.complete && this.medallionSprite.naturalWidth > 0) {
                ctx.drawImage(this.medallionSprite, this.medallionX, this.medallionY, 
                             this.medallionWidth, this.medallionHeight);
            } else {
                ctx.fillStyle = "gold";
                ctx.beginPath();
                ctx.arc(this.medallionX + this.medallionWidth/2, this.medallionY + this.medallionHeight/2, 
                       this.medallionWidth/2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Prompt for medallion
            if (this.isNearMedallion() && !this.game.examining) {
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.lineWidth = 3;
                ctx.font = "16px Arial";
                
                let text = "Press E to take";
                let textX = this.medallionX - 20;
                let textY = this.medallionY - 10;
                
                ctx.strokeText(text, textX, textY);
                ctx.fillText(text, textX, textY);
            }
        }
        
        // Prompt for table
        if (this.isNearLily() && !this.game.examining) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";
            
            let text = "Press E to examine";
            let textX = this.x + this.width/2 - 20;
            let textY = this.y - 40;
            
            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
    }
    
    get depth() {
        return this.y + this.height + 50;
    }
}