import { useState, useEffect } from "react";
import { Controls } from "./components/Controls";
import { PixiCanvas } from "./components/PixiCanvas";
import { SkiaCanvas } from "./components/SkiaCanvas";
import { addRandomShape } from "./pixi/addRandomShape";
import { usePixiApp } from "./hooks/usePixiApp";
import { exportScenePdf } from "./pdf/exportPdf";
import { useEventStatus } from "./hooks/useEventStatus";
import { interactionBus, type InteractionEvent } from "./pixi/interactionBus";
import "./App.css";

export function App() {
  const { pixiApp, contentLayer, isLoadingAssets, switchScene, notifySceneChanged } =
    usePixiApp();
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const status = useEventStatus((s) => s.status);

  useEffect(() => {
    const h = (e: InteractionEvent) =>
      useEventStatus.getState().setStatus(`${e.name} ${e.type}`);
    interactionBus.on("interaction", h);
    return () => { interactionBus.off("interaction", h); };
  }, []);

  async function handleExportPdf() {
    if (!pixiApp || !contentLayer) return;
    setIsExportingPdf(true);
    try {
      await exportScenePdf(pixiApp, contentLayer);
    } finally {
      setIsExportingPdf(false);
    }
  }

  return (
    <div className="app">
      <div className="canvases">
        <PixiCanvas />
        <SkiaCanvas />
      </div>
      <Controls
        onChangeScene={() => switchScene()}
        onAddRandom={() => {
          if (contentLayer) {
            addRandomShape(contentLayer);
            notifySceneChanged();
          }
        }}
        onExportPdf={handleExportPdf}
        isLoadingScene={isLoadingAssets}
        isExportingPdf={isExportingPdf}
      />
      <div className="status">
        {isLoadingAssets && <div>Загружаем картинку для pixi...</div>}
        {isExportingPdf && <div>Генерация PDF…</div>}
        {status && <div>{status}</div>}
      </div>
    </div>
  );
}
