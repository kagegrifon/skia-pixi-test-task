import { describe, it, expect } from "vitest";
import { colorToRGB } from "../../utils/color";

describe("colorToRGB", () => {
  it("0xff0000 → {r:1, g:0, b:0}", () => {
    expect(colorToRGB(0xff0000)).toEqual({ r: 1, g: 0, b: 0 });
  });

  it("0x00ff00 → {r:0, g:1, b:0}", () => {
    expect(colorToRGB(0x00ff00)).toEqual({ r: 0, g: 1, b: 0 });
  });

  it("0x0000ff → {r:0, g:0, b:1}", () => {
    expect(colorToRGB(0x0000ff)).toEqual({ r: 0, g: 0, b: 1 });
  });

  it("0xffffff → {r:1, g:1, b:1}", () => {
    expect(colorToRGB(0xffffff)).toEqual({ r: 1, g: 1, b: 1 });
  });

  it("0x000000 → {r:0, g:0, b:0}", () => {
    expect(colorToRGB(0x000000)).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("0x808080 → нормализованные компоненты", () => {
    const { r, g, b } = colorToRGB(0x808080);
    expect(r).toBeCloseTo(128 / 255);
    expect(g).toBeCloseTo(128 / 255);
    expect(b).toBeCloseTo(128 / 255);
  });

  it("0x1a2b3c → корректная побитовая распаковка", () => {
    const { r, g, b } = colorToRGB(0x1a2b3c);
    expect(r).toBeCloseTo(0x1a / 255);
    expect(g).toBeCloseTo(0x2b / 255);
    expect(b).toBeCloseTo(0x3c / 255);
  });
});
