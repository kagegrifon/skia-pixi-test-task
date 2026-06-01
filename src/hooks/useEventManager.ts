import { useEffect, type RefObject } from "react";
import * as PIXI from "pixi.js-legacy";
import { EventManager } from "../pixi/EventManager";
import { usePixiApp } from "./usePixiApp";

export function useEventManager(
  app: PIXI.Application | null,
  canvasRef: RefObject<HTMLCanvasElement | null>,
): void {
  const selectionManager = usePixiApp((s) => s.selectionManager);

  useEffect(() => {
    if (!app || !canvasRef.current || !selectionManager) return;
    const manager = new EventManager(app, canvasRef.current, selectionManager);
    return () => {
      manager.destroy();
    };
  }, [app, canvasRef, selectionManager]);
}
