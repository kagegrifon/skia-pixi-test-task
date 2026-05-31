import { useEffect, useState } from "react";
import { CANVAS_SIZE } from "../constants";
import {
  initSkia,
  setupSkiaSurface,
  convertPixiContainerToSkia,
} from "../skia/SkiaRenderer";
import { usePixiApp } from "../hooks/usePixiApp";

const SKIA_CANVAS_ID = "skia-canvas";

export function SkiaCanvas() {
  const [skiaReady, setSkiaReady] = useState(false);
  const pixiApp = usePixiApp((s) => s.pixiApp);
  const sceneVersion = usePixiApp((s) => s.sceneVersion);

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
    convertPixiContainerToSkia(pixiApp.stage);
  }, [skiaReady, pixiApp, sceneVersion]);

  return (
    <div>
      {!skiaReady && <div style={{ position: "absolute" }}>Загрузка Skia…</div>}
      <canvas
        id={SKIA_CANVAS_ID}
        width={CANVAS_SIZE.width}
        height={CANVAS_SIZE.height}
        style={{ border: "1px solid gray" }}
      />
    </div>
  );
}
