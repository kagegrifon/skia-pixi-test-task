import * as PIXI from "pixi.js-legacy";
import { CANVAS_SIZE } from "../constants";
import { makeInteractive } from "./makeInteractive";

const counts = { circle: 0, rectangle: 0, line: 0 };

const randomColor = () => Math.floor(Math.random() * 0xffffff);

export function addRandomShape(container: PIXI.Container) {
  const g = new PIXI.Graphics();
  const color = randomColor();
  const x = 0 + Math.random() * CANVAS_SIZE.width;
  const y = 0 + Math.random() * CANVAS_SIZE.height;

  const withStroke = () => {
    if (Math.random() < 0.5) {
      g.lineStyle(1 + Math.random() * 4, randomColor());
    }
  };

  const shapeDrawFunc = {
    circle: () => {
      withStroke();
      g.beginFill(color)
        .drawCircle(0, 0, 20 + Math.random() * 40)
        .endFill();
    },
    rectangle: () => {
      withStroke();
      const w = 60 + Math.random() * 60;
      const h = 40 + Math.random() * 50;
      g.beginFill(color)
        .drawRect(-w / 2, -h / 2, w, h)
        .endFill();
    },
    line: () => {
      g.lineStyle(2 + Math.random() * 5, color)
        .moveTo(0, 0)
        .lineTo(
          Math.random() * CANVAS_SIZE.width * 2 - CANVAS_SIZE.width,
          Math.random() * CANVAS_SIZE.height * 2 - CANVAS_SIZE.height,
        );
    },
  } as const;

  const shapeDrawFuncKeys = Object.keys(shapeDrawFunc);
  const shapeIndex = Math.floor(Math.random() * shapeDrawFuncKeys.length);
  const curRandomShape = shapeDrawFuncKeys[
    shapeIndex
  ] as keyof typeof shapeDrawFunc;

  shapeDrawFunc[curRandomShape]();

  g.position.set(x, y);
  g.rotation = Math.random() * Math.PI * 2;
  g.scale.set(0.6 + Math.random() * 1.0);
  g.skew.set((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5);

  counts[curRandomShape] += 1;
  makeInteractive(g, `random-${curRandomShape}-${counts[curRandomShape]}`);

  container.addChild(g);
}

