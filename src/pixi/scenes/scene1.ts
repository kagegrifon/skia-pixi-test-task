import * as PIXI from "pixi.js-legacy";
import type { SceneDef } from "../../type";
import { makeInteractive } from "../makeInteractive";
import { ASSET_PATH } from "./assets";

export const scene1: SceneDef = {
  assets: [ASSET_PATH.cat1],
  build: (textures) => {
    const main = new PIXI.Container();

    // Кот по центру, pivot в центр спрайта (~489×500 → scale 0.28).
    const cat = new PIXI.Sprite(textures[ASSET_PATH.cat1]);
    cat.scale.set(0.28);
    cat.pivot.set(cat.texture.width / 2, cat.texture.height / 2);
    cat.position.set(240, 175);
    makeInteractive(cat, "cat");

    // Левое крыло — полигон.
    const wingLeft = new PIXI.Graphics();
    wingLeft
      .beginFill(0xffffff, 0.9)
      .drawPolygon([0, 0, -70, -25, -90, 15, -60, 35, -75, 60, -30, 45, 0, 60])
      .endFill();
    wingLeft.position.set(175, 175);
    makeInteractive(wingLeft, "wingLeft");

    // Правое крыло = отражение левого через scale.x = -1.
    const wingRight = new PIXI.Graphics();
    wingRight
      .beginFill(0xffffff, 0.9)
      .drawPolygon([0, 0, -70, -25, -90, 15, -60, 35, -75, 60, -30, 45, 0, 60])
      .endFill();
    wingRight.position.set(305, 175);
    wingRight.scale.x = -1;
    makeInteractive(wingRight, "wingRight");

    // Вложенный Container «halo»: нимб-кольцо со своим position + angle, pivot в центр.
    const halo = new PIXI.Container();
    const ring = new PIXI.Graphics();
    ring.lineStyle(8, 0xffe14d, 1).drawEllipse(0, 0, 55, 18);
    makeInteractive(ring, "halo");
    halo.addChild(ring);
    halo.position.set(240, 70);
    halo.angle = -12;
    halo.pivot.set(0, 0);

    main.addChild(wingLeft, wingRight, cat, halo);
    return main;
  },
};

