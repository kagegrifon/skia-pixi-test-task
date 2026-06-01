import { useEffect, type RefObject } from "react";
import { EventManager } from "../pixi/EventManager";
import { usePixiApp } from "./usePixiApp";

export function useEventManager(
  canvasRef: RefObject<HTMLCanvasElement | null>,
): void {
  const contentLayer = usePixiApp((s) => s.contentLayer);
  const selectionManager = usePixiApp((s) => s.selectionManager);

  useEffect(() => {
    if (!contentLayer || !canvasRef.current || !selectionManager) return;
    const manager = new EventManager(contentLayer, canvasRef.current, selectionManager);
    return () => {
      manager.destroy();
    };
  }, [contentLayer, canvasRef, selectionManager]);
}
