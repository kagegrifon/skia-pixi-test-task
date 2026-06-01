import CanvasKitInit, {
  type Canvas,
  type CanvasKit,
  type Surface,
} from "canvaskit-wasm";
import * as PIXI from "pixi.js-legacy";
import { makePaint } from "./skiaColor";
import { renderSprite } from "./renderSprite";
import { extractGraphicsData, type ShapeData } from "./graphicsData";

const SHAPES = PIXI.SHAPES;
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
  // worldTransform обновляется Pixi во время render-loop (RAF).
  // Если вызов происходит раньше RAF — обновляем вручную.
  for (const child of container.children) {
    if (child.visible) child.updateTransform();
  }
  const canvas = surface.getCanvas();
  canvas.clear(CK.Color4f(0.94, 0.94, 0.94, 1));
  renderContainer(CK, canvas, container);
  surface.flush();
}

export function renderContainer(
  ck: CanvasKit,
  canvas: Canvas,
  container: PIXI.Container,
) {
  for (const child of container.children) {
    if (!child.visible) continue;
    canvas.save();
    applyWorldTransform(canvas, child);

    if (child instanceof PIXI.Graphics) renderGraphics(ck, canvas, child);
    else if (child instanceof PIXI.Sprite) renderSprite(ck, canvas, child);
    else if (child instanceof PIXI.Container) {
      canvas.restore();
      renderContainer(ck, canvas, child);
      continue;
    }
    canvas.restore();
  }
}

function applyWorldTransform(canvas: Canvas, obj: PIXI.DisplayObject) {
  const t = obj.worldTransform;
  canvas.concat([t.a, t.c, t.tx, t.b, t.d, t.ty, 0, 0, 1]);
}

function renderGraphics(ck: CanvasKit, canvas: Canvas, gfx: PIXI.Graphics) {
  const graphicsData = extractGraphicsData(gfx);

  for (const data of graphicsData) {
    const { shape, fillStyle, lineStyle } = data;
    const builder = new ck.PathBuilder();

    switch (shape.type) {
      case SHAPES.RECT:
        builder.addRect(
          ck.XYWHRect(shape.x, shape.y, shape.width, shape.height),
        );
        break;
      case SHAPES.CIRC:
        builder.addOval(
          ck.XYWHRect(
            shape.x - shape.radius,
            shape.y - shape.radius,
            shape.radius * 2,
            shape.radius * 2,
          ),
        );
        break;
      case SHAPES.ELIP:
        builder.addOval(
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
        builder.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) {
          builder.lineTo(pts[i], pts[i + 1]);
        }
        if (shape.closeStroke) builder.close();
        break;
      }
    }

    const path = builder.snapshot();

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
    builder.delete();
  }
}

