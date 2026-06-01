import CanvasKitInit, {
  type CanvasKit,
  type Surface,
} from "canvaskit-wasm";
import * as PIXI from "pixi.js-legacy";
import { renderContainer } from "./renderScene";
import { makeBuilderStrategy } from "./pathStrategy";

let CK: CanvasKit | null = null;
let surface: Surface | null = null;

export async function initSkia(): Promise<CanvasKit> {
  if (CK) return CK;
  CK = await CanvasKitInit({
    locateFile: (file) => `/canvaskit/${file}`,
  });
  return CK;
}

export function setupSkiaSurface(canvasId: string): void {
  if (!CK) return;
  surface =
    CK.MakeWebGLCanvasSurface(canvasId) ?? CK.MakeSWCanvasSurface(canvasId);
}

export function convertPixiContainerToSkia(container: PIXI.Container): void {
  if (!CK || !surface) return;
  for (const child of container.children) {
    if (child.visible) child.updateTransform();
  }
  const canvas = surface.getCanvas();
  canvas.clear(CK.Color4f(0.94, 0.94, 0.94, 1));
  renderContainer(CK, canvas, container, makeBuilderStrategy(CK));
  surface.flush();
}
