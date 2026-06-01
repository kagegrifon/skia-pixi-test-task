import { useEffect, type RefObject } from "react";
import * as PIXI from "pixi.js-legacy";
import { EventManager } from "../pixi/EventManager";

export function useEventManager(
  app: PIXI.Application | null,
  canvasRef: RefObject<HTMLCanvasElement | null>,
): void {
  useEffect(() => {
    if (!app || !canvasRef.current) return;
    const manager = new EventManager(app, canvasRef.current);
    return () => manager.destroy();
  }, [app, canvasRef]);
}
