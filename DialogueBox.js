// DialogueBox.js
// Centralized dialogue UI for lines, sequences, and simple choice prompts.
//
// Usage examples:
//   sm.dialogueBox.openLine("Hello", null, "Lily", () => { ... });
//   sm.dialogueBox.startSequence(["Line1", "Line2"], null, "Victor", () => { ... });
//   sm.dialogueBox.openChoice("Interact?", [{label:"Yes", onSelect: fn}, {label:"No", onSelect: fn}], "Prompt");

class DialogueBox {
    constructor(game) {
        this.game = game;

        // Visible state
        this.active = false;
        this.isPopup = true;

        // Modes: "line" | "choice"
        this.mode = "line";

        // Speaker + portrait
        this.speakerName = "";
        this.portraitImg = null;
        this.portraitReady = false;

        // Typing effect state
        this.fullText = "";
        this.displayText = "";
        this.charIndex = 0;
        this.typeTimer = 0;
        this.typeSpeed = 45; // characters per second
        this.isTyping = false;

        // Sequence state
        this.sequence = null;        // array of strings
        this.sequenceIndex = 0;
        this.sequenceOnFinish = null;

        // Choice state
        this.choicePrompt = "";
        this.choices = [];           // [{label, onSelect}]
        this.choiceIndex = 0;

        // Optional onClose for single line
        this.onClose = null;

        // Input debounce
        this._prevE = false;
        this._prevEnter = false;
        this._prevLeft = false;
        this._prevRight = false;

        this.typingSoundTimer = 0;
        this.typingSoundCooldown = 0.08;
        this.voiceAudio = {
            "Lily":           new Audio("./SFX/Voices/lily.mp3"),
            "Shiannel":       new Audio("./SFX/Voices/shiannel.mp3"),
            "Victor":         new Audio("./SFX/Voices/victor.mp3"),
            "Jin":            new Audio("./SFX/Voices/jin.mp3"),
            "Ghost Shiannel": new Audio("./SFX/Voices/shiannel.mp3"),
            "Ghost Victor":   new Audio("./SFX/Voices/victor.mp3"),
            "Ghost Jin":      new Audio("./SFX/Voices/jin.mp3"),
        };

    }

    // ===== Public API =====

    // Backwards-compatible alias (older code calls dialogueBox.open(...))
    open(text, portraitPath = null, speakerName = "", onClose = null) {
        this.openLine(text, portraitPath, speakerName, onClose);
    }

    openLine(text, portraitPath = null, speakerName = "", onClose = null) {
        this.active = true;
        this.mode = "line";

        this.sequence = null;
        this.sequenceIndex = 0;
        this.sequenceOnFinish = null;

        this.onClose = (typeof onClose === "function") ? onClose : null;

        this._setSpeakerAndPortrait(portraitPath, speakerName);
        this._startTyping(String(text || ""));
    }

    startSequence(lines, portraitPath = null, speakerName = "", onFinish = null) {
        const arr = Array.isArray(lines) ? lines.filter(l => l !== null && l !== undefined) : [];
        if (arr.length === 0) return;

        this.active = true;
        this.mode = "line";

        this.sequence = arr;
        this.sequenceIndex = 0;
        this.sequenceOnFinish = (typeof onFinish === "function") ? onFinish : null;

        this.onClose = null;

        this._setSpeakerAndPortrait(portraitPath, speakerName);

        let first = this.sequence[0];
        if (typeof first === "string") {
            this._startTyping(first);
        } else {
            this.speakerName = first.speaker || "";
            this._startTyping(first.text || "");
            this._setPortraitBySpeaker(first.speaker);
        }
    }

    openChoice(promptText, choices, speakerName = "Prompt") {
        this.active = true;
        this.mode = "choice";

        this.sequence = null;
        this.sequenceIndex = 0;
        this.sequenceOnFinish = null;
        this.onClose = null;

        this._setSpeakerAndPortrait(null, speakerName);

        this.choicePrompt = String(promptText || "");
        this.choices = Array.isArray(choices) ? choices : [];
        this.choiceIndex = 0;

        // No typing for choices
        this.fullText = "";
        this.displayText = "";
        this.charIndex = 0;
        this.typeTimer = 0;
        this.isTyping = false;
    }

    skipTyping() {
        if (!this.active || !this.isTyping) return;
        this.isTyping = false;
        this.charIndex = this.fullText.length;
        this.displayText = this.fullText;
    }

