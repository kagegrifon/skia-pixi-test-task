import * as PIXI from "pixi.js-legacy";
import type { SelectionManager } from "./SelectionManager";

const tmpPoint = new PIXI.Point();

export function hitsChild(child: PIXI.DisplayObject, point: PIXI.Point): boolean {
  if (child.hitArea) {
    child.worldTransform.applyInverse(point, tmpPoint);
    return child.hitArea.contains(tmpPoint.x, tmpPoint.y);
  }
  const obj = child as PIXI.DisplayObject & {
    containsPoint?: (p: PIXI.IPointData) => boolean;
  };
  if (obj.containsPoint) return obj.containsPoint(point);
  return child.getBounds().contains(point.x, point.y);
}

export function hitTest(
  container: PIXI.Container,
  point: PIXI.Point,
): PIXI.DisplayObject | null {
  const children = container.children;
  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i];
    if (!child.visible) continue;
    if ((child as any).eventMode === 'none') continue;
    if (child instanceof PIXI.Container) {
      const hit = hitTest(child, point);
      if (hit) return hit;
    }
    if (hitsChild(child, point)) return child;
  }
  return null;
}

export class EventManager {
  private contentLayer: PIXI.Container;
  private canvas: HTMLCanvasElement;
  private selectionManager: SelectionManager | null;
  private onPointerDown: (e: PointerEvent) => void;
  private onPointerUp: (e: PointerEvent) => void;
  private onPointerMove: (e: PointerEvent) => void;

  constructor(
    contentLayer: PIXI.Container,
    canvas: HTMLCanvasElement,
    selectionManager?: SelectionManager,
  ) {
    this.contentLayer = contentLayer;
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
    const hit = hitTest(this.contentLayer, new PIXI.Point(x, y));
    const cursor = (hit as PIXI.DisplayObject & { cursor?: string } | null)?.cursor;
    this.canvas.style.cursor = cursor ?? "default";
  }

  private handleEvent(type: string, e: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hit = hitTest(this.contentLayer, new PIXI.Point(x, y));
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
