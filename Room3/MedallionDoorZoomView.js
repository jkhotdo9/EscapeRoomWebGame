class MedallionDoorZoomView {
    constructor(game, medallionDoor) {
        this.game = game;
        this.medallionDoor = medallionDoor;
        this.isPopup = true;
        
        this.width = 1160;
        this.height = 515;
        this.x = (1380 - this.width) / 2;
        this.y = (882 - this.height) / 4;
        
        // Correct order
        this.correctOrder = ["leaf", "snowflake", "candle"];
        
        // Current slot contents (copy from puzzle state)
        this.slotContents = [...(this.game.sceneManager.puzzleStates.room3.medallionSlots || [null, null, null])];
        
        // Available medallions in inventory
        this.availableMedallions = this.getAvailableMedallions();
        
        // Slot positions (3 slots on zoomed door)
        this.slotY = this.y + 120;
        this.slotWidth = 240;
        this.slotHeight = 220;
        this.slotSpacing = 260;
        this.slotStartX = this.x + 200;
        
        // Inventory area
        this.inventoryX = this.x + 250;
        this.inventoryY = this.y + 550;
        
        // Drag state
        this.draggingMedallion = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.dragX = 0;
        this.dragY = 0;
        
        this.removeFromWorld = false;
        this.puzzleSolved = false;
        
        // Load sprites
        this.doorBackground = ASSET_MANAGER.getAsset("./Sprites/Room3/zoomedInMedallionDoor.png");
        
        this.medallionSprites = {
            snowflake: ASSET_MANAGER.getAsset("./Sprites/Room3/SnowflakeMedallion.png"),
            candle: ASSET_MANAGER.getAsset("./Sprites/Room3/CandleMedallion.png"),
            leaf: ASSET_MANAGER.getAsset("./Sprites/Room3/LeafMedallion.png")
        };
    }
    
    getAvailableMedallions() {
        let available = [];
        
        if (this.game.sceneManager.hasItem("Snowflake Medallion")) {
            available.push("snowflake");
        }
        if (this.game.sceneManager.hasItem("Candle Medallion")) {
            available.push("candle");
        }
        if (this.game.sceneManager.hasItem("Leaf Medallion")) {
            available.push("leaf");
        }
        
        return available;
    }
    
    update() {
        // ESC to close — disabled while dragging
        if (this.game.keys["Escape"] && !this.draggingMedallion) {
            this.close();
            return;
        }
        
        // Handle drag and drop
        this.handleDragAndDrop();
        
        // Check if solved
        if (!this.puzzleSolved) {
            this.checkSolution();
        }
    }
    
    handleDragAndDrop() {
        if (!this.game.mouse) return;
        
        let mx = this.game.mouse.x;
        let my = this.game.mouse.y;
        
        // Start dragging
        if (this.game.mouseDown && !this.draggingMedallion) {
            // Check slots
            for (let i = 0; i < 3; i++) {
                if (this.slotContents[i]) {
                    let slotX = this.slotStartX + i * this.slotSpacing;
                    
                    if (mx >= slotX && mx <= slotX + this.slotWidth &&
                        my >= this.slotY && my <= this.slotY + this.slotHeight) {
                        this.draggingMedallion = {
                            type: this.slotContents[i],
                            fromSlot: i
                        };
                        this.slotContents[i] = null;
                        this.dragOffsetX = mx - slotX;
                        this.dragOffsetY = my - this.slotY;
                        this.dragX = slotX;
                        this.dragY = this.slotY;
                        break;
                    }
                }
            }
            
            // Check inventory
            if (!this.draggingMedallion) {
                for (let i = 0; i < this.availableMedallions.length; i++) {
                    let invX = this.inventoryX + i * 250;
                    
                    if (mx >= invX && mx <= invX + this.slotWidth &&
                        my >= this.inventoryY && my <= this.inventoryY + this.slotHeight) {
                        this.draggingMedallion = {
                            type: this.availableMedallions[i],
                            fromInventory: true
                        };
                        this.availableMedallions.splice(i, 1);
                        this.dragOffsetX = mx - invX;
                        this.dragOffsetY = my - this.inventoryY;
                        this.dragX = invX;
                        this.dragY = this.inventoryY;
                        break;
                    }
                }
            }
        }
        
        // While dragging
        if (this.draggingMedallion && this.game.mouseDown) {
            this.dragX = mx - this.dragOffsetX;
            this.dragY = my - this.dragOffsetY;
        }
        
        // Release
        if (this.draggingMedallion && !this.game.mouseDown) {
            let placed = false;
            
            // Check if dropped on slot
            for (let i = 0; i < 3; i++) {

                SOUND_MANAGER.play("./SFX/Room3/PlacingMedallionInSlot.mp3", this.game);

                let slotX = this.slotStartX + i * this.slotSpacing;
                let slotCenterX = slotX + this.slotWidth / 2;
                let slotCenterY = this.slotY + this.slotHeight / 2;
                
                let dist = Math.sqrt(
                    Math.pow(mx - slotCenterX, 2) + 
                    Math.pow(my - slotCenterY, 2)
                );
                
                if (dist < this.slotWidth / 2) {
                    // Swap if occupied
                    if (this.slotContents[i]) {
                        this.availableMedallions.push(this.slotContents[i]);
                    }
                    
                    this.slotContents[i] = this.draggingMedallion.type;
                    placed = true;
                    
                    // Mark as used
                    this.removeMedallionsFromInventory();
                    break;
                }
            }
            
            // Return to origin if not placed
            if (!placed) {
                if (this.draggingMedallion.fromSlot !== undefined) {
                    this.slotContents[this.draggingMedallion.fromSlot] = this.draggingMedallion.type;
                } else {
                    this.availableMedallions.push(this.draggingMedallion.type);
                }
            }
            
            this.draggingMedallion = null;
        }
    }
    
    removeMedallionsFromInventory() {
 
    }
    
    checkSolution() {
        // All slots must be filled
        if (this.slotContents.includes(null)) return;
        
        // Check correct order
        let correct = true;
        for (let i = 0; i < this.correctOrder.length; i++) {
            if (this.slotContents[i] !== this.correctOrder[i]) {
                correct = false;
                break;
            }
        }
        
        if (correct) {
            this.puzzleSolved = true;
            
            // Save state
            this.game.sceneManager.puzzleStates.room3.medallionSlots = [...this.slotContents];
            
            SOUND_MANAGER.play("./SFX/OpeningDoor.mp3", this.game);

            setTimeout(() => {
                this.game.sceneManager.puzzleStates.room3.medallionDoor = true;
                this.game.sceneManager.puzzleStates.room3.door3Open = true;
                this.close();
            }, 1000);
        }
    }
    
    close() {
        // Sync real inventory to match what's in slots + availableMedallions
        // First restore all medallions to inventory
        const nameMap = {
            snowflake: "Snowflake Medallion",
            candle: "Candle Medallion",
            leaf: "Leaf Medallion"
        };
        const spriteMap = {
            snowflake: "./Sprites/Room3/SnowflakeMedallion.png",
            candle: "./Sprites/Room3/CandleMedallion.png",
            leaf: "./Sprites/Room3/LeafMedallion.png"
        };

        // Remove all medallions from real inventory first
        this.game.sceneManager.removeFromInventory("Snowflake Medallion");
        this.game.sceneManager.removeFromInventory("Candle Medallion");
        this.game.sceneManager.removeFromInventory("Leaf Medallion");

        // Re-add only the ones sitting in availableMedallions (not placed in slots)
        for (const type of this.availableMedallions) {
            this.game.sceneManager.addToInventory(nameMap[type], spriteMap[type]);
        }

        // Save slot state
        this.game.sceneManager.puzzleStates.room3.medallionSlots = [...this.slotContents];

        this.removeFromWorld = true;
        this.game.examining = false;
    }
    
    draw(ctx) {

        // Darken background
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, 1380, 882);
        
        // Door background
        if (this.doorBackground && this.doorBackground.complete && this.doorBackground.naturalWidth > 0) {
            ctx.drawImage(this.doorBackground, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = "#2C1810";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
        
        // Draw slots
        for (let i = 0; i < 3; i++) {
            let slotX = this.slotStartX + i * this.slotSpacing;
            
            // Draw medallion in slot
            if (this.slotContents[i] && (!this.draggingMedallion || this.draggingMedallion.fromSlot !== i)) {
                this.drawMedallion(ctx, this.slotContents[i], slotX, this.slotY);
            }
        }
        
        for (let i = 0; i < this.availableMedallions.length; i++) {
            let invX = this.inventoryX + i * 250;
            this.drawMedallion(ctx, this.availableMedallions[i], invX, this.inventoryY);
        }
        
        // Draw dragging medallion
        if (this.draggingMedallion) {
            this.drawMedallion(ctx, this.draggingMedallion.type, this.dragX, this.dragY);
        }
        
        // Instructions
        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText("Drag medallions to the slots", this.x + 450, this.y + this.height - 60);
        ctx.fillText("Press ESC to close", this.x + 480, this.y + this.height - 30);
    }
    
    drawMedallion(ctx, type, x, y) {
        let sprite = this.medallionSprites[type];
        
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, x + 5, y + 5, this.slotWidth - 20, this.slotHeight - 20);
        } else {
            ctx.fillStyle = "gold";
            ctx.beginPath();
            ctx.arc(x + this.slotWidth/2, y + this.slotHeight/2, (this.slotWidth - 20)/2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText(type, x + 20, y + this.slotHeight/2);
        }
    }
}