// src/pixi/EventManager.ts
import * as PIXI from "pixi.js-legacy";
import type { SelectionManager } from "./SelectionManager";

const tmpPoint = new PIXI.Point();

function hitsChild(child: PIXI.DisplayObject, point: PIXI.Point): boolean {
  // hitArea (в локальных координатах) имеет приоритет — им помечены фигуры
  // без заливки (линии), для которых contour-тест по graphicsData невозможен.
  if (child.hitArea) {
    child.worldTransform.applyInverse(point, tmpPoint);
    return child.hitArea.contains(tmpPoint.x, tmpPoint.y);
  }
  // Graphics/Sprite умеют точную проверку по контуру: containsPoint() сам
  // переводит точку в локальные координаты через worldTransform.applyInverse
  // и тестирует против реальной геометрии (учитывая заливку и дырки).
  const obj = child as PIXI.DisplayObject & {
    containsPoint?: (p: PIXI.IPointData) => boolean;
  };
  if (obj.containsPoint) return obj.containsPoint(point);
  // Контейнеры и прочие объекты без геометрии — AABB.
  return child.getBounds().contains(point.x, point.y);
}

function hitTest(
  container: PIXI.Container,
  point: PIXI.Point,
): PIXI.DisplayObject | null {
  const children = container.children;
  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i];
    if (child instanceof PIXI.Container) {
      const hit = hitTest(child, point);
      if (hit) return hit;
    }
    if (hitsChild(child, point)) return child;
  }
  return null;
}

export class EventManager {
  private app: PIXI.Application;
  private canvas: HTMLCanvasElement;
  private selectionManager: SelectionManager | null;
  private onPointerDown: (e: PointerEvent) => void;
  private onPointerUp: (e: PointerEvent) => void;
  private onPointerMove: (e: PointerEvent) => void;

  constructor(
    app: PIXI.Application,
    canvas: HTMLCanvasElement,
    selectionManager?: SelectionManager,
  ) {
    this.app = app;
    this.canvas = canvas;
    this.selectionManager = selectionManager ?? null;

    this.onPointerDown = (e) => this.handleEvent("pointerdown", e);
    this.onPointerUp = (e) => this.handleEvent("pointerup", e);
    this.onPointerMove = (e) => this.updateCursor(e);

    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointermove", this.onPointerMove);
  }

  private updateCursor(e: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hit = hitTest(this.app.stage, new PIXI.Point(x, y));
    const cursor = (hit as PIXI.DisplayObject & { cursor?: string } | null)?.cursor;
    this.canvas.style.cursor = cursor ?? "default";
  }

  private handleEvent(type: string, e: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hit = hitTest(this.app.stage, new PIXI.Point(x, y));
    if (type === "pointerdown") {
      this.selectionManager?.select(hit);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (hit) (hit as any).emit(type, e);
  }

  destroy(): void {
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
  }
}
