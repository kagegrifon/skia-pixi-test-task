import * as PIXI from "pixi.js-legacy";

export function setupDemoScene(app: PIXI.Application): void {
  const graphics = new PIXI.Graphics();

  graphics.beginFill(0x4a90e2);
  graphics.drawRect(50, 50, 200, 150);
  graphics.endFill();

  graphics.beginFill(0xe24a4a);
  graphics.drawCircle(150, 150, 80);
  graphics.endFill();

  app.stage.addChild(graphics);
}

