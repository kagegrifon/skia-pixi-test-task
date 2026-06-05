import * as PIXI from "pixi.js-legacy";
import type { SceneDef } from "../../type";
import { makeInteractive } from "../makeInteractive";
import { ASSET_PATH } from "./assets";

export const scene5: SceneDef = {
  assets: [ASSET_PATH.dog2, ASSET_PATH.dog4],
  build: (textures) => {
    const main = new PIXI.Container();

    const storm = new PIXI.Container();

    const cloud = new PIXI.Graphics();
    cloud.beginFill(0x9aa3ad);
    cloud.drawEllipse(0, 0, 60, 28);
    cloud.drawEllipse(-35, 6, 32, 20);
    cloud.drawEllipse(35, 6, 32, 20);
    cloud.endFill();
    makeInteractive(cloud, "cloud");

    const rain = new PIXI.Graphics();
    rain.lineStyle(3, 0x5fa8d3, 0.9);
    for (let i = -45; i <= 45; i += 18) {
      rain.moveTo(i, 24).lineTo(i - 6, 50);
    }
    makeInteractive(rain, "rain");

    storm.addChild(cloud, rain);
    storm.position.set(120, 55);

    const sun = new PIXI.Graphics();
    sun.beginFill(0xffcc33).drawCircle(0, 0, 30).endFill();
    sun.lineStyle(4, 0xffcc33, 0.9);
    for (let a = 0; a < 360; a += 45) {
      const r = (a * Math.PI) / 180;
      sun.moveTo(Math.cos(r) * 36, Math.sin(r) * 36);
      sun.lineTo(Math.cos(r) * 50, Math.sin(r) * 50);
    }
    sun.pivot.set(0, 0); // вращение/масштаб вокруг центра лучей
    sun.position.set(370, 60);
    sun.angle = 15;
    makeInteractive(sun, "sun");

    const sadDog = new PIXI.Sprite(textures[ASSET_PATH.dog2]);
    sadDog.scale.set(0.3);
    sadDog.pivot.set(sadDog.texture.width / 2, sadDog.texture.height / 2);
    sadDog.position.set(120, 200);
    sadDog.angle = -8;
    makeInteractive(sadDog, "sadDog");

    const happyDog = new PIXI.Sprite(textures[ASSET_PATH.dog4]);
    happyDog.scale.set(0.32);
    happyDog.pivot.set(happyDog.texture.width / 2, happyDog.texture.height / 2);
    happyDog.position.set(370, 200);
    happyDog.angle = 6;
    makeInteractive(happyDog, "happyDog");

    main.addChild(storm, sun, sadDog, happyDog);
    return main;
  },
};

