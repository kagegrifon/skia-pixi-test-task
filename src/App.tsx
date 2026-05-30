import { Controls } from "./components/Controls";
import { PixiCanvas } from "./components/PixiCanvas";
import { SkiaCanvas } from "./components/SkiaCanvas";
import * as PIXI from "pixi.js-legacy";
import { switchScene } from "./pixi/DemoScene";
import { useRef, useState } from "react";
import { addRandomShape } from "./pixi/addRandomShape";

export function App() {
  const pixiAppRef = useRef<PIXI.Application>(null);
  const [isLoading, setIsloading] = useState(false);

  return (
    <div className="app">
      <div className="canvases">
        <PixiCanvas
          onMount={(pixiApp) => {
            pixiAppRef.current = pixiApp;
          }}
        />
        <SkiaCanvas />
      </div>
      <Controls
        onChangeScene={() =>
          switchScene(pixiAppRef.current!.stage, (isLoading) =>
            setIsloading(isLoading),
          )
        }
        onAddRandom={() => addRandomShape(pixiAppRef.current!.stage)}
        isLoadingScene={isLoading}
      />
      <div className="status">
        {isLoading && <div>Загружаем картинку для pixi...</div>}
        {/* статус: загрузка wasm, последнее событие */}
      </div>
    </div>
  );
}

