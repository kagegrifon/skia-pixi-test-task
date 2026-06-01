import type { Canvas, CanvasKit } from "canvaskit-wasm";
import * as PIXI from "pixi.js-legacy";
import { makePaint } from "./skiaColor";
import { renderSprite } from "./renderSprite";
import { extractGraphicsData } from "./graphicsData";
import type { PathStrategy } from "./pathStrategy";

const SHAPES = PIXI.SHAPES;

export function renderContainer(
  ck: CanvasKit,
  canvas: Canvas,
  container: PIXI.Container,
  strategy: PathStrategy,
): void {
  for (const child of container.children) {
    if (!child.visible) continue;
    canvas.save();
    applyWorldTransform(canvas, child);

    if (child instanceof PIXI.Graphics) {
      renderGraphics(ck, canvas, child, strategy);
    } else if (child instanceof PIXI.Sprite) {
      renderSprite(ck, canvas, child);
    } else if (child instanceof PIXI.Container) {
      canvas.restore();
      renderContainer(ck, canvas, child, strategy);
      continue;
    }
    canvas.restore();
  }
}

function applyWorldTransform(canvas: Canvas, obj: PIXI.DisplayObject): void {
  const t = obj.worldTransform;
  canvas.concat([t.a, t.c, t.tx, t.b, t.d, t.ty, 0, 0, 1]);
}

function renderGraphics(
  ck: CanvasKit,
  canvas: Canvas,
  gfx: PIXI.Graphics,
  strategy: PathStrategy,
): void {
  for (const data of extractGraphicsData(gfx)) {
    const { shape, fillStyle, lineStyle } = data;
    const p = strategy.begin();

    switch (shape.type) {
      case SHAPES.RECT:
        p.addRect(ck.XYWHRect(shape.x, shape.y, shape.width, shape.height));
        break;
      case SHAPES.CIRC:
        p.addOval(
          ck.XYWHRect(
            shape.x - shape.radius,
            shape.y - shape.radius,
            shape.radius * 2,
            shape.radius * 2,
          ),
        );
        break;
      case SHAPES.ELIP:
        p.addOval(
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
        p.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) {
          p.lineTo(pts[i], pts[i + 1]);
        }
        if (shape.closeStroke) p.close();
        break;
      }
    }

    const { path, dispose } = p.finish();

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

    dispose();
  }
}
