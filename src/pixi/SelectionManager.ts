import * as PIXI from "pixi.js-legacy";

const SELECTION_COLOR = 0xffffff;
const SELECTION_ALPHA = 0.6;
const SELECTION_LINE_WIDTH = 2;

export class SelectionManager {
  private _app: PIXI.Application;
  private _overlay: PIXI.Graphics;

  constructor(app: PIXI.Application) {
    this._app = app;
    this._overlay = new PIXI.Graphics();
    app.stage.addChild(this._overlay);
  }

  select(obj: PIXI.DisplayObject | null): void {
    this._overlay.clear();
    this._ensureOnStage();
    if (!obj) return;

    const lb = obj.getLocalBounds(new PIXI.Rectangle());
    const wt = obj.worldTransform;

    const corners = [
      { x: lb.x, y: lb.y },
      { x: lb.x + lb.width, y: lb.y },
      { x: lb.x + lb.width, y: lb.y + lb.height },
      { x: lb.x, y: lb.y + lb.height },
    ];

    const pts = corners.map((c) => {
      const p = new PIXI.Point(c.x, c.y);
      wt.apply(p, p);
      return p;
    });

    this._overlay.lineStyle(SELECTION_LINE_WIDTH, SELECTION_COLOR, SELECTION_ALPHA);
    this._overlay.drawPolygon(pts.flatMap((p) => [p.x, p.y]));
  }

  private _ensureOnStage(): void {
    const stage = this._app.stage;
    if (!stage.children.includes(this._overlay)) {
      stage.addChild(this._overlay);
    } else {
      stage.setChildIndex(this._overlay, stage.children.length - 1);
    }
  }

  destroy(): void {
    this._overlay.destroy();
  }
}
