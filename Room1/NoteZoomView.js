console.log("NoteZoomView loaded");

class NoteZoomView {
  constructor(game, imagePath) {
    this.game = game;
    this.removeFromWorld = false;
    this.isPopup = true;

    this.imagePath = imagePath;
    this.wasMouseDown = false;
    this.wasIPressed = true;
  }

  update() {
    // ESC
    if (this.game.keys["Escape"]) {
      this.close();
      return;
    }

    // close I
    if (this.game.I && !this.wasIPressed) {
      this.close();
      return;
    }
    this.wasIPressed = this.game.I;

    // 클릭으로 닫기
    if (this.game.mouseDown && !this.wasMouseDown) {
      this.close();
      return;
    }
    this.wasMouseDown = this.game.mouseDown;
  }

  close() {
    this.removeFromWorld = true;
    this.game.examining = false;
    this.game.I = false;
  }

  draw(ctx) {
    // background
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, 1380, 882);

    const img = ASSET_MANAGER.getAsset(this.imagePath);
    if (!img) return;

    // ratio
    const maxW = 1100;
    const maxH = 700;

    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    const scale = Math.min(maxW / iw, maxH / ih);
    const w = Math.floor(iw * scale);
    const h = Math.floor(ih * scale);

    const x = Math.floor((1380 - w) / 2);
    const y = Math.floor((882 - h) / 2);

    ctx.drawImage(img, x, y, w, h);

    // instruction
    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.fillText("Click, I, or ESC to close", x, y + h + 30);
  }
}