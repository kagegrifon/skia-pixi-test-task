import * as PIXI from "pixi.js-legacy";
import { interactionBus } from "./interactionBus";

const SELECTION_COLOR = 0xffffff;
const SELECTION_ALPHA = 0.6;
const SELECTION_LINE_WIDTH = 2;

export class SelectionManager {
  private _overlay: PIXI.Graphics;
  private _onSelectionChange: () => void;

  constructor(overlayLayer: PIXI.Container, onSelectionChange: () => void) {
    this._onSelectionChange = onSelectionChange;
    this._overlay = new PIXI.Graphics();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this._overlay as any).eventMode = 'none';
    overlayLayer.addChild(this._overlay);
  }

  select(obj: PIXI.DisplayObject | null): void {
    this._overlay.clear();
    if (obj) {
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
    interactionBus.emit("selection", { name: obj?.name || null });
    this._onSelectionChange();
  }

  destroy(): void {
    this._overlay.destroy();
  }
}
