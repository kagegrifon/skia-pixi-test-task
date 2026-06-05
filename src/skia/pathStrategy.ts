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

// Стратегия на ck.PathBuilder для онскрин-пути (SkiaRenderer на официальной
// canvaskit-wasm, где PathBuilder есть). НЕ применять к PDF-сборке
// canvaskit-pdf.js — там PathBuilder отсутствует, см. makePathStrategy.
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

// Мутирующие методы построения пути в рантайме CanvasKit живут прямо на Path
// во всех сборках (официальной canvaskit-wasm и нашей PDF-сборке), но типы
// canvaskit-wasm объявляют их только на PathBuilder. Описываем недостающую
// часть здесь и кастуем — обход рассинхрона типов, а не подмена API.
type MutablePath = Path & {
  addRect(rect: Float32Array): void;
  addOval(rect: Float32Array): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  close(): void;
};

// Стратегия на ck.Path для PDF-пути: наша canvaskit-pdf.js НЕ содержит
// PathBuilder (он есть только в официальной canvaskit-wasm, на которой работает
// онскрин-путь через makeBuilderStrategy). ck.Path присутствует везде. Здесь
// path и есть builder: методы мутируют сам объект, finish() отдаёт snapshot.
export function makePathStrategy(ck: CanvasKit): PathStrategy {
  return {
    begin() {
      const path = new ck.Path() as MutablePath;
      const skiaPath: SkiaPath = {
        addRect: (rect) => {
          path.addRect(rect);
        },
        addOval: (rect) => {
          path.addOval(rect);
        },
        moveTo: (x, y) => {
          path.moveTo(x, y);
        },
        lineTo: (x, y) => {
          path.lineTo(x, y);
        },
        close: () => {
          path.close();
        },
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

