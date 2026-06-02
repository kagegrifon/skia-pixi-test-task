import CanvasKitInit, { type CanvasKit, type Surface } from "canvaskit-wasm";
import * as PIXI from "pixi.js-legacy";
import { renderContainer } from "./renderScene";
import { makeBuilderStrategy } from "./pathStrategy";
import { BACKGROUND, PUBLIC_PATH } from "../constants";

let ckPromise: Promise<CanvasKit> | null = null;

function loadCanvasKit(): Promise<CanvasKit> {
  return (ckPromise ??= CanvasKitInit({
    locateFile: (file) => `${PUBLIC_PATH}canvaskit/${file}`,
  }));
}

export class SkiaRenderer {
  private ck: CanvasKit;
  private surface: Surface;

  private constructor(ck: CanvasKit, surface: Surface) {
    this.ck = ck;
    this.surface = surface;
  }

  static async create(canvasId: string): Promise<SkiaRenderer> {
    const ck = await loadCanvasKit();
    const surface =
      ck.MakeWebGLCanvasSurface(canvasId) ?? ck.MakeSWCanvasSurface(canvasId);
    if (!surface) {
      throw new Error(`Skia: не удалось создать surface для #${canvasId}`);
    }
    return new SkiaRenderer(ck, surface);
  }

  render(contentLayer: PIXI.Container, overlayLayer: PIXI.Container): void {
    for (const child of contentLayer.children) {
      if (child.visible) child.updateTransform();
    }
    for (const child of overlayLayer.children) {
      if (child.visible) child.updateTransform();
    }
    const canvas = this.surface.getCanvas();
    canvas.clear(this.ck.Color4f(BACKGROUND.r, BACKGROUND.g, BACKGROUND.b, 1));
    const strategy = makeBuilderStrategy(this.ck);
    renderContainer(this.ck, canvas, contentLayer, strategy);
    renderContainer(this.ck, canvas, overlayLayer, strategy);
    this.surface.flush();
  }

  destroy(): void {
    this.surface.delete();
  }
}
