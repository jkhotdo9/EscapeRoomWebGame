class InvisibleCollider {
    constructor(game, x, y, width, height) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isSolid = true;

        this.BB = new BoundingBox(x, y, width, height);
    }

    update() {
        // nothing to update
    }

    draw(ctx) {
        // draw nothing

        if (this.game.debug) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }
}
