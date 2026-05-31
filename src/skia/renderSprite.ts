import type { Canvas, CanvasKit } from "canvaskit-wasm";
import * as PIXI from "pixi.js-legacy";

export function renderSprite(
  CK: CanvasKit,
  canvas: Canvas,
  sprite: PIXI.Sprite,
) {
  const resource = sprite.texture?.baseTexture?.resource;
  if (!(resource instanceof PIXI.BaseImageResource)) return;
  const src = resource.source;

  let img: ReturnType<typeof CK.MakeImageFromCanvasImageSource> | null = null;

  if (src instanceof HTMLImageElement) {
    // HTMLImageElement нельзя передавать напрямую — рисуем через offscreen canvas
    const offscreen = document.createElement("canvas");
    offscreen.width = src.naturalWidth;
    offscreen.height = src.naturalHeight;
    offscreen.getContext("2d")!.drawImage(src, 0, 0);
    img = CK.MakeImageFromCanvasImageSource(offscreen);
  } else if (src instanceof ImageBitmap) {
    // ImageBitmap — валидный CanvasImageSource, принимается напрямую
    img = CK.MakeImageFromCanvasImageSource(src);
  }

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
  img.delete();
}
