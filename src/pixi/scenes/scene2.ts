import * as PIXI from "pixi.js-legacy";
import type { SceneDef } from "../../type";
import { makeInteractive } from "../makeInteractive";
import { ASSET_PATH } from "./assets";

export const scene2: SceneDef = {
  assets: [ASSET_PATH.cat2],
  build: (textures) => {
    const main = new PIXI.Container();

    const egg = new PIXI.Container();

    const shell = new PIXI.Graphics();
    shell.beginFill(0xfff3d6).drawEllipse(0, 0, 90, 90).endFill();
    shell.scale.set(1, 1.25);
    shell.pivot.set(0, 0);
    makeInteractive(shell, "egg");

    const crack = new PIXI.Graphics();
    crack
      .lineStyle(4, 0x8a6d3b, 1)
      .moveTo(-90, 0)
      .lineTo(-55, -14)
      .lineTo(-20, 6)
      .lineTo(15, -16)
      .lineTo(50, 4)
      .lineTo(90, -12);
    makeInteractive(crack, "crack");

    egg.addChild(shell, crack);
    egg.position.set(240, 200);

    const kitten = new PIXI.Sprite(textures[ASSET_PATH.cat2]);
    kitten.scale.set(0.4);
    kitten.pivot.set(kitten.texture.width / 2, kitten.texture.height / 2);
    kitten.position.set(240, 130);
    kitten.angle = 8;
    makeInteractive(kitten, "kitten");

    main.addChild(egg, kitten);
    return main;
  },
};

