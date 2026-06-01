import * as PIXI from "pixi.js-legacy";
import { CANVAS_SIZE, BACKGROUND } from "../constants";
import { backgroundToHex } from "../utils/color";

export function createPixiApp(view: HTMLCanvasElement): PIXI.Application {
  return new PIXI.Application({
    view,
    width: CANVAS_SIZE.width,
    height: CANVAS_SIZE.height,
    forceCanvas: true, // ОБЯЗАТЕЛЬНО по заданию (canvas-рендер, не WebGL)
    backgroundColor: backgroundToHex(BACKGROUND),
  });
}
