class Jin {
    constructor(game, x, y, isSolid) {
        this.game = game;
        this.scale = 0.45;
        this.animator = new Animator(
            ASSET_MANAGER.getAsset("./Sprites/Room3/Alive_JinSpriteSheet.png"), 
            186, 134,      // xStart, yStart (bottom row)
            400, 340,     // width, height of each frame
            2, 0.6      // 2 frames, 0.6 seconds per frame
        );
        
        this.x = x;
        this.y = y;
        this.width = 338 * this.scale;
        this.height = 319 * this.scale;


        this.bbOffset = {//jin bb offset
            x: 0,       
            y: 60,     
            w: 50,       
            h: 100     
        };

        this.BB = new BoundingBox(
            this.x + this.bbOffset.x,
            this.y + this.bbOffset.y,
            this.width - this.bbOffset.w,
            this.height - this.bbOffset.h
        );



        this.isSolid = isSolid;
        this.removeFromWorld = false;
    }

    update() {
        // jin just stands in place breathing
        this.BB.x = this.x + this.bbOffset.x;
        this.BB.y = this.y + this.bbOffset.y;
    }
    get depth() {
        return this.BB.bottom;
    }

    draw(ctx) {
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

        if (this.game.debug) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }
    static getDialogue(stage) {

    if (stage === 0) {
        return [
            "Hello, it is good to see another survivor.",
            "Stay calm, the room is designed to confuse you.",
            "You got this, if you have any questions come to us."
        ];
    }

    if (stage === 1) {
        return [
            "The candles?",
            "Yeah, I actually I found a codex that I think has something to do with the candles.",
            "There’s a riddle on it, but I wasn't able to solve it before the killer came.",
            "Here, take it!",
            "[Jin reaches in his pocket and took out a folded note. He unravels it and slips it through the bars, the paper falling to the ground]"
        ];
    }

    if (stage === 2) {
        return [
            "You gotta get out of here soon."
        ];
    }

    return [
        "You’re doing great. Don’t stop now."
    ];
}
}