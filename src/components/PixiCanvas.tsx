import { useEffect, useRef } from "react";
import { usePixiApp } from "../hooks/usePixiApp";
import * as PIXI from "pixi.js-legacy";

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
      width={400}
      height={300}
      ref={ref}
      style={{ border: "1px solid gray" }}
    />
  );
}
