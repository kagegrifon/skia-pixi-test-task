import { useEffect, useRef } from "react";
import { usePixiApp } from "../hooks/usePixiApp";
import { CANVAS_SIZE } from "../constants";

export function PixiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { initApp, destroyApp, switchScene } = usePixiApp();

  useEffect(() => {
    if (canvasRef.current) {
      initApp(canvasRef.current);
      switchScene();
    }
    return () => {
      destroyApp();
    };
  }, [destroyApp, initApp, switchScene]);

  return (
    <canvas
      width={CANVAS_SIZE.width}
      height={CANVAS_SIZE.height}
      ref={canvasRef}
      style={{ border: "1px solid gray" }}
    />
  );
}
