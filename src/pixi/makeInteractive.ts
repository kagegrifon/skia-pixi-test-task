import * as PIXI from "pixi.js-legacy";
import { interactionBus } from "./interactionBus";
import { StrokeHitArea } from "./StrokeHitArea";

export function makeInteractive(obj: PIXI.DisplayObject, name: string): void {
  obj.eventMode = "static";
  obj.cursor = "pointer";
  if (obj instanceof PIXI.Graphics) {
    const hasFill = obj.geometry.graphicsData.some((d) => d.fillStyle?.visible);
    if (!hasFill) {
      obj.hitArea =
        StrokeHitArea.fromGraphics(obj) ?? obj.getLocalBounds(new PIXI.Rectangle());
    }
  }
  obj.on("pointerdown", () => interactionBus.emit("interaction", { type: "pointerdown", name }));
  obj.on("pointerup", () => interactionBus.emit("interaction", { type: "pointerup", name }));
}