    close() {
        this.active = false;
        this.mode = "line";

        this.speakerName = "";
        this.portraitImg = null;
        this.portraitReady = false;

        this.fullText = "";
        this.displayText = "";
        this.charIndex = 0;
        this.typeTimer = 0;
        this.isTyping = false;

        this.sequence = null;
        this.sequenceIndex = 0;
        this.sequenceOnFinish = null;

        this.choicePrompt = "";
        this.choices = [];
        this.choiceIndex = 0;

        const cb = this.onClose;
        this.onClose = null;
        if (cb) cb();
    }

    // ===== Engine hooks =====

    update() {
        if (!this.active) {
            this._syncPrevInputs();
            return;
        }

        // Typing effect tick
        if (this.mode === "line" && this.isTyping) {
            const dt = (this.game && typeof this.game.clockTick === "number") ? this.game.clockTick : (1 / 60);
            this.typeTimer += dt;
            this.typingSoundTimer -= dt;

            const charsToAdd = Math.floor(this.typeTimer * this.typeSpeed);
            if (charsToAdd > 0) {
                this.typeTimer -= charsToAdd / this.typeSpeed;
                this.charIndex = Math.min(this.fullText.length, this.charIndex + charsToAdd);
                this.displayText = this.fullText.slice(0, this.charIndex);

                if (this.charIndex >= this.fullText.length) {
                    this.isTyping = false;
                }

                // plays bleep bloops for each character
                // but not for narration (which are in [brackets])
                if (this.typingSoundTimer <= 0) {
                    const isNarration = this.fullText.trim().startsWith("[");

                    if (!isNarration) {
                        const audio = this.voiceAudio[this.speakerName];
                        if (audio) {
                            audio.volume = typeof this.game.sfxVolume === "number" ? this.game.sfxVolume : 0.4;
                            audio.muted = !!this.game.muted;
                            audio.currentTime = 0;
                            audio.play().catch(() => {});
                        }
                    }

                    this.typingSoundTimer = this.typingSoundCooldown;
                }
            }
        }

        // Input handling
        const eDown = !!this.game.E;
        const enterDown = !!this.game.enter;
        const leftDown = !!this.game.left;
        const rightDown = !!this.game.right;

        const ePressed = eDown && !this._prevE;
        const enterPressed = enterDown && !this._prevEnter;
        const leftPressed = leftDown && !this._prevLeft;
        const rightPressed = rightDown && !this._prevRight;

        if (this.mode === "line") {
            if (ePressed) {
                if (this.isTyping) {
                    this.skipTyping();
                } else {
                    this._advanceLine();
                }
                // consume so it doesn't double-trigger other systems in same frame
                this.game.E = false;
            }
        } else if (this.mode === "choice") {
            if (leftPressed) {
                this.choiceIndex = Math.max(0, this.choiceIndex - 1);
            }
            if (rightPressed) {
                this.choiceIndex = Math.min(Math.max(0, this.choices.length - 1), this.choiceIndex + 1);
            }

            // Confirm with Enter or E
            if (enterPressed || ePressed) {
                const picked = this.choices[this.choiceIndex];
                const fn = picked && typeof picked.onSelect === "function" ? picked.onSelect : null;
                // Close first to avoid input conflicts
                this.close();
                if (fn) fn();

                // Consume
                this.game.enter = false;
                this.game.E = false;
            }
        }

        this._syncPrevInputs();
    }

