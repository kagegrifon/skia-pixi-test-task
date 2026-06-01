import { useEffect, type RefObject } from "react";
import * as PIXI from "pixi.js-legacy";
import { EventManager } from "../pixi/EventManager";
import { SelectionManager } from "../pixi/SelectionManager";

export function useEventManager(
  app: PIXI.Application | null,
  canvasRef: RefObject<HTMLCanvasElement | null>,
): void {
  useEffect(() => {
    if (!app || !canvasRef.current) return;
    const selectionManager = new SelectionManager(app);
    const manager = new EventManager(app, canvasRef.current, selectionManager);
    return () => {
      manager.destroy();
      selectionManager.destroy();
    };
  }, [app, canvasRef]);
}
