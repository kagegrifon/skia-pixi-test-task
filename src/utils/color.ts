/** Converts { r, g, b } (0–1) to Pixi's 0xRRGGBB number. */
export function backgroundToHex({
  r,
  g,
  b,
}: {
  r: number;
  g: number;
  b: number;
}): number {
  return (
    (Math.round(r * 255) << 16) |
    (Math.round(g * 255) << 8) |
    Math.round(b * 255)
  );
}

export function colorToRGB(color: number): { r: number; g: number; b: number } {
  return {
    r: ((color >> 16) & 0xff) / 255,
    g: ((color >> 8) & 0xff) / 255,
    b: (color & 0xff) / 255,
  };
}
