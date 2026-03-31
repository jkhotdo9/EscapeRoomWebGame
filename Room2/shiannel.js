class Shiannel {
    constructor(game, x, y, isSolid, pose = "idle") {
        this.game = game;
        this.x = x;
        this.y = y;
        this.scale = 0.45;
        this.isSolid = isSolid;
        this.pose = pose;
        this.removeFromWorld = false;

        const sheet = ASSET_MANAGER.getAsset("./Sprites/Room2/Shiannel_SpriteSheet.png");

        // TOP ROW = IDLE
        this.idleAnimator = new Animator(
            sheet,
            100, 39,          // start at top-left
            350, 320,      // frame size
            2, 0.5        
        );

        // BOTTOM ROW = CROUCH
        this.crouchAnimator = new Animator(
            sheet,
            95, 438,        // bottom half
            337, 269,
            2, 0.5
        );

        this.width = 416 * this.scale;
        this.height = 416 * this.scale;

        this.bbOffset = {
            x: 28,
            y: 50,
            w: 80,
            h: 30
        };
        
        
        this.updateBB();
        this.lastBB = this.BB;
    }

    update() {
        this.updateBB();
    }
    updateBB() {
        this.BB = new BoundingBox(
        this.x + this.bbOffset.x,
        this.y + this.bbOffset.y,
        this.bbOffset.w,
        this.bbOffset.h
        );
    }
    updateLastBB() {
        this.lastBB = this.BB;
    }

    get depth() {
        return this.BB.bottom;
    }


    draw(ctx) {
        let animator = (this.pose === "crouch")
            ? this.crouchAnimator
            : this.idleAnimator;

        animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

        if (this.game.debug) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }

        // Dialogue data lives with the NPC, SceneManager decides when to play it.
    static getDialogue(stage) {

    // stage 0
    if (stage === 0) {
        return {
            intro: [
                { speaker: "Shiannel", text: ". . . ." },
                { speaker: "Lily", text: "Hello? Are you okay?" }
            ],

            main: [
                { speaker: "Shiannel", text: "Another survivor! Thank g-goodness, I have been stuck in this room for so long! It’s f-freezing!" },
                { speaker: "Lily", text: "Hi, it's good to see that I'm not alone!" },
                { speaker: "Shiannel", text: "I feel the same... But, we have a problem." },
                { speaker: "Shiannel", text: "Th-the exit door has a lock and it’s frozen s-solid! I tried to break it with my h-hands but it won't budge!" },
                { speaker: "Lily", text: "Hm..." },
                { speaker: "Lily", text: "Well, I guess we'll need something harder to hit it with then." },
                { speaker: "Shiannel", text: "!!!" },
                { speaker: "Shiannel", text: "The k-killer! He hides a weapon here within this room." },
                { speaker: "Shiannel", text: "But he a-always makes me close my eyes before he puts it away. I havent been able to f-find it yet." },
                { speaker: "Shiannel", text: "But I can’t move as fast anymore, the cold is getting to me. It’s so… c-cold!" },
                { speaker: "Lily", text: "You just stay there, I’ll start looking." },
                { speaker: "Shiannel", text: "I’m not sure, b-but whenever he’s home, he always play’s c-classical music." },
                { speaker: "Lily", text: "Hm…" }
            ]
        };
    }

    if (stage === 1) {
        return [
            { speaker: "Shiannel", text: "Classical music must be his favorite..." }
        ];
    }

    return [
        { speaker: "Shiannel", text: "Yes! You did it! Keep going, I’ll keep watch in case he comes back!" }
    ];
}

    
}
