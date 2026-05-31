import { Controls } from "./components/Controls";
import { PixiCanvas } from "./components/PixiCanvas";
import { SkiaCanvas } from "./components/SkiaCanvas";
import { addRandomShape } from "./pixi/addRandomShape";
import { usePixiApp } from "./hooks/usePixiApp";

export function App() {
  const { pixiApp, isLoadingAssets, switchScene } = usePixiApp();

  return (
    <div className="app">
      <div className="canvases">
        <PixiCanvas />
        <SkiaCanvas />
      </div>
      <Controls
        onChangeScene={() => switchScene()}
        onAddRandom={() => addRandomShape(pixiApp!.stage)}
        isLoadingScene={isLoadingAssets}
      />
      <div className="status">
        {isLoadingAssets && <div>Загружаем картинку для pixi...</div>}
        {/* статус: загрузка wasm, последнее событие */}
      </div>
    </div>
  );
}

