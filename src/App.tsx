import { useState } from "react";
import { Controls } from "./components/Controls";
import { PixiCanvas } from "./components/PixiCanvas";
import { SkiaCanvas } from "./components/SkiaCanvas";
import { addRandomShape } from "./pixi/addRandomShape";
import { usePixiApp } from "./hooks/usePixiApp";
import { exportScenePdf } from "./pdf/exportPdf";

export function App() {
  const { pixiApp, isLoadingAssets, switchScene, notifySceneChanged } =
    usePixiApp();
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  async function handleExportPdf() {
    if (!pixiApp) return;
    setIsExportingPdf(true);
    try {
      await exportScenePdf(pixiApp);
    } finally {
      setIsExportingPdf(false);
    }
  }

  return (
    <div className="app">
      <div className="canvases" style={{ display: "flex", gap: "16px" }}>
        <PixiCanvas />
        <SkiaCanvas />
      </div>
      <Controls
        onChangeScene={() => switchScene()}
        onAddRandom={() => {
          addRandomShape(pixiApp!.stage);
          notifySceneChanged();
        }}
        onExportPdf={handleExportPdf}
        isLoadingScene={isLoadingAssets}
        isExportingPdf={isExportingPdf}
      />
      <div className="status">
        {isLoadingAssets && <div>Загружаем картинку для pixi...</div>}
        {isExportingPdf && <div>Генерация PDF…</div>}
      </div>
    </div>
  );
}
