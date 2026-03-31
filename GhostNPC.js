class GhostNPC {
  constructor(game, x, y, spritePath, cfg = {}) {
    this.game = game;
    this.x = x;
    this.y = y;


    this.spritePath = spritePath;
    this.sprite = null;

    this.frames = cfg.frames ?? 2;
    this.startX = cfg.startX ?? 0;
    this.startY = cfg.startY ?? 0;
    this.frameWidth = cfg.frameWidth ?? 64;
    this.frameHeight = cfg.frameHeight ?? 64;
    this.frameDuration = cfg.frameDuration ?? 0.25;

    this.scale = cfg.scale ?? 0.4;
    this.width = this.frameWidth * this.scale;
    this.height = this.frameHeight * this.scale;
    this.anim = null;

    this.removeFromWorld = false;
    this.isPopup = false;
    this.bbOffset = {
        x: 10,
        y: 40,
        w: 40,
        h: 100
    };

    this.BB = new BoundingBox(
        this.x + this.bbOffset.x,
        this.y + this.bbOffset.y,
        this.width - this.bbOffset.w,
        this.height - this.bbOffset.h
    );

    this.isSolid = true;
  }
  get depth() {
    return this.BB.bottom;
  }

  update() {
    if (!this.sprite) {
      this.sprite = ASSET_MANAGER.getAsset(this.spritePath);
      if (this.sprite) {
        this.anim = new Animator(
          this.sprite,
          this.startX,
          this.startY,
          this.frameWidth,
          this.frameHeight,
          this.frames,
          this.frameDuration
        );
      }
    }
    if (this.BB) {
      this.BB.x = this.x + this.bbOffset.x;
      this.BB.y = this.y + this.bbOffset.y;
    }
  }

  draw(ctx) {
    if (!this.anim) return;
    this.anim.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

    if (this.game.debug) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
  }
}

window.GhostNPC = GhostNPC;