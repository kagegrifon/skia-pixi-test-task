import { useEffect, useRef } from "react";
import { usePixiApp } from "../hooks/usePixiApp";
import { CANVAS_SIZE } from "../constans";

export function PixiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { initApp, destroyApp } = usePixiApp();

  useEffect(() => {
    if (canvasRef.current) {
      initApp(canvasRef.current);
    }
    return () => {
      destroyApp();
    };
  }, [destroyApp, initApp]);

  return (
    <canvas
      width={CANVAS_SIZE.width}
      height={CANVAS_SIZE.height}
      ref={canvasRef}
      style={{ border: "1px solid gray" }}
    />
  );
}
