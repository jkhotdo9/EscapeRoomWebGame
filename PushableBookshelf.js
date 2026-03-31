class PushableBookshelf {
    constructor(game, x, y) {
        this.game = game;

        this.x = x;
        this.y = y;
        this.width = 220;
        this.height = 240;

        this.nudgeDistance = 80;
        this.slideSpeed = 120;
        this.maxNudges = 3;
        this.nudgeCount = 0;

        // Target x position the shelf is currently sliding toward
        // null means shelf is at rest
        this.targetX = null;

        this.isSliding = false;
        this.isBlocked = false; // true when fully pushed

        this.killerSpawned = false;
        this.killerSpawnDelay = 2.1;
        this.killerSpawnTimer = 0;

        this.isSolid = true;
        this.removeFromWorld = false;

        this.sprite = ASSET_MANAGER.getAsset("./Sprites/FillerFurniture/BackOfBookshelf.png");

        this.bbOffset = { x: 0, y: 60, w: 0, h: 40 };
        this.updateBB();
    }

    updateBB() {
        this.BB = new BoundingBox(
            this.x + this.bbOffset.x,
            this.y + this.bbOffset.y,
            this.width - this.bbOffset.w,
            this.height - this.bbOffset.h
        );
    }

    get depth() {
        return this.BB.bottom;
    }

    isLilyOnRightSide() {
        const lily = this.game.sceneManager.lily;
        if (!lily || !lily.BB) return false;

        const lilyCX = lily.BB.x + lily.BB.width / 2;
        const lilyCY = lily.BB.y + lily.BB.height / 2;

        const triggerLeft = this.x + this.width;
        const triggerRight = this.x + this.width + 80;
        const triggerTop = this.y;
        const triggerBot = this.y + this.height;

        return (
            lilyCX >= triggerLeft && lilyCX <= triggerRight &&
            lilyCY >= triggerTop && lilyCY <= triggerBot
        );
    }

    update() {

        // ===== Sliding Logic =====
        if (this.isSliding && this.targetX !== null) {
            const step = this.slideSpeed * this.game.clockTick;
            const dist = this.targetX - this.x;

            if (Math.abs(dist) <= step) {
                // Snap to final position
                this.x = this.targetX;
                this.targetX = null;
                this.isSliding = false;

                // If this was the final push
                if (this.nudgeCount >= this.maxNudges) {
                    this.isBlocked = true;

                    const sm = this.game.sceneManager;

                    if (sm && sm.puzzleStates && sm.puzzleStates.room5) {

                        // Mark bookshelf as closed
                        sm.puzzleStates.room5.bookshelfClosed = true;

                        // Trigger one-time dialogue safely
                        if (!sm.puzzleStates.room5.room5DialoguePlayed) {

                            sm.puzzleStates.room5.room5DialoguePlayed = true;

                            // Lock movement during dialogue
                            sm.game.examining = true;

                            sm.dialogueBox.startSequence(
                                [
                                    { speaker: "Lily", text: "Oh my gosh... I escaped him. He was so close." },
                                    { speaker: "Lily", text: "!!!" },
                                    { speaker: "Lily", text: "Guys! Oh, thank goodness—you were all able to make it out!" }
                                ],
                                null,
                                null,
                                () => {

                                    const sm = this.game.sceneManager;


                                    if (sm.roomBGM) {
                                        sm.roomBGM.pause();
                                        sm.roomBGM.currentTime = 0;
                                    }


                                    sm.roomBGM = new Audio("./bgm/House of Souls Room5.mp3");
                                    sm.roomBGM.loop = true;
                                    sm.roomBGM.volume = sm.game.musicVolume ?? 0.65;
                                    sm.roomBGM.muted = !!sm.game.muted;
                                    sm.roomBGM.play().catch(() => { });

                                    sm.roomBGMName = "room5";

                                    sm.game.examining = false;
                                }
                            );
                        }
                    }
                }

            } else {
                // Continue sliding left
                this.x -= step;
            }

            this.updateBB();
            return; // Prevent input during sliding
        }

        // ===== Killer Spawn Timer =====
        if (!this.killerSpawned) {

            const sm = this.game.sceneManager;

            // Block spawn during intro dialogue
            if (!sm.room5IntroFinished || sm.dialogueBox.active) {
                return;
            }

            this.killerSpawnTimer += this.game.clockTick;

            if (this.killerSpawnTimer >= this.killerSpawnDelay) {
                this.spawnKiller();
            }
        }

        // ===== Interaction: Push Shelf =====
        if (
            !this.isBlocked &&
            !this.isSliding &&
            this.isLilyOnRightSide() &&
            this.game.E &&
            !this.game.examining
        ) {
            this.nudge();
            this.game.E = false; // consume key press
        }
    }

    nudge() {
        if (this.nudgeCount >= this.maxNudges) return;

        SOUND_MANAGER.play("./SFX/Room5/BookshelfSliding.mp3", this.game);    
        this.nudgeCount++;
        this.targetX = this.x - this.nudgeDistance;
        this.isSliding = true;
    }

    spawnKiller() {
        this.killerSpawned = true;
        const killer = new Killer(this.game, 200, 650, this.game.sceneManager.lily);
        killer.isRoom5Killer = true;
        this.game.addEntity(killer);
    }

    draw(ctx) {

        if (this.game.debug) {
                    ctx.strokeStyle = "red";
                    ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
                }

        if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        }

        // Display push prompt
        if (this.isLilyOnRightSide() && !this.isBlocked && !this.isSliding && !this.game.examining) {
            const text = this.nudgeCount === 0
                ? "Press E to push"
                : `Press E to push (${this.nudgeCount}/${this.maxNudges})`;

            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.font = "16px Arial";

            const textX = this.x + this.width / 2 - ctx.measureText(text).width / 2;
            const textY = this.y - 10;

            ctx.strokeText(text, textX, textY);
            ctx.fillText(text, textX, textY);
        }
    }
}