import { useEffect, useRef, useState } from "react";
import { CANVAS_SIZE } from "../constants";
import {
  initSkia,
  setupSkiaSurface,
  convertPixiContainerToSkia,
} from "../skia/SkiaRenderer";
import { usePixiApp } from "../hooks/usePixiApp";
import { useEventManager } from "../hooks/useEventManager";

const SKIA_CANVAS_ID = "skia-canvas";

export function SkiaCanvas() {
  const [skiaReady, setSkiaReady] = useState(false);
  const pixiApp = usePixiApp((s) => s.pixiApp);
  const sceneVersion = usePixiApp((s) => s.sceneVersion);
  const selectionVersion = usePixiApp((s) => s.selectionVersion);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEventManager(canvasRef);

  useEffect(() => {
    let cancelled = false;
    initSkia().then(() => {
      if (cancelled) return;
      setupSkiaSurface(SKIA_CANVAS_ID);
      setSkiaReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!skiaReady || !pixiApp) return;
    pixiApp.renderer.render(pixiApp.stage);
    convertPixiContainerToSkia(pixiApp.stage);
  }, [skiaReady, pixiApp, sceneVersion, selectionVersion]);

  return (
    <>
      {!skiaReady && <div style={{ position: "absolute" }}>Загрузка Skia…</div>}
      <canvas
        id={SKIA_CANVAS_ID}
        ref={canvasRef}
        width={CANVAS_SIZE.width}
        height={CANVAS_SIZE.height}
        style={{ border: "1px solid gray" }}
      />
    </>
  );
}

