// src/pixi/EventManager.ts
import * as PIXI from "pixi.js-legacy";

function hitTest(
  container: PIXI.Container,
  x: number,
  y: number,
): PIXI.DisplayObject | null {
  const children = container.children;
  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i];
    if (child instanceof PIXI.Container) {
      const hit = hitTest(child, x, y);
      if (hit) return hit;
    }
    if (child.getBounds().contains(x, y)) return child;
  }
  return null;
}

export class EventManager {
  private app: PIXI.Application;
  private canvas: HTMLCanvasElement;
  private onPointerDown: (e: PointerEvent) => void;
  private onPointerUp: (e: PointerEvent) => void;

  constructor(app: PIXI.Application, canvas: HTMLCanvasElement) {
    this.app = app;
    this.canvas = canvas;

    this.onPointerDown = (e) => this.handleEvent("pointerdown", e);
    this.onPointerUp = (e) => this.handleEvent("pointerup", e);

    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointerup", this.onPointerUp);
  }

  private handleEvent(type: string, e: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hit = hitTest(this.app.stage, x, y);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (hit) (hit as any).emit(type, e);
  }

  destroy(): void {
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
  }
}