        _setPortraitBySpeaker(speaker) {
            const map = {
                "Lily":         "./Sprites/UI/LilyPortrait.png",
                "Shiannel":     "./Sprites/UI/ShiannelPortrait.png",
                "Victor":       "./Sprites/UI/VictorPortrait.png",
                "Jin":          "./Sprites/UI/JinPortrait.png",
                "Ghost Shiannel": "./Sprites/UI/ShiannelGhostPortrait.png",
                "Ghost Victor":   "./Sprites/UI/VictorGhostPortrait.png",
                "Ghost Jin":      "./Sprites/UI/JinGhostPortrait.png",
            };

        const path = map[speaker];
        if (path) {
            const img = ASSET_MANAGER.getAsset(path);
            if (img) {
                this.portraitImg = img;
                this.portraitReady = true;
            } else {
                this.portraitImg = null;
                this.portraitReady = false;
            }
        } else {
            this.portraitImg = null;
            this.portraitReady = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        const boxX = 120;
        const boxY = 560;
        const boxW = 1140;
        const boxH = 200;

        // Portrait layout
        const portraitSize = 120;
        const portraitPad = 20;
        const portraitX = boxX + portraitPad;
        const portraitY = boxY + Math.floor((boxH - portraitSize) / 2);

        // Text layout
        const textX = portraitX + portraitSize + 30;
        const nameY = boxY + 42;
        const textY = boxY + 72;
        const textMaxW = boxX + boxW - textX - 40;

        // Box
        ctx.fillStyle = "rgba(0, 0, 0, 0.80)";
        ctx.fillRect(boxX, boxY, boxW, boxH);

        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Portrait frame
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(portraitX, portraitY, portraitSize, portraitSize);

        if (this.portraitImg && this.portraitReady) {
            ctx.drawImage(this.portraitImg, portraitX, portraitY, portraitSize, portraitSize);
        }

        // Speaker name
        if (this.speakerName) {
            ctx.fillStyle = "white";
            ctx.font = "18px Arial";
            ctx.fillText(this.speakerName, textX, nameY);
        }

        // Content
        ctx.fillStyle = "white";
        ctx.font = "22px Arial";

        if (this.mode === "choice") {
            wrapText(ctx, this.choicePrompt, textX, textY, textMaxW, 28);

            // Simple left/right choice UI
            const baseY = boxY + boxH - 40;
            ctx.font = "18px Arial";
            const labels = this.choices.map(c => String(c.label || ""));
            const leftLabel = labels[0] || "";
            const rightLabel = labels[1] || "";

            // highlight selected by adding brackets
            const leftText = (this.choiceIndex === 0 ? "[ " + leftLabel + " ]" : leftLabel);
            const rightText = (this.choiceIndex === 1 ? "[ " + rightLabel + " ]" : rightLabel);

            ctx.textAlign = "left";
            ctx.fillText(leftText, textX, baseY);

            ctx.textAlign = "left";
            ctx.fillText(rightText, textX + 220, baseY);

            ctx.textAlign = "right";
            ctx.font = "16px Arial";
            ctx.fillText("A/D to choose, E to confirm", boxX + boxW - 30, boxY + boxH - 15);
            ctx.textAlign = "left";
        } else {
            wrapText(ctx, this.displayText, textX, textY, textMaxW, 28);

            // Hint bottom-right
            ctx.font = "16px Arial";
            const hint = this.isTyping ? "Press E to skip" : "Press E to continue";
            ctx.textAlign = "right";
            ctx.fillText(hint, boxX + boxW - 30, boxY + boxH - 15);
            ctx.textAlign = "left";
        }
    }

    // ===== Internals =====

    _setSpeakerAndPortrait(portraitPath, speakerName) {
        this.speakerName = speakerName || "";
        this.portraitImg = null;
        this.portraitReady = false;

        if (portraitPath) {
            const img = new Image();
            img.onload = () => { this.portraitReady = true; };
            img.src = portraitPath;
            this.portraitImg = img;
        }
    }

    _startTyping(text) {
        this.fullText = String(text || "");
        this.displayText = "";
        this.charIndex = 0;
        this.typeTimer = 0;
        this.isTyping = true;
    }

    _advanceLine() {
    // If this is a sequence, go to next line
    if (Array.isArray(this.sequence) && this.sequence.length > 0) {
        this.sequenceIndex++;

        if (this.sequenceIndex >= this.sequence.length) {
            const done = this.sequenceOnFinish;
            this.sequence = null;
            this.sequenceIndex = 0;
            this.sequenceOnFinish = null;
            this.close();
            if (done) done();
            return;
        }

        let current = this.sequence[this.sequenceIndex];


        if (typeof current === "string") {
            this._startTyping(current);
        } else {
            this.speakerName = current.speaker || "";
            this._startTyping(current.text || "");
            this._setPortraitBySpeaker(current.speaker);
        }

        return;
    }
    // Single line: close and fire onClose
    this.close();
}
    _syncPrevInputs() {
        this._prevE = !!this.game.E;
        this._prevEnter = !!this.game.enter;
        this._prevLeft = !!this.game.left;
        this._prevRight = !!this.game.right;
    }
}

// "E to Talk" prompt entity (moved out of sceneManager.js for cleanliness)
class TalkPrompt {
    constructor(game, x, y, text) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.text = text || "E to Talk";
        this.removeFromWorld = false;
        this.isPopup = true;
    }

    update() {}

    draw(ctx) {
        ctx.save();
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// Simple text wrapping helper for canvas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text || "").split(" ");
    let line = "";

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}
