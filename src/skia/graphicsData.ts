import * as PIXI from "pixi.js-legacy";

export interface ShapeData {
  shape: {
    type: number;
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
    points: number[];
    closeStroke: boolean;
  };
  fillStyle: { visible: boolean; color: number; alpha: number } | null;
  lineStyle: {
    visible: boolean;
    color: number;
    alpha: number;
    width: number;
  } | null;
}

export function extractGraphicsData(gfx: PIXI.Graphics): ShapeData[] {
  return (gfx.geometry as unknown as { graphicsData: ShapeData[] })
    .graphicsData;
}
