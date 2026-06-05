import * as PIXI from "pixi.js-legacy";
import type { SceneDef } from "../../type";
import { makeInteractive } from "../makeInteractive";
import { ASSET_PATH } from "./assets";

export const scene7: SceneDef = {
  assets: [ASSET_PATH.cat1],
  build: (textures) => {
    const main = new PIXI.Container();
    const inner = new PIXI.Container();

    const circle = new PIXI.Graphics();
    circle.beginFill(0x00cc44).drawCircle(0, 0, 60).endFill();
    circle.position.set(300, 200);
    circle.scale.set(1.2, 0.8);

    const rect = new PIXI.Graphics();
    rect.beginFill(0xff8800).drawRect(-40, -30, 80, 60).endFill();
    rect.position.set(150, 220);
    rect.angle = -25;

    const line = new PIXI.Graphics();
    line
      .lineStyle(6, 0xffffff, 1)
      .moveTo(0, 0)
      .lineTo(80, -40)
      .lineTo(160, 20)
      .lineTo(240, -10);
    line.position.set(50, 80);

    const r1 = new PIXI.Graphics();
    r1.beginFill(0xcc00cc).drawRect(0, 0, 50, 50).endFill();
    const r2 = new PIXI.Graphics();
    r2.beginFill(0x8800cc).drawRect(60, 10, 50, 50).endFill();

    inner.position.set(200, 30);
    inner.angle = 10;
    inner.addChild(r1, r2);

    const sprite = new PIXI.Sprite(textures[ASSET_PATH.cat1]);
    sprite.position.set(150, 120);
    sprite.angle = 10;
    sprite.scale.set(0.3, 0.3);

    makeInteractive(circle, "circle");
    makeInteractive(rect, "rect");
    makeInteractive(line, "line");
    makeInteractive(r1, "r1");
    makeInteractive(r2, "r2");
    makeInteractive(sprite, "sprite");

    main.addChild(line, rect, circle, inner, sprite);
    return main;
  },
};

