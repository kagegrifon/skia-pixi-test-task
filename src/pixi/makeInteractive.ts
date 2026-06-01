import * as PIXI from "pixi.js-legacy";
import { useEventStatus } from "../hooks/useEventStatus";

export function makeInteractive(obj: PIXI.DisplayObject, name: string): void {
  obj.eventMode = "static";
  obj.cursor = "pointer";
  // containsPoint() reads graphicsData, which excludes open moveTo/lineTo paths until render.
  // hitArea bypasses containsPoint and uses a simple rectangle check — consistent with EventManager.
  obj.hitArea = obj.getLocalBounds(new PIXI.Rectangle());
  obj.on("pointerdown", () =>
    useEventStatus.getState().setStatus(`${name} pointerdown`),
  );
  obj.on("pointerup", () =>
    useEventStatus.getState().setStatus(`${name} pointerup`),
  );
}
