import * as PIXI from "pixi.js-legacy";
import type { SceneDef } from "../../type";
import { makeInteractive } from "../makeInteractive";
import { ASSET_PATH } from "./assets";

export const scene4: SceneDef = {
  assets: [ASSET_PATH.dog1],
  build: (textures) => {
    const main = new PIXI.Container();

    const speed = new PIXI.Container();
    const lines = new PIXI.Graphics();
    lines.lineStyle(5, 0xfff066, 0.9);
    for (let i = 0; i < 4; i++) {
      const y = i * 22;
      lines.moveTo(0, y).lineTo(70, y);
    }
    makeInteractive(lines, "speedLines");
    speed.addChild(lines);
    speed.position.set(30, 110);
    speed.scale.set(1.4, 1);

    const cape = new PIXI.Graphics();
    cape
      .beginFill(0xd33b3b)
      .drawPolygon([0, 0, 60, 10, 75, 120, 35, 160, 5, 110, 0, 0])
      .endFill();
    cape.pivot.set(0, 0);
    cape.position.set(250, 110);
    cape.angle = 12;
    makeInteractive(cape, "cape");

    const dog = new PIXI.Sprite(textures[ASSET_PATH.dog1]);
    dog.scale.set(0.28);
    dog.pivot.set(dog.texture.width / 2, dog.texture.height / 2);
    dog.position.set(250, 165);
    dog.angle = 8;
    makeInteractive(dog, "dog");

    main.addChild(speed, cape, dog);
    return main;
  },
};

