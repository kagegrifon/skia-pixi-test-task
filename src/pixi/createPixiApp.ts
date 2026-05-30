import * as PIXI from "pixi.js-legacy";

export function createPixiApp(view: HTMLCanvasElement): PIXI.Application {
  return new PIXI.Application({
    view,
    width: 400,
    height: 300,
    forceCanvas: true, // ОБЯЗАТЕЛЬНО по заданию (canvas-рендер, не WebGL)
    backgroundColor: 0xf0f0f0,
    antialias: true,
  });
}
