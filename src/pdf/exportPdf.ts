import type { Canvas } from "canvaskit-wasm";
import type { CanvasKitPDF } from "./canvaskit-pdf";
import * as PIXI from "pixi.js-legacy";
import { makePaint } from "../skia/skiaColor";
import { renderSprite } from "../skia/renderSprite";
import { CANVAS_SIZE } from "../constants";

const SHAPES = PIXI.SHAPES;

let CKPdf: CanvasKitPDF | null = null;

// canvaskit-pdf.js — Emscripten UMD скрипт, не является ES-модулем.
// Загружаем через script-тег, после чего он регистрирует себя на window.CanvasKitInit.
async function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function initSkiaPdf(): Promise<CanvasKitPDF> {
  if (CKPdf) return CKPdf;
  await loadScript("/canvaskit/canvaskit-pdf.js");
  const init = (
    window as unknown as {
      CanvasKitInit: (opts: {
        locateFile: (f: string) => string;
      }) => Promise<CanvasKitPDF>;
    }
  ).CanvasKitInit;
  CKPdf = await init({ locateFile: () => `/canvaskit/canvaskit-pdf.wasm` });
  return CKPdf;
}

function downloadBytes(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface ShapeData {
  shape: {
    type: number;
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
    points: number[];
    closeStroke: boolean;
  };
  fillStyle: { visible: boolean; color: number; alpha: number } | null;
  lineStyle: {
    visible: boolean;
    color: number;
    alpha: number;
    width: number;
  } | null;
}

// PDF-вариант renderGraphics: использует Path вместо PathBuilder,
// т.к. canvaskit-pdf не включает PathBuilder.
function renderGraphicsPdf(
  ck: CanvasKitPDF,
  canvas: Canvas,
  gfx: PIXI.Graphics,
) {
  const graphicsData = (
    gfx.geometry as unknown as { graphicsData: ShapeData[] }
  ).graphicsData;

  for (const data of graphicsData) {
    const { shape, fillStyle, lineStyle } = data;
    const path = new ck.Path();

    switch (shape.type) {
      case SHAPES.RECT:
        path.addRect(ck.XYWHRect(shape.x, shape.y, shape.width, shape.height));
        break;
      case SHAPES.CIRC:
        path.addOval(
          ck.XYWHRect(
            shape.x - shape.radius,
            shape.y - shape.radius,
            shape.radius * 2,
            shape.radius * 2,
          ),
        );
        break;
      case SHAPES.ELIP:
        path.addOval(
          ck.XYWHRect(
            shape.x - shape.width,
            shape.y - shape.height,
            shape.width * 2,
            shape.height * 2,
          ),
        );
        break;
      case SHAPES.POLY: {
        const pts = shape.points;
        path.addPoly(pts, shape.closeStroke);
        break;
      }
    }

    if (fillStyle?.visible) {
      const paint = makePaint(
        ck,
        fillStyle.color,
        fillStyle.alpha,
        ck.PaintStyle.Fill,
      );
      canvas.drawPath(path, paint);
      paint.delete();
    }
    if (lineStyle?.visible && lineStyle.width > 0) {
      const paint = makePaint(
        ck,
        lineStyle.color,
        lineStyle.alpha,
        ck.PaintStyle.Stroke,
      );
      paint.setStrokeWidth(lineStyle.width);
      canvas.drawPath(path, paint);
      paint.delete();
    }

    path.delete();
  }
}

function renderContainerPdf(
  ck: CanvasKitPDF,
  canvas: Canvas,
  container: PIXI.Container,
) {
  for (const child of container.children) {
    if (!child.visible) continue;
    canvas.save();
    const t = child.worldTransform;
    canvas.concat([t.a, t.c, t.tx, t.b, t.d, t.ty, 0, 0, 1]);

    if (child instanceof PIXI.Graphics) renderGraphicsPdf(ck, canvas, child);
    else if (child instanceof PIXI.Sprite) renderSprite(ck, canvas, child);
    else if (child instanceof PIXI.Container) {
      canvas.restore();
      renderContainerPdf(ck, canvas, child);
      continue;
    }
    canvas.restore();
  }
}

export async function exportScenePdf(pixiApp: PIXI.Application): Promise<void> {
  const { width, height } = CANVAS_SIZE;
  const CK = await initSkiaPdf();

  // Финализируем graphicsData в Pixi (как в SkiaCanvas.tsx перед convertPixiContainerToSkia)
  pixiApp.renderer.render(pixiApp.stage);

  // Обновляем worldTransform для детей (как в convertPixiContainerToSkia)
  for (const child of pixiApp.stage.children) {
    if (child.visible) child.updateTransform();
  }

  const doc = CK.MakePDFDocument({ title: "Scene Export", _rootTag: null });
  const canvas = doc.beginPage(width, height);
  canvas.clear(CK.Color4f(1, 1, 1, 1));
  renderContainerPdf(CK, canvas, pixiApp.stage);
  doc.endPage();
  const bytes = doc.close();
  doc.delete();

  downloadBytes(bytes, "scene.pdf");
}

