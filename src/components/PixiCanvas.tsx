import { useEffect, useRef } from "react";
import { usePixiApp } from "../hooks/usePixiApp";
import { useEventManager } from "../hooks/useEventManager";
import { CANVAS_SIZE } from "../constants";

export function PixiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { initApp, destroyApp, switchScene } = usePixiApp();
  const isLoadingAssets = usePixiApp((s) => s.isLoadingAssets);
  useEventManager(canvasRef);

  useEffect(() => {
    if (canvasRef.current) {
      initApp(canvasRef.current);
      switchScene();
    }
    return () => {
      destroyApp();
    };
  }, [destroyApp, initApp, switchScene]);

  return (
    <div className="canvas-stage">
      <canvas
        width={CANVAS_SIZE.width}
        height={CANVAS_SIZE.height}
        ref={canvasRef}
        className="engine-canvas"
      />
      {isLoadingAssets && <div className="canvas-overlay">Загрузка сцены…</div>}
    </div>
  );
}
