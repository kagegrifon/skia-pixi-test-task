import { useEffect, useRef } from "react";
import { usePixiApp } from "../hooks/usePixiApp";
import * as PIXI from "pixi.js-legacy";
import { CANVAS_SIZE } from "../constans";

export function PixiCanvas({
  onMount,
}: {
  onMount: (pixiApp: PIXI.Application) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const appRef = usePixiApp(ref);

  useEffect(() => {
    if (appRef.current) {
      onMount(appRef.current);
    }
  }, [appRef, onMount]);

  return (
    <canvas
      width={CANVAS_SIZE.width}
      height={CANVAS_SIZE.height}
      ref={ref}
      style={{ border: "1px solid gray" }}
    />
  );
}
