import type { CanvasKit, Path } from "canvaskit-wasm";

export interface SkiaPath {
  addRect(rect: Float32Array): void;
  addOval(rect: Float32Array): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  close(): void;
  finish(): SkiaPathSnapshot;
}

export interface SkiaPathSnapshot {
  path: Path;
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

