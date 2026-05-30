import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js-legacy";
import { createPixiApp } from "../pixi/createPixiApp";
import { setupDemoScene } from "../pixi/DemoScene";

export function usePixiApp(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const app = createPixiApp(canvasRef.current);
    setupDemoScene(app);
    appRef.current = app;
    return () => {
      app.destroy(true); // важно: чистим при unmount / Vite HMR
      appRef.current = null;
    };
  }, [canvasRef]);

  return appRef;
}
