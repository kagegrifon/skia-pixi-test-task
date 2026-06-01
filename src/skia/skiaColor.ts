import type { CanvasKit, Paint, PaintStyle } from "canvaskit-wasm";

export function colorToRGB(color: number): { r: number; g: number; b: number } {
  return {
    r: ((color >> 16) & 0xff) / 255,
    g: ((color >> 8) & 0xff) / 255,
    b: (color & 0xff) / 255,
  };
}

export function makePaint(
  CK: CanvasKit,
  color: number,
  alpha: number,
  style: PaintStyle,
): Paint {
  const { r, g, b } = colorToRGB(color);
  const paint = new CK.Paint();
  paint.setColor(CK.Color4f(r, g, b, alpha));
  paint.setStyle(style);
  paint.setAntiAlias(true);
  return paint;
}
