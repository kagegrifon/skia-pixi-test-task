import * as PIXI from "pixi.js-legacy";
import { CANVAS_SIZE } from "../constans";

export function addRandomShape(container: PIXI.Container) {
  const g = new PIXI.Graphics();
  const color = Math.floor(Math.random() * 0xffffff);
  const x = 0 + Math.random() * CANVAS_SIZE.width;
  const y = 0 + Math.random() * CANVAS_SIZE.height;

  const shapeDrawFunc = {
    circle: () => {
      g.beginFill(color)
        .drawCircle(x, y, 20 + Math.random() * 40)
        .endFill();
    },
    rectangle: () => {
      g.beginFill(color)
        .drawRect(x, y, 60 + Math.random() * 60, 40 + Math.random() * 50)
        .endFill();
    },
    line: () => {
      g.lineStyle(2 + Math.random() * 5, color)
        .moveTo(x, y)
        .lineTo(
          x + Math.random() * CANVAS_SIZE.width * 2 - CANVAS_SIZE.width,
          y + Math.random() * CANVAS_SIZE.height * 2 - CANVAS_SIZE.height,
        );
    },
  } as const;

  const shapeDrawFuncKeys = Object.keys(shapeDrawFunc);
  const shapeIndex = Math.floor(Math.random() * shapeDrawFuncKeys.length);

  const curRandomShape = shapeDrawFuncKeys[
    shapeIndex
  ] as keyof typeof shapeDrawFunc;
  shapeDrawFunc[curRandomShape]();

  container.addChild(g);
  // после добавления — перерисовать Skia canvas
}
