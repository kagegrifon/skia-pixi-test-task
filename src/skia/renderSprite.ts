import type { Canvas, CanvasKit } from "canvaskit-wasm";
import * as PIXI from "pixi.js-legacy";
import { getSpriteImage } from "./spriteImageCache";

export function renderSprite(
  CK: CanvasKit,
  canvas: Canvas,
  sprite: PIXI.Sprite,
): void {
  const img = getSpriteImage(CK, sprite);
  if (!img) return;

  // worldTransform уже включает sprite.scale, поэтому рисуем по натуральным
  // размерам текстуры — иначе scale применится дважды.
  const texW = img.width();
  const texH = img.height();
  const ax = -texW * sprite.anchor.x;
  const ay = -texH * sprite.anchor.y;

  const paint = new CK.Paint();
  canvas.drawImageRect(
    img,
    CK.XYWHRect(0, 0, texW, texH),
    CK.XYWHRect(ax, ay, texW, texH),
    paint,
  );
  paint.delete();
  // img.delete() намеренно отсутствует — SkImage живёт в кэше
}
