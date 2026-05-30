import { useRef } from "react";
import { usePixiApp } from "../hooks/usePixiApp";

export function PixiCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  const appRef = usePixiApp(ref);

  return (
    <canvas
      width={400}
      height={300}
      ref={ref}
      style={{ border: "1px solid gray" }}
    />
  );
}
