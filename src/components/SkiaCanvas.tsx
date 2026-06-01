import { useEffect, useRef, useState } from "react";
import { CANVAS_SIZE } from "../constants";
import { SkiaRenderer } from "../skia/SkiaRenderer";
import { usePixiApp } from "../hooks/usePixiApp";
import { useEventManager } from "../hooks/useEventManager";

const SKIA_CANVAS_ID = "skia-canvas";

export function SkiaCanvas() {
  const [skiaReady, setSkiaReady] = useState(false);
  const [skiaError, setSkiaError] = useState<string | null>(null);
  const pixiApp = usePixiApp((s) => s.pixiApp);
  const contentLayer = usePixiApp((s) => s.contentLayer);
  const overlayLayer = usePixiApp((s) => s.overlayLayer);
  const sceneVersion = usePixiApp((s) => s.sceneVersion);
  const selectionVersion = usePixiApp((s) => s.selectionVersion);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SkiaRenderer | null>(null);

  useEventManager(canvasRef);

  useEffect(() => {
    let r: SkiaRenderer | null = null;
    SkiaRenderer.create(SKIA_CANVAS_ID)
      .then((inst) => {
        r = inst;
        rendererRef.current = inst;
        setSkiaReady(true);
      })
      .catch((err: unknown) => {
        setSkiaError(String(err));
      });
    return () => {
      r?.destroy();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!skiaReady || !pixiApp || !contentLayer || !overlayLayer) return;
    pixiApp.renderer.render(pixiApp.stage);
    rendererRef.current?.render(contentLayer, overlayLayer);
  }, [skiaReady, pixiApp, contentLayer, overlayLayer, sceneVersion, selectionVersion]);

  if (skiaError) {
    return (
      <div style={{ width: CANVAS_SIZE.width, height: CANVAS_SIZE.height, border: "1px solid red", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Ошибка Skia: {skiaError}
      </div>
    );
  }

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
