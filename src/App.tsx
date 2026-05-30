import { Controls } from "./components/Controls";
import { PixiCanvas } from "./components/PixiCanvas";
import { SkiaCanvas } from "./components/SkiaCanvas";

export function App() {
  return (
    <div className="app">
      <div className="canvases">
        <PixiCanvas />
        <SkiaCanvas />
      </div>
      <Controls />
      <div className="status">
        {/* статус: загрузка wasm, последнее событие */}
      </div>
    </div>
  );
}

