import { Controls } from "./components/Controls";
import { PixiCanvas } from "./components/PixiCanvas";
import { SkiaCanvas } from "./components/SkiaCanvas";
import { switchScene } from "./pixi/DemoScene";
import { useState } from "react";
import { addRandomShape } from "./pixi/addRandomShape";
import { usePixiApp } from "./hooks/usePixiApp";

export function App() {
  const [isLoading, setIsloading] = useState(false);
  const pixiApp = usePixiApp((s) => s.pixiApp);

  return (
    <div className="app">
      <div className="canvases">
        <PixiCanvas />
        <SkiaCanvas />
      </div>
      <Controls
        onChangeScene={() =>
          switchScene(pixiApp!.stage, (isLoading) => setIsloading(isLoading))
        }
        onAddRandom={() => addRandomShape(pixiApp!.stage)}
        isLoadingScene={isLoading}
      />
      <div className="status">
        {isLoading && <div>Загружаем картинку для pixi...</div>}
        {/* статус: загрузка wasm, последнее событие */}
      </div>
    </div>
  );
}

