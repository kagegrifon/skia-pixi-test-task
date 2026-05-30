import * as PIXI from "pixi.js-legacy";
import { CANVAS_SIZE } from "../constans";
export function createPixiApp(view: HTMLCanvasElement): PIXI.Application {
  return new PIXI.Application({
    view,
    width: CANVAS_SIZE.width,
    height: CANVAS_SIZE.height,
    forceCanvas: true, // ОБЯЗАТЕЛЬНО по заданию (canvas-рендер, не WebGL)
    backgroundColor: 0xf0f0f0,
    antialias: true,
  });
}
