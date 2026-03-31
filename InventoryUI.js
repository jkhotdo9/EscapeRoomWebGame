class InventoryUI {
    constructor(game) {
        this.game = game;
        
        // Inventory panel dimensions
        this.width = 680;
        this.height = 400;
        this.x = (1380 - this.width) / 2; // Center on screen
        this.y = (882 - this.height) / 2;
        
        // Grid layout for items
        this.slotsPerRow = 4;
        this.slotSize = 120;
        this.slotPadding = 20;
        this.startX = this.x + 60;
        this.startY = this.y + 90;

        this.wasIPressed = true; 
        this.removeFromWorld = false;
        this.isPopup = true;
        this.wasMouseDown = false; // Track mouse press to detect a fresh click
    }
    
    update() {
    // Press I to close (but wait for key to be released first)
    if (this.game.I && !this.wasIPressed) {
        this.close();
        return;
    }
    this.wasIPressed = this.game.I;

    // ESC to close
    if (this.game.keys["Escape"]) {
        this.close();
        return;
    }

    // Handle mouse click (mouseDown is more reliable than game.click)
if (this.game.mouseDown && !this.wasMouseDown && this.game.mouse) {
    console.log("Inventory click coords:", this.game.mouse); // <-- ADD THIS LINE
    this.handleClick(this.game.mouse.x, this.game.mouse.y);
}
this.wasMouseDown = this.game.mouseDown;
}
    
    handleClick(clickX, clickY) {
        let inventory = this.game.sceneManager.inventory;
        
        // Check each item slot
        inventory.forEach((item, index) => {
            let row = Math.floor(index / this.slotsPerRow);
            let col = index % this.slotsPerRow;
            
            let slotX = this.startX + col * (this.slotSize + this.slotPadding);
            let slotY = this.startY + row * (this.slotSize + this.slotPadding);
            
            // Check if click is within this slot
            if (clickX >= slotX && clickX <= slotX + this.slotSize &&
                clickY >= slotY && clickY <= slotY + this.slotSize) {
                this.onItemClick(item);
            }
        });
    }
    
    onItemClick(item) {

        console.log("Clicked item name:", item.name);
    
if (item.name === "Strange Note") {
  this.game.I = false;
  this.game.mouseDown = false;
  this.close();

  this.game.examining = true;
  this.game.addEntity(new NoteZoomView(this.game, "./Sprites/Room1/067Codex.png"));
  return;
}
        
// If it's the candle codex, open the codex view
if (item.name === "Candle Codex") {

    // Consume I so the next popup does not instantly close
    this.game.I = false;

    // Close inventory
    this.close();

    // Open codex view
    this.game.examining = true;
    this.game.addEntity(new CodexZoomView(this.game));
    return;
}
               
        // If it's a used item, show message
        if (item.used) {
            // Could add a visual notification here
        }
    }
    
    close() {
        this.removeFromWorld = true;
        this.game.examining = false;
    }
    
    draw(ctx) {
        // Darken background
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, 1380, 882);
        
        // Draw inventory panel background
        ctx.fillStyle = "#3E2723"; // Dark brown
        ctx.fillRect(this.x - 10, this.y - 10, this.width + 20, this.height + 20);
        
        ctx.fillStyle = "#5D4037"; // Medium brown
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Title
        const titleImg = ASSET_MANAGER.getAsset("./Sprites/UI/Inventory.png");
        if (titleImg) {
            ctx.drawImage(titleImg, this.x + 200, this.y + 10, 300, 50); // x, y, width, height
        }
        
        // Draw item slots
        let inventory = this.game.sceneManager.inventory;
        
        // displaying each item in the inventory 
        inventory.forEach((item, index) => {
            let row = Math.floor(index / this.slotsPerRow);
            let col = index % this.slotsPerRow;
            
            let slotX = this.startX + col * (this.slotSize + this.slotPadding);
            let slotY = this.startY + row * (this.slotSize + this.slotPadding);
            
            // Draw slot background and slot border
            ctx.fillStyle = "#424242";
            ctx.fillRect(slotX, slotY, this.slotSize, this.slotSize);

            ctx.strokeStyle = "#242121"; 
            ctx.lineWidth = 3;
            ctx.strokeRect(slotX, slotY, this.slotSize, this.slotSize); 
            
            // Draw item sprite
            let sprite = ASSET_MANAGER.getAsset(item.sprite);
            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                if (item.name === "diamond_key") {
                    let keyW = 40;
                    let keyH = 80;
                    // center it in the slot
                    let keyX = slotX + (this.slotSize - keyW) / 2;
                    let keyY = slotY + (this.slotSize - keyH) / 2;
                    ctx.drawImage(sprite, keyX, keyY, keyW, keyH);
                } else {
                    ctx.drawImage(sprite, slotX + 10, slotY + 10, this.slotSize - 20, this.slotSize - 20);
                }
            } else {
                // Placeholder
                ctx.fillStyle = "#888";
                ctx.fillRect(slotX + 10, slotY + 10, this.slotSize - 20, this.slotSize - 20);
            }
            
            // Hover effect
            if (this.game.mouse) {
                let mx = this.game.mouse.x;
                let my = this.game.mouse.y;
                
                if (mx >= slotX && mx <= slotX + this.slotSize &&
                    my >= slotY && my <= slotY + this.slotSize) {
                    // Highlight border
                    ctx.strokeStyle = "yellow";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(slotX, slotY, this.slotSize, this.slotSize);
                    
                    // Show item name below slot
                    ctx.fillStyle = "white";
                    ctx.font = "16px Arial";
                    let displayName = item.name.replace("_", " ").toUpperCase();
                    ctx.fillText(displayName, slotX, slotY + this.slotSize + 20);
                }
            }
        });
        
        // Instructions
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("Click an item to examine it", this.x + 245, this.y + this.height - 25);
        ctx.fillText("Press I or ESC to close", this.x + 260, this.y + this.height - 5);
    }
}