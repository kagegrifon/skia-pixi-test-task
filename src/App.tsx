import { useState, useEffect } from "react";
import { Controls } from "./components/Controls";
import { PixiCanvas } from "./components/PixiCanvas";
import { SkiaCanvas } from "./components/SkiaCanvas";
import { addRandomShape } from "./pixi/addRandomShape";
import { usePixiApp } from "./hooks/usePixiApp";
import { exportScenePdf } from "./pdf/exportPdf";
import { useEventStatus } from "./hooks/useEventStatus";
import {
  interactionBus,
  type InteractionEvent,
  type SelectionEvent,
} from "./pixi/interactionBus";
import "./App.css";

export function App() {
  const {
    pixiApp,
    contentLayer,
    isLoadingAssets,
    switchScene,
    notifySceneChanged,
  } = usePixiApp();
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const lastEvent = useEventStatus((s) => s.lastEvent);
  const selected = useEventStatus((s) => s.selected);

  useEffect(() => {
    const onInteraction = (e: InteractionEvent) =>
      useEventStatus.getState().setLastEvent(`${e.name} · ${e.type}`);
    const onSelection = (e: SelectionEvent) =>
      useEventStatus.getState().setSelected(e.name);
    interactionBus.on("interaction", onInteraction);
    interactionBus.on("selection", onSelection);
    return () => {
      interactionBus.off("interaction", onInteraction);
      interactionBus.off("selection", onSelection);
    };
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
      <header className="app-header">
        <div className="container">
          <h1 className="app-header__title">Pixi to Skia</h1>
          <p className="app-header__subtitle">
            Трансформация из системы pixi в skia
          </p>
        </div>
      </header>
      <main className="container">
        <div className="toolbar">
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
        </div>

        <div className="canvases">
          <div className="canvas-card">
            <div className="canvas-card-content">
              <span className="canvas-card__label canvas-card__label--pixi">
                Pixi.js
              </span>
              <PixiCanvas />
            </div>
          </div>
          <div className="canvas-card">
            <div className="canvas-card-content">
              <span className="canvas-card__label canvas-card__label--skia">
                Skia
              </span>
              <SkiaCanvas />
            </div>
          </div>
        </div>

        <div className="status">
          <div className="status-cell">
            <div className="status-cell__label">Последнее событие</div>
            <div className="status-cell__value">{lastEvent}</div>
          </div>
          <div className="status-cell">
            <div className="status-cell__label">Выделено</div>
            <div className="status-cell__value">{selected ?? ""}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
