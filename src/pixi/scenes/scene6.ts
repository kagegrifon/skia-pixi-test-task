import * as PIXI from "pixi.js-legacy";
import type { SceneDef } from "../../type";
import { makeInteractive } from "../makeInteractive";
import { ASSET_PATH } from "./assets";

export const scene6: SceneDef = {
  assets: [ASSET_PATH.dog3],
  build: (textures) => {
    const main = new PIXI.Container();

    const couple = new PIXI.Sprite(textures[ASSET_PATH.dog3]);
    couple.scale.set(0.55);
    couple.pivot.set(couple.texture.width / 2, couple.texture.height / 2);
    couple.position.set(240, 195);
    makeInteractive(couple, "couple");

    const heart = new PIXI.Container();

    const lobeLeft = new PIXI.Graphics();
    lobeLeft.beginFill(0xe8455f).drawCircle(-16, -10, 18).endFill();
    makeInteractive(lobeLeft, "heartLobeLeft");

    const lobeRight = new PIXI.Graphics();
    lobeRight.beginFill(0xe8455f).drawCircle(16, -10, 18).endFill();
    makeInteractive(lobeRight, "heartLobeRight");

    const tip = new PIXI.Graphics();
    tip.beginFill(0xe8455f).drawPolygon([-30, 0, 30, 0, 0, 36]).endFill();
    makeInteractive(tip, "heartTip");

    heart.addChild(lobeLeft, lobeRight, tip);
    heart.position.set(240, 70);
    heart.pivot.set(0, 4); // точка поворота — центр сердца
    heart.angle = -10; // наклоняем сердце целиком

    main.addChild(couple, heart);
    return main;
  },
};

