import * as PIXI from "pixi.js-legacy";
import type { SceneDef } from "../type";

const ASSET_PATH = {
  cat: "/cat.jpg",
};

const scene1: SceneDef = {
  assets: [],
  build: function (): PIXI.Container {
    const main = new PIXI.Container();
    const sub = new PIXI.Container();

    const g1 = new PIXI.Graphics();
    g1.beginFill(0xff0000).drawEllipse(0, 0, 200, 100).endFill();
    g1.position.set(200, 100);
    g1.angle = 30; // rotate

    const g2 = new PIXI.Graphics();
    g2.beginFill(0x0000ff).drawRect(-50, -75, 100, 150).endFill();
    g2.position.set(120, 60);
    g2.angle = 15;
    g2.scale.set(1.5, 1.7); // scale

    const g3 = new PIXI.Graphics();
    g3.lineStyle(10, 0xffffff, 1).moveTo(0, 0).lineTo(150, 100);
    g3.angle = -20;

    const g4 = new PIXI.Graphics();
    g4.lineStyle(10, 0xffff00, 1).moveTo(0, 70).lineTo(150, -30);
    g4.angle = 20;

    sub.position.set(75, 50); // translate, наследуется g3/g4
    sub.addChild(g3, g4);
    main.addChild(sub, g1, g2);
    return main;
  },
};

const scene2: SceneDef = {
  assets: [ASSET_PATH.cat],
  build: (textures) => {
    const main = new PIXI.Container();
    const inner = new PIXI.Container();

    // Зелёный круг
    const circle = new PIXI.Graphics();
    circle.beginFill(0x00cc44).drawCircle(0, 0, 60).endFill();
    circle.position.set(300, 200);
    circle.scale.set(1.2, 0.8); // scale — сплющен

    // Оранжевый прямоугольник
    const rect = new PIXI.Graphics();
    rect.beginFill(0xff8800).drawRect(-40, -30, 80, 60).endFill();
    rect.position.set(150, 220);
    rect.angle = -25; // rotate

    // Белая ломаная линия
    const line = new PIXI.Graphics();
    line
      .lineStyle(6, 0xffffff, 1)
      .moveTo(0, 0)
      .lineTo(80, -40)
      .lineTo(160, 20)
      .lineTo(240, -10);
    line.position.set(50, 80); // translate

    // Вложенный контейнер — два пурпурных прямоугольника
    const r1 = new PIXI.Graphics();
    r1.beginFill(0xcc00cc).drawRect(0, 0, 50, 50).endFill();
    const r2 = new PIXI.Graphics();
    r2.beginFill(0x8800cc).drawRect(60, 10, 50, 50).endFill();

    inner.position.set(200, 30); // translate наследуется дочерними
    inner.angle = 10; // rotate тоже наследуется
    inner.addChild(r1, r2);

    // добавляем картинку
    const sprite = new PIXI.Sprite(textures[ASSET_PATH.cat]);

    sprite.position.set(150, 120);
    sprite.angle = 10;
    sprite.scale.set(0.3, 0.3);

    main.addChild(line, rect, circle, inner, sprite);
    return main;
  },
};

const scene3: SceneDef = {
  assets: [],
  build: () => {
    const main = new PIXI.Container();
    const sub = new PIXI.Container();

    // Большой жёлтый эллипс
    const ellipse = new PIXI.Graphics();
    ellipse.beginFill(0xffdd00).drawEllipse(0, 0, 150, 60).endFill();
    ellipse.position.set(350, 150);
    ellipse.angle = 45;
    ellipse.scale.set(1, 1.5); // scale по Y

    // Красный ромб из линий
    const diamond = new PIXI.Graphics();
    diamond
      .lineStyle(4, 0xff3333, 1)
      .moveTo(0, -60)
      .lineTo(40, 0)
      .lineTo(0, 60)
      .lineTo(-40, 0)
      .lineTo(0, -60);
    diamond.beginFill(0xff3333, 0.3);
    diamond.drawPolygon([0, -60, 40, 0, 0, 60, -40, 0]);
    diamond.endFill();
    diamond.position.set(180, 180);
    diamond.angle = 15;

    // Синий прямоугольник
    const rect = new PIXI.Graphics();
    rect.beginFill(0x3366ff).drawRect(-30, -20, 60, 40).endFill();
    rect.angle = -10;
    rect.scale.set(2, 1);
    rect.position.set(40, 20);

    // Вложенный контейнер с двумя линиями — сетка
    const grid1 = new PIXI.Graphics();
    grid1.lineStyle(3, 0x00ffff, 0.8).moveTo(0, 0).lineTo(200, 0);
    const grid2 = new PIXI.Graphics();
    grid2.lineStyle(3, 0x00ffff, 0.8).moveTo(0, 0).lineTo(0, 120);

    sub.position.set(50, 50);
    sub.angle = 5;
    sub.addChild(grid1, grid2);

    main.addChild(sub, ellipse, diamond, rect);
    return main;
  },
};

export const scenes = [scene1, scene2, scene3] as const;

