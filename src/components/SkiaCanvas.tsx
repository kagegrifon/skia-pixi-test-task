import { useRef } from "react";

export function SkiaCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  return (
    <canvas
      width={400}
      height={300}
      ref={ref}
      style={{ border: "1px solid gray" }}
    />
  );
}
