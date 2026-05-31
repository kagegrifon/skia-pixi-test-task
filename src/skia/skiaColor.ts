import type { CanvasKit, Paint, PaintStyle } from "canvaskit-wasm";

export function makePaint(
  CK: CanvasKit,
  color: number,
  alpha: number,
  style: PaintStyle,
): Paint {
  const r = ((color >> 16) & 0xff) / 255;
  const g = ((color >> 8) & 0xff) / 255;
  const b = (color & 0xff) / 255;
  const paint = new CK.Paint();
  paint.setColor(CK.Color4f(r, g, b, alpha));
  paint.setStyle(style);
  paint.setAntiAlias(true);
  return paint;
}
