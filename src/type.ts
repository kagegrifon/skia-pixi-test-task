import * as PIXI from "pixi.js-legacy";

export type SceneDef = {
  assets: string[]; // ресурсы (картинки) для загрузки
  build: (textures: Record<string, PIXI.Texture>) => PIXI.Container;
};
