import type { Canvas, CanvasKit } from "canvaskit-wasm";
import * as PIXI from "pixi.js-legacy";

function imageElementToPngBytes(img: HTMLImageElement): Uint8Array {
  const offscreen = document.createElement("canvas");
  offscreen.width = img.naturalWidth;
  offscreen.height = img.naturalHeight;
  const ctx = offscreen.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const dataUrl = offscreen.toDataURL("image/png");
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function renderSprite(
  CK: CanvasKit,
  canvas: Canvas,
  sprite: PIXI.Sprite,
) {
  const resource = sprite.texture?.baseTexture?.resource;
  if (!(resource instanceof PIXI.BaseImageResource)) return;
  const src = resource.source;
  if (!(src instanceof HTMLImageElement)) return;
  const bytes = imageElementToPngBytes(src);
  const img = CK.MakeImageFromEncoded(bytes);
  if (!img) return;
  const ax = -sprite.width * sprite.anchor.x; // учёт anchor (по умолч. 0,0)
  const ay = -sprite.height * sprite.anchor.y;
  const paint = new CK.Paint();
  canvas.drawImageRect(
    img,
    CK.XYWHRect(0, 0, img.width(), img.height()),
    CK.XYWHRect(ax, ay, sprite.width, sprite.height),
    paint,
  );
  paint.delete();
  img.delete();
}
