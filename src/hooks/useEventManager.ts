import { useEffect } from "react";
import * as PIXI from "pixi.js-legacy";
import { EventManager } from "../pixi/EventManager";

export function useEventManager(
  app: PIXI.Application | null,
  canvas: HTMLCanvasElement | null,
): void {
  useEffect(() => {
    if (!app || !canvas) return;
    const manager = new EventManager(app, canvas);
    return () => manager.destroy();
  }, [app, canvas]);
}
