import type { CanvasKit, Paint, PaintStyle } from "canvaskit-wasm";
import { colorToRGB } from "../utils/color";

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
