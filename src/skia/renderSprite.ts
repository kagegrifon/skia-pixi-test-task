import type { Canvas, CanvasKit } from "canvaskit-wasm";
import * as PIXI from "pixi.js-legacy";
import { getSpriteImage } from "./spriteImageCache";

export type SpriteImageResolver = (
  CK: CanvasKit,
  sprite: PIXI.Sprite,
) => import("canvaskit-wasm").Image | null;

export function renderSprite(
  CK: CanvasKit,
  canvas: Canvas,
  sprite: PIXI.Sprite,
  resolveImage: SpriteImageResolver = getSpriteImage,
): void {
  const img = resolveImage(CK, sprite);
  if (!img) return;

  // worldTransform уже включает sprite.scale, поэтому рисуем по натуральным
  // размерам текстуры — иначе scale применится дважды.
  const texW = img.width();
  const texH = img.height();
  const ax = -texW * sprite.anchor.x;
  const ay = -texH * sprite.anchor.y;

  const paint = new CK.Paint();
  // AntiAlias сглаживает грани повёрнутого изображения, а FilterMode.Linear —
  // внутренние пиксели при повороте/масштабе (без него видны «ступеньки»).
  paint.setAntiAlias(true);

  canvas.drawImageRectOptions(
    img,
    CK.XYWHRect(0, 0, texW, texH),
    CK.XYWHRect(ax, ay, texW, texH),
    CK.FilterMode.Linear,
    CK.MipmapMode.None,
    paint,
  );
  paint.delete();
  // img.delete() намеренно отсутствует — SkImage живёт в кэше
}
