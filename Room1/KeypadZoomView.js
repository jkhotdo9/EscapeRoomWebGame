class KeypadZoomView {
    constructor(game, keypad) {
        this.game = game;
        this.keypad = keypad;
        
        this.isPopup = true; 
        
        // Zoom view dimensions
        this.width = 600;
        this.height = 700;
        this.x = (1380 - this.width) / 2;
        this.y = (882 - this.height) / 2;
        
        // Correct code
        this.correctCode = "067";
        
        // User input
        this.enteredCode = "";
        
        // Button layout (2 rows × 3 columns)
        this.buttons = [
            { num: "0", row: 0, col: 0 },
            { num: "2", row: 0, col: 1 },
            { num: "3", row: 0, col: 2 },
            { num: "6", row: 1, col: 0 },
            { num: "7", row: 1, col: 1 },
            { num: "9", row: 1, col: 2 }
        ];
        
        // Button positioning
        this.buttonSize = 165;
        this.buttonPadding = 20;
        this.buttonStartX = this.x + 35;
        this.buttonStartY = this.y + 280;
        
        // Display area for entered digits 
        this.displayX = this.x + 0;
        this.displayY = this.y + 50;
        this.displayWidth = 600;
        this.displayHeight = 200;
        
        // Track which button is pressed
        this.pressedButton = null;
        this.pressTimer = 0;
        
        // Result state
        this.showingResult = false;
        this.isCorrect = false;
        
        // Load sprites
        this.backgroundSprite = ASSET_MANAGER.getAsset("./Sprites/Room1/KeypadZoomBackground.png");
        this.digitSpritesheet = ASSET_MANAGER.getAsset("./Sprites/Room1/DigitSpriteSheet.png");
        
        // Load button sprites
        this.buttonSprites = {};
        ["0", "2", "3", "6", "7", "9"].forEach(num => {
            this.buttonSprites[num] = {
                normal: ASSET_MANAGER.getAsset(`./Sprites/Room1/Button${num}Normal.png`),
                pressed: ASSET_MANAGER.getAsset(`./Sprites/Room1/Button${num}Pressed.png`)
            };
        });
        
        // Track keyboard input
        this.lastKeyPressed = null;
        this.removeFromWorld = false;
        this.game.click = null;
    }
    
    update() {
        // Handle button press timer (for visual feedback)
        if (this.pressedButton !== null) {
            this.pressTimer += this.game.clockTick;
            if (this.pressTimer > 0.15) { // 150ms press animation
                this.pressedButton = null;
                this.pressTimer = 0;
            }
        }
        
        // Don't allow input if showing result
        if (this.showingResult) {
            // ESC to close (only if correct)
            if (this.isCorrect && this.game.keys["Escape"]) {
                this.close();
            }
            return;
        }
        
        // ESC to close
        if (this.game.keys["Escape"]) {
            this.close();
            return;
        }
        
        // Click outside to close
        if (this.game.click) {
            let clickX = this.game.click.x;
            let clickY = this.game.click.y;
            
            if (clickX < this.x || clickX > this.x + this.width ||
                clickY < this.y || clickY > this.y + this.height) {
                this.close();
                this.game.click = null;
                return;
            }
            
            // Check button clicks
            this.handleButtonClick(clickX, clickY);
            
            this.game.click = null;
        }
        
        // Handle keyboard input
        this.handleKeyboardInput();
    }
    
    handleButtonClick(clickX, clickY) {
        this.buttons.forEach(btn => {
            let btnX = this.buttonStartX + btn.col * (this.buttonSize + this.buttonPadding);
            let btnY = this.buttonStartY + btn.row * (this.buttonSize + this.buttonPadding);
            
            if (clickX >= btnX && clickX <= btnX + this.buttonSize &&
                clickY >= btnY && clickY <= btnY + this.buttonSize) {
                this.pressButton(btn.num);
            }
        });
    }
    
    handleKeyboardInput() {
        // Check if any valid number key is pressed
        ["0", "2", "3", "6", "7", "9"].forEach(num => {
            if (this.game.keys[num] && this.lastKeyPressed !== num) {
                this.pressButton(num);
                this.lastKeyPressed = num;
            }
        });
        
        // Reset last key when released
        if (this.lastKeyPressed && !this.game.keys[this.lastKeyPressed]) {
            this.lastKeyPressed = null;
        }
    }
    
    pressButton(num) {
        
        SOUND_MANAGER.play("./SFX/Room1/KeypadButtonBeep.mp3", this.game);

        // Show button press animation
        this.pressedButton = num;
        this.pressTimer = 0;
        
        // Add to entered code (max 3 digits)
        if (this.enteredCode.length < 3) {
            this.enteredCode += num;
            
            // Check if 3 digits entered
            if (this.enteredCode.length === 3) {
                this.checkCode();
            }
        }
    }
    
    checkCode() {
        
        if (this.enteredCode === this.correctCode) {
    // CORRECT!
    SOUND_MANAGER.play("./SFX/Room1/RightCode.mp3", this.game);
    this.isCorrect = true;
    this.showingResult = true;
    this.keypad.onCorrectCode();

    // ✅ Close zoom first so dialogue is visible
    this.close();

    // ✅ Next frame: show dialogue
    setTimeout(() => {
        this.game.examining = true;

        this.game.sceneManager.dialogueBox.openLine(
            "I actually did it! But where does this lead to?",
            "./Sprites/UI/LilyPortrait.png",
            "Lily",
            () => {
                this.game.examining = false;
            }
        );
    }, 0);

} 
    else {
            // WRONG!
            SOUND_MANAGER.play("./SFX/Room1/WrongCode.mp3", this.game);
            this.isCorrect = false;
            this.showingResult = true;
            this.keypad.onWrongCode();

            this.game.sceneManager.takeDamage();

            // Clear after showing red
            setTimeout(() => {
                this.enteredCode = "";
                this.showingResult = false;
            }, 2000);
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
        
        // Draw keypad background (already has display area drawn on it)
        if (this.backgroundSprite && this.backgroundSprite.complete) {
            ctx.drawImage(this.backgroundSprite, this.x, this.y, this.width, this.height);
        } else {
            // Placeholder background
            ctx.fillStyle = "#2C2C2C";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Placeholder display area (only if background sprite isn't loaded)
            ctx.fillStyle = "#1A1A1A";
            ctx.fillRect(this.displayX, this.displayY, this.displayWidth, this.displayHeight);
        }
        
        this.drawDigits(ctx);
        
        // Draw buttons
        this.buttons.forEach(btn => {
            let btnX = this.buttonStartX + btn.col * (this.buttonSize + this.buttonPadding);
            let btnY = this.buttonStartY + btn.row * (this.buttonSize + this.buttonPadding);
            
            // Choose sprite (normal or pressed)
            let isPressed = this.pressedButton === btn.num;
            let sprite = isPressed ? 
                this.buttonSprites[btn.num].pressed : 
                this.buttonSprites[btn.num].normal;
            
            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                ctx.drawImage(sprite, btnX, btnY, this.buttonSize, this.buttonSize);
            } else {
                // Placeholder button
                ctx.fillStyle = isPressed ? "#555" : "#777";
                ctx.fillRect(btnX, btnY, this.buttonSize, this.buttonSize);
                ctx.fillStyle = "white";
                ctx.font = "32px Arial";
                ctx.textAlign = "center";
                ctx.fillText(btn.num, btnX + this.buttonSize/2, btnY + this.buttonSize/2 + 10);
            }
            
            // Hover effect
            if (this.game.mouse && !this.showingResult) {
                let mx = this.game.mouse.x;
                let my = this.game.mouse.y;
                
                if (mx >= btnX && mx <= btnX + this.buttonSize &&
                    my >= btnY && my <= btnY + this.buttonSize) {
                    ctx.strokeStyle = "yellow";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(btnX, btnY, this.buttonSize, this.buttonSize);
                }
            }
        });
        
        // TODO: change this to become the sprites that i made 
        // Draw result overlay if showing (green glow or red glow)
        if (this.showingResult) {
            ctx.fillStyle = this.isCorrect ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 0, 0.29)";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Instructions
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        
        if (this.showingResult && this.isCorrect) {
            ctx.fillText("ACCESS GRANTED", this.x + this.width/2, this.y + this.height - 30);
        } else if (this.showingResult && !this.isCorrect) {
            ctx.fillText("ACCESS DENIED", this.x + this.width/2, this.y + this.height - 30);
        } else {
            ctx.fillText("Enter 3-digit code", this.x + this.width/2, this.y + this.height - 30);
        }
    }
    
    drawDigits(ctx) {
        // Position for displaying digits (adjust these to match your keypad display area)
        let digitWidth = 60;  // Width of each digit to display
        let digitHeight = 80; // Height of each digit to display
        let digitSpacing = 20; // Space between digits
        
        // Center the 3 digits in the display area
        let startX = this.displayX + (this.displayWidth - (3 * digitWidth + 2 * digitSpacing)) / 2;
        let startY = this.displayY + (this.displayHeight - digitHeight) / 2;
        
        // Draw each entered digit (or underscore placeholder)
        for (let i = 0; i < 3; i++) {
            let x = startX + i * (digitWidth + digitSpacing);
            let y = startY;
            
            if (i < this.enteredCode.length) {
                // Draw the digit from spritesheet
                let digit = this.enteredCode[i];
                this.drawDigitSprite(ctx, digit, x, y, digitWidth, digitHeight);
            } else {
                // Draw underscore placeholder
                ctx.fillStyle = this.showingResult ? 
                    (this.isCorrect ? "#00FF00" : "#FF0000") : 
                    "#888888";
                ctx.font = "48px monospace";
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                ctx.fillText("_", x + 15, y + 20);
            }
        }
    }
    
    drawDigitSprite(ctx, digit, x, y, width, height) {
        if (!this.digitSpritesheet || !this.digitSpritesheet.complete) {
            // Fallback: draw text
            ctx.fillStyle = this.showingResult ? 
                (this.isCorrect ? "#00FF00" : "#FF0000") : 
                "#FFFFFF";
            ctx.font = "48px monospace";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(digit.toString(), x, y);
            return;
        }
        
        // Map digit to index in spritesheet
        // Spritesheet order: 0, 2, 3, 6, 7, 9
        const digitMap = {
            "0": 0,
            "2": 1,
            "3": 2,
            "6": 3,
            "7": 4,
            "9": 5
        };
        
        let index = digitMap[digit.toString()];
        if (index === undefined) {
            console.error("Digit not found in spritesheet:", digit);
            return;
        }
        
        let spritesheetWidth = this.digitSpritesheet.width;
        let spritesheetHeight = this.digitSpritesheet.height;
        let digitSpriteWidth = spritesheetWidth / 6; // 6 digits in the sheet
        
        let sourceX = index * digitSpriteWidth;
        let sourceY = 0;
        
        ctx.drawImage(
            this.digitSpritesheet,
            sourceX, sourceY, digitSpriteWidth, spritesheetHeight,  // Source
            x, y, width, height  // Destination
        );
    }
}