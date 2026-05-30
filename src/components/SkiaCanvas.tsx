import { useRef } from "react";
import { CANVAS_SIZE } from "../constans";

export function SkiaCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  return (
    <canvas
      width={CANVAS_SIZE.width}
      height={CANVAS_SIZE.height}
      ref={ref}
      style={{ border: "1px solid gray" }}
    />
  );
}

