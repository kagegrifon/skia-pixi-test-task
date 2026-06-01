import * as PIXI from "pixi.js-legacy";
import { useEventStatus } from "../hooks/useEventStatus";

export function makeInteractive(obj: PIXI.DisplayObject, name: string): void {
  obj.eventMode = "static";
  obj.cursor = "pointer";
  obj.on("pointerdown", () =>
    useEventStatus.getState().setStatus(`${name} pointerdown`),
  );
  obj.on("pointerup", () =>
    useEventStatus.getState().setStatus(`${name} pointerup`),
  );
}
