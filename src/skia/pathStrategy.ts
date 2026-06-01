import type { CanvasKit } from "canvaskit-wasm";
import type { CanvasKitPDF } from "../pdf/canvaskit-pdf";

export interface SkiaPath {
  addRect(rect: Float32Array): void;
  addOval(rect: Float32Array): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  close(): void;
  finish(): SkiaPathSnapshot;
}

export interface SkiaPathSnapshot {
  path: unknown;
  dispose(): void;
}

export interface PathStrategy {
  begin(): SkiaPath;
}

export function makeBuilderStrategy(ck: CanvasKit): PathStrategy {
  return {
    begin() {
      const builder = new ck.PathBuilder();
      const skiaPath: SkiaPath = {
        addRect: (rect) => builder.addRect(rect),
        addOval: (rect) => builder.addOval(rect),
        moveTo: (x, y) => builder.moveTo(x, y),
        lineTo: (x, y) => builder.lineTo(x, y),
        close: () => builder.close(),
        finish() {
          const path = builder.snapshot();
          return {
            path,
            dispose() {
              path.delete();
              builder.delete();
            },
          };
        },
      };
      return skiaPath;
    },
  };
}

export function makePathStrategy(ck: CanvasKitPDF): PathStrategy {
  return {
    begin() {
      const path = new ck.Path();
      const skiaPath: SkiaPath = {
        addRect: (rect) => path.addRect(rect),
        addOval: (rect) => path.addOval(rect),
        moveTo: (x, y) => path.moveTo(x, y),
        lineTo: (x, y) => path.lineTo(x, y),
        close: () => path.close(),
        finish() {
          return {
            path,
            dispose() {
              path.delete();
            },
          };
        },
      };
      return skiaPath;
    },
  };
}
