class CandleTableZoomView {
    constructor(game, table) {
        this.game = game;
        this.table = table;
        this.isPopup = true;
        
        this.width = 1021;
        this.height = 772;
        this.x = (1380 - this.width) / 2;
        this.y = (882 - this.height) / 2;
        
        this.correctOrder = ["pink", "purple", "blue", "green", "yellow"];
        
        this.candleOrder = this.game.sceneManager.puzzleStates.room3.candleOrder || ["purple", "blue", "yellow", "pink", "green"];

        this.tableBackground = ASSET_MANAGER.getAsset("./Sprites/Room3/zoomedInCandleTable.png");
        
        // Candle positions (5 slots)
        this.slotY = this.y + 300;
        this.slotWidth = 140;
        this.slotHeight = 250;
        this.slotSpacing = 160;
        this.slotStartX = this.x + 100;
        
        // Drag state
        this.draggingIndex = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.dragX = 0;
        this.dragY = 0;
        
        this.removeFromWorld = false;

        this.debugSlots = false; // Set to false to hide slot outlines

        
        // Load candle sprites
        this.candleSprites = {
            pink: ASSET_MANAGER.getAsset("./Sprites/Room3/PinkCandle.png"),
            purple: ASSET_MANAGER.getAsset("./Sprites/Room3/PurpleCandle.png"),
            blue: ASSET_MANAGER.getAsset("./Sprites/Room3/BlueCandle.png"),
            green: ASSET_MANAGER.getAsset("./Sprites/Room3/GreenCandle.png"),
            yellow: ASSET_MANAGER.getAsset("./Sprites/Room3/YellowCandle.png")
        };

        //this.zoomedInTableSprite = ASSET_MANAGER.getAsset("./Sprites/Room3/zoomedInCandleTable.png")
    }
    
    update() {
        // ESC to close
        if (this.game.keys["Escape"]) {
            this.close();
            return;
        }
        
        // Handle drag and drop
        this.handleDragAndDrop();
        
        // Check if solved
        this.checkSolution();
    }
    
    handleDragAndDrop() {

        if (!this.game.mouse) return;
        
        let mx = this.game.mouse.x;
        let my = this.game.mouse.y;
        
        // Start dragging
        if (this.game.mouseDown && this.draggingIndex === null) {
            for (let i = 0; i < this.candleOrder.length; i++) {
                let slotX = this.slotStartX + i * this.slotSpacing;
                
                if (mx >= slotX && mx <= slotX + this.slotWidth &&
                    my >= this.slotY && my <= this.slotY + this.slotHeight) {
                    this.draggingIndex = i;
                    this.dragOffsetX = mx - slotX;
                    this.dragOffsetY = my - this.slotY;
                    this.dragX = slotX;
                    this.dragY = this.slotY;
                    break;
                }
            }
        }
        
        // While dragging
        if (this.draggingIndex !== null && this.game.mouseDown) {
            this.dragX = mx - this.dragOffsetX;
            this.dragY = my - this.dragOffsetY;
        }
        
        // Release - swap candles
        if (this.draggingIndex !== null && !this.game.mouseDown) {

            SOUND_MANAGER.play("./SFX/Room3/DraggingCandles.mp3", this.game);
            
            // Find which slot we dropped into
            let droppedSlot = null;
            for (let i = 0; i < 5; i++) {
                let slotX = this.slotStartX + i * this.slotSpacing;
                let slotCenterX = slotX + this.slotWidth / 2;
                
                if (Math.abs(mx - slotCenterX) < this.slotWidth / 2) {
                    droppedSlot = i;
                    break;
                }
            }
            
            // Swap if valid
            if (droppedSlot !== null && droppedSlot !== this.draggingIndex) {
                let temp = this.candleOrder[this.draggingIndex];
                this.candleOrder[this.draggingIndex] = this.candleOrder[droppedSlot];
                this.candleOrder[droppedSlot] = temp;
                
                // Save state
                this.game.sceneManager.puzzleStates.room3.candleOrder = [...this.candleOrder];
            }
            
            this.draggingIndex = null;
        }
    }
    
    checkSolution() {
        let correct = true;
        for (let i = 0; i < this.correctOrder.length; i++) {
            if (this.candleOrder[i] !== this.correctOrder[i]) {
                correct = false;
                break;
            }
        }
        
        if (correct && !this.table.puzzleSolved) {
            this.table.onPuzzleSolved();
            setTimeout(() => this.close(), 500); // Close after .5s
        }
    }
    
    close() {
        this.removeFromWorld = true;
        this.game.examining = false;
    }
    
    draw(ctx) {
            // Darken background
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.fillRect(0, 0, 1380, 882);
            
            if (this.tableBackground && this.tableBackground.complete && this.tableBackground.naturalWidth > 0) {
                ctx.drawImage(this.tableBackground, this.x, this.y, this.width, this.height);
            } else {
                // Placeholder if sprite doesn't load
                ctx.fillStyle = "#2C1810";
                ctx.fillRect(this.x, this.y, this.width, this.height);
                
                ctx.strokeStyle = "white";
                ctx.lineWidth = 3;
                ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
            
            // Title
            ctx.fillStyle = "white";
            ctx.font = "28px Arial";
            ctx.fillText("Arrange the Candles", this.x + 350, this.y + 60);

            // Draw candles
            for (let i = 0; i < 5; i++) {
                let slotX = this.slotStartX + i * this.slotSpacing;
                
                if (this.debugSlots) {
                    // Draw slot boundary
                    ctx.strokeStyle = "lime";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(slotX, this.slotY, this.slotWidth, this.slotHeight);
                    
                    // Draw slot center point
                    ctx.fillStyle = "red";
                    ctx.beginPath();
                    ctx.arc(slotX + this.slotWidth/2, this.slotY + this.slotHeight/2, 5, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Draw slot number
                    ctx.fillStyle = "yellow";
                    ctx.font = "20px Arial";
                    ctx.fillText(`Slot ${i}`, slotX + 10, this.slotY + 20);
                    
                    // Draw slot X position
                    ctx.fillStyle = "white";
                    ctx.font = "14px Arial";
                    ctx.fillText(`X: ${slotX}`, slotX + 10, this.slotY + 40);
                }
                
                // Draw candle (if not being dragged)
                if (i !== this.draggingIndex) {
                    this.drawCandle(ctx, this.candleOrder[i], slotX, this.slotY);
                }
            }
            
            // Draw dragging candle on top
            if (this.draggingIndex !== null) {
                this.drawCandle(ctx, this.candleOrder[this.draggingIndex], this.dragX, this.dragY);
            }
            
            // Instructions
            ctx.fillStyle = "white";
            ctx.font = "18px Arial";
            ctx.fillText("Drag candles to rearrange them", this.x + 330, this.y + this.height - 40);
            ctx.fillText("Press ESC to close", this.x + 420, this.y + this.height - 15);
        }
    
    drawCandle(ctx, color, x, y) {
        let sprite = this.candleSprites[color];
        
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, x, y, this.slotWidth, this.slotHeight);
        } else {
            // Placeholder with color
            let colorMap = {
                pink: "#e330f3",
                purple: "#4c1f9e",
                blue: "#388edf",
                green: "#09ff00",
                yellow: "#ebee39"
            };
            
            ctx.fillStyle = colorMap[color] || "#888";
            ctx.fillRect(x + 20, y + 20, this.slotWidth - 40, this.slotHeight - 40);
            
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText(color, x + 30, y + this.slotHeight/2);
        }
    }
}