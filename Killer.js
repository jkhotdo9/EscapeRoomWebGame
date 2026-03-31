class Killer {
    constructor(game, x, y, target) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.target = target;

        this.speed = 400; //lily speed = 500
        this.removeFromWorld = false;

        //this.width = 20;
        //this.height = 60;

        this.damageCooldown = 0;

        this.giveUpTimer = 0;
        this.giveUpDelay = 4.0;
        this.givingUp = false;
        this.isRoom5Killer = false;

        this.updateBB();
        this.lastBB = this.BB;

        this.spriteSheet = ASSET_MANAGER.getAsset("./Sprites/Room4/Killer_Spritesheet.png");

        // killer walk
        this.footstepTimer = 0;
        this.footstepCooldown = 0.4;
        this.killerWalkAudio = new Audio("./SFX/KillerWalk22.mp3");
        this.killerWalkAudio.loop = true;
        this.killerWalkAudio.volume = 0.5;

        const frameWidth = this.spriteSheet.width / 4;
        const frameHeight = this.spriteSheet.height / 4;

        this.animations = {
            walkDown: new Animator(this.spriteSheet, 10, 0, 790, 750, 4, 0.2),
            walkRight: new Animator(this.spriteSheet, 0, 750, 760, 750, 4, 0.2), //very good
            walkLeft: new Animator(this.spriteSheet, 0, 1500, 770, 750, 4, 0.2), 
            walkUp: new Animator(this.spriteSheet, -30, 2300, 760, 750, 4, 0.2)  
        };

        this.currentAnimation = this.animations.walkDown;
        this.facing = "down";
        this.scale = 0.25; // adjust if too big
    }

    updateBB() {
        this.offsetX = 40; // shifts to right
        this.offsetY = 95; // shifts down 

        //killer prick
        const bbWidth = 90; 
        const bbHeight = 30; 
        this.BB = new BoundingBox( this.x + this.offsetX, this.y + this.offsetY, bbWidth, bbHeight );
    }

    updateLastBB() {
        this.lastBB = this.BB;
    }

    update() {

        // Room 5 give-up logic
        if (this.isRoom5Killer) {
            const dist = Math.sqrt(
                Math.pow(this.target.x - this.x, 2) +
                Math.pow(this.target.y - this.y, 2)
            );

            if (dist > 300) {
                this.giveUpTimer += this.game.clockTick;
            } else {
                this.giveUpTimer = 0;
            }

            if (this.giveUpTimer >= this.giveUpDelay) {
                this.givingUp = true;
            }
        }

        if (this.givingUp) {
            this.y += 200 * this.game.clockTick;
            this.currentAnimation = this.animations.walkDown;
            this.updateBB();

            // stop killerr walk sound when giving up and walking down
            this.killerWalkAudio.pause();
            this.killerWalkAudio.currentTime = 0;

            if (this.y > 1200) {
                this.removeFromWorld = true;
            }
            return;
        }

        if (!this.target) return;

        let dx = 0;
        let dy = 0;

        const diffX = this.target.x - this.x;
        const diffY = this.target.y - this.y;

        const distance = Math.sqrt(diffX * diffX + diffY * diffY);

        if (distance > 0) {
            dx = (diffX / distance) * this.speed * this.game.clockTick;
            dy = (diffY / distance) * this.speed * this.game.clockTick;
        }

        // Determine facing direction
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                this.currentAnimation = this.animations.walkRight;
                this.facing = "right";
            } else {
                this.currentAnimation = this.animations.walkLeft;
                this.facing = "left";
            }
        } else {
            if (diffY > 0) {
                this.currentAnimation = this.animations.walkDown;
                this.facing = "down";
            } else {
                this.currentAnimation = this.animations.walkUp;
                this.facing = "up";
            }
        }

        // mutes footsteps when game is muted
        // gotta sync the mute state
        if (this.killerWalkAudio) { // checks if audio is loaded
            this.killerWalkAudio.muted = !!this.game.muted;
        }

        // FOOTSTEP SOUNDS WHEN MOVING  
        if (this.killerWalkAudio.paused) {
            this.killerWalkAudio.play().catch(() => {});
        }

        //xmovement
        this.x += dx;
        this.updateLastBB();
        this.updateBB();
        this.handleHorizontalCollisions();

        //y movement
        this.y += dy;
        this.updateLastBB();
        this.updateBB();
        this.handleVerticalCollisions();

        //damage coooldown
        if (this.damageCooldown > 0) {
            this.damageCooldown -= this.game.clockTick;
        }

        //check collision with lily
        if (this.BB.collide(this.target.BB) && this.damageCooldown <= 0) {
            this.game.sceneManager.takeDamage();
            this.damageCooldown = 1; // 1 second cooldown
        }
    }

    handleHorizontalCollisions() {
        for (let entity of this.game.entities) {
            if (entity !== this && entity.isSolid && entity.BB) {
                if (this.BB.collide(entity.BB)) {

                    if (this.lastBB.right <= entity.BB.left) {
                        this.x = entity.BB.left - this.BB.width - this.offsetX;
                    }
                    else if (this.lastBB.left >= entity.BB.right) {
                        this.x = entity.BB.right - this.offsetX;
                    }

                    this.updateBB();
                }
            }
        }
    }

    handleVerticalCollisions() {
        for (let entity of this.game.entities) {
            if (entity !== this && entity.isSolid && entity.BB) {
                if (this.BB.collide(entity.BB)) {

                    if (this.lastBB.bottom <= entity.BB.top) {
                        this.y = entity.BB.top - this.BB.height - this.offsetY;
                    }
                    else if (this.lastBB.top >= entity.BB.bottom) {
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
        this.currentAnimation.drawFrame(
            this.game.clockTick,
            ctx,
            this.x,
            this.y,
            this.scale
        );

        if (this.game.debug) {
            ctx.strokeStyle = "yellow";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }

    //red circle killer lol
    // draw(ctx) {
    //     ctx.fillStyle = "darkred";
    //     ctx.beginPath();
    //     ctx.arc(this.x + 40, this.y + 40, 30, 0, Math.PI * 2);
    //     ctx.fill();

    //     if (this.game.debug) {
    //         ctx.strokeStyle = "yellow";
    //         ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
    //     }
    // }
}