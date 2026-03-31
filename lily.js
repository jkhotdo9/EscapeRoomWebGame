class Lily {
    constructor(game, x, y) { // Add x, y parameters
        this.game = game;
        this.x = x;
        this.y = y;
        this.scale = .2; // Add scale property (40% of original size)
        this.width = 100; // Add hitbox size
        this.height = 125;
        this.speed = 450;

        // walking stuffs
        this.footstepTimer = 0;
        this.footstepCooldown = 0.35;
        this.wasMoving = false;
        this.isLooping = false;
        this.walkLoopAudio = new Audio("./SFX/WalkingOnWood.mp3");
        this.walkLoopAudio.loop = true;
        this.walkLoopAudio.volume = 0.4;
        
        const sheet = ASSET_MANAGER.getAsset("./Sprites/LilySpriteSheet2_0.png");

        // spritesheet, xStart, yStart, width, height, frameCount, frameDuration
        this.animations = {
            idleDown:  new Animator(sheet, 0, 60,   800, 928, 2, 0.6),  // row 1: idle down
            walkDown:  new Animator(sheet, 0, 928,  801, 800, 4, 0.1), // row 2: walk down
            walkLeft:  new Animator(sheet, 0, 1760, 816, 744, 4, 0.14), // row 3: walk left
            walkRight: new Animator(sheet, 0, 2525, 815, 744, 4, 0.14), // row 4: walk right
            walkUp:    new Animator(sheet, 0, 3270, 801, 800, 4, 0.1), // row 5: walk up
            idleUp:    new Animator(sheet, 0, 4200, 790, 775, 2, 0.6),  // row 6: idle up
            idleLeft:  new Animator(sheet, 0, 5080, 850, 744, 2, 0.6),  // row 7: idle left
            idleRight: new Animator(sheet, 0, 5910, 805, 744, 2, 0.6),  // row 8: idle right
        };

        // Track current state
        this.currentAnimation = this.animations.idleDown;
        this.facing = "down"; // Track which way Lily is facing

        //initial bounding box
        this.updateBB();
        this.lastBB = this.BB;
    }
    
    updateBB() {
        this.offsetX = 55; // shifts to right
        this.offsetY = 80; // shifts down 

        //lilys boundingbox 
        const bbWidth = 80; 
        const bbHeight = 30; 
        this.BB = new BoundingBox( this.x + this.offsetX, this.y + this.offsetY, bbWidth, bbHeight );
    
    }

    updateLastBB() {
        this.lastBB = this.BB;
    }

    update() {
        // stops movement when dialogue or zoom is active
        const sm = this.game.sceneManager;
        if (this.game.examining || (sm && sm.dialogueBox && sm.dialogueBox.active) || this.game.E) {
            this.currentAnimation = this.animations.idleDown;
            // Always stop footsteps every frame when frozen, no conditions
            this.walkLoopAudio.pause();
            this.walkLoopAudio.currentTime = 0;
            this.isLooping = false;
            this.wasMoving = false;
            SOUND_MANAGER.stop("./SFX/WalkingOnWood1.mp3");
            return;
        }

        let dx = 0;
        let dy = 0;

        let moving = false;
        
        // handles movement and set appropriate animation
        if (this.game.left) {
            dx -= this.speed * this.game.clockTick;
            this.currentAnimation = this.animations.walkLeft;
            this.facing = "left";
            moving = true;
        }
        if (this.game.right) {
            dx += this.speed * this.game.clockTick;
            this.currentAnimation = this.animations.walkRight;
            this.facing = "right";
            moving = true;
        }
        if (this.game.up) {
            dy -= this.speed * this.game.clockTick;
            this.currentAnimation = this.animations.walkUp;
            this.facing = "up";
            moving = true;
        }
        if (this.game.down) {
            dy += this.speed * this.game.clockTick;
            this.currentAnimation = this.animations.walkDown;
            this.facing = "down";
            moving = true;
        }

        // mutes footsteps when game is muted
        // gotta sync the mute state
        this.walkLoopAudio.muted = !!this.game.muted;

       // Footstep soundss
        if (moving) {
            if (!this.wasMoving) {
                // just started - play tap once
                this.isLooping = false;
                this.walkLoopAudio.pause();
                this.walkLoopAudio.currentTime = 0;
                SOUND_MANAGER.play("./SFX/WalkingOnWood1.mp3", this.game);
                this.footstepTimer = this.footstepCooldown;
            }

            this.footstepTimer -= this.game.clockTick;

            if (this.footstepTimer <= 0 && !this.isLooping) {
                // tap finished, start loop
                this.isLooping = true;
                this.walkLoopAudio.play().catch(() => {});
            }

            this.wasMoving = true;

            } else {
                // stops the audio when lily isnt moving
                this.walkLoopAudio.pause();
                this.walkLoopAudio.currentTime = 0;
                this.isLooping = false;
                SOUND_MANAGER.stop("./SFX/WalkingOnWood1.mp3");
                this.footstepTimer = 0;
                this.wasMoving = false;
            } 

        // If not moving, use idle animation
        if (!moving) {
            switch (this.facing) {
                case "up":    this.currentAnimation = this.animations.idleUp;    break;
                case "left":  this.currentAnimation = this.animations.idleLeft;  break;
                case "right": this.currentAnimation = this.animations.idleRight; break;
                default:      this.currentAnimation = this.animations.idleDown;  break; 
            }
        }

        // X movement 
        this.x += dx;
        this.updateLastBB();
        this.updateBB();
        this.handleHorizontalCollisions();

        // Y movement
        this.y += dy;
        this.updateLastBB();
        this.updateBB();
        this.handleVerticalCollisions();
    }

   handleHorizontalCollisions() { 
        for (let entity of this.game.entities) { 
            if (entity !== this && entity.isSolid && entity.BB) { 
                if (this.BB.collide(entity.BB)) { 
                    if (this.lastBB.right <= entity.BB.left) { 
                        // hit from left 
                        this.x = entity.BB.left - this.BB.width - this.offsetX; 
                    } 
                    else if (this.lastBB.left >= entity.BB.right) { 
                        // hit from right 
                        this.x = entity.BB.right - this.offsetX; 
                    } 
                    this.updateBB(); 
                } 
            } 
        } 
    }

    handleVerticalCollisions() {
        // Resolve up/down collisions
        for (let entity of this.game.entities) {
            if (entity !== this && entity.isSolid && entity.BB) {
                if (this.BB.collide(entity.BB)) {
                    if (this.lastBB.bottom <= entity.BB.top) {
                        // Lily hit object from above
                        this.y = entity.BB.top - this.BB.height - this.offsetY;
                    }
                    else if (this.lastBB.top >= entity.BB.bottom) {
                        // Lily hit object from below
                        this.y = entity.BB.bottom - this.offsetY;
                    }
                    this.updateBB();
                }
            }
        }
    }
    get depth() {
        return this.BB.bottom;
    }


    draw(ctx) {
        // Draw the current animation
        this.currentAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        
        // // Debug rectangle
        if (this.game.debug) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }
}