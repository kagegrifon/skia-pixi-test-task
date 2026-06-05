import * as PIXI from "pixi.js-legacy";
import type { SceneDef } from "../../type";
import { makeInteractive } from "../makeInteractive";
import { ASSET_PATH } from "./assets";

export const scene3: SceneDef = {
  assets: [ASSET_PATH.cat3, ASSET_PATH.cat4],
  build: (textures) => {
    const main = new PIXI.Container();

    const cooler = new PIXI.Container();

    const body = new PIXI.Graphics();
    body.beginFill(0xdfe7ee).drawRect(-22, 0, 44, 90).endFill();
    makeInteractive(body, "coolerBody");

    const bottle = new PIXI.Graphics();
    bottle.beginFill(0x6fc3e0, 0.85).drawEllipse(0, -28, 26, 38).endFill();
    makeInteractive(bottle, "coolerBottle");

    cooler.addChild(bottle, body);
    cooler.position.set(240, 150);
    cooler.angle = -4;

    const gossip = new PIXI.Graphics();
    gossip.beginFill(0xffffff, 0.95);
    gossip.drawCircle(140, 60, 18);
    gossip.drawCircle(168, 50, 24);
    gossip.drawCircle(198, 62, 16);
    gossip.endFill();
    makeInteractive(gossip, "gossip");

    // Два кота-Sprite, один отзеркален, у каждого pivot по центру.
    const catLeft = new PIXI.Sprite(textures[ASSET_PATH.cat3]);
    catLeft.scale.set(0.26);
    catLeft.pivot.set(catLeft.texture.width / 2, catLeft.texture.height / 2);
    catLeft.position.set(120, 190);
    makeInteractive(catLeft, "catLeft");

    const catRight = new PIXI.Sprite(textures[ASSET_PATH.cat4]);
    catRight.scale.set(-0.3, 0.3); // scale.x = -1 → отзеркален
    catRight.pivot.set(catRight.texture.width / 2, catRight.texture.height / 2);
    catRight.position.set(360, 190);
    makeInteractive(catRight, "catRight");

    main.addChild(cooler, gossip, catLeft, catRight);
    return main;
  },
};

