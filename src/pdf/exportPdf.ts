import type { CanvasKitPDF } from "./canvaskit-pdf";
import * as PIXI from "pixi.js-legacy";
import { renderContainer } from "../skia/renderScene";
import { makePathStrategy } from "../skia/pathStrategy";
import { CANVAS_SIZE } from "../constants";

let CKPdf: CanvasKitPDF | null = null;

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
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportScenePdf(
  pixiApp: PIXI.Application,
  contentLayer: PIXI.Container,
): Promise<void> {
  const { width, height } = CANVAS_SIZE;
  const CK = await initSkiaPdf();

  pixiApp.renderer.render(pixiApp.stage);

  for (const child of contentLayer.children) {
    if (child.visible) child.updateTransform();
  }

  const doc = CK.MakePDFDocument({ title: "Scene Export", _rootTag: null });
  const canvas = doc.beginPage(width, height);
  canvas.clear(CK.Color4f(1, 1, 1, 1));
  renderContainer(CK, canvas, contentLayer, makePathStrategy(CK));
  doc.endPage();
  const bytes = doc.close();
  doc.delete();

  downloadBytes(bytes, "scene.pdf");
}
