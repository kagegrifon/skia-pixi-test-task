import * as PIXI from "pixi.js-legacy";
import { useEventStatus } from "../hooks/useEventStatus";

export function makeInteractive(obj: PIXI.DisplayObject, name: string): void {
  obj.eventMode = "static";
  obj.cursor = "pointer";
  // EventManager делает hit-test по настоящему контуру через containsPoint(),
  // но containsPoint() учитывает только залитые фигуры (fillStyle.visible).
  // У линий (lineStyle + moveTo/lineTo, без заливки) заливки нет, поэтому
  // задаём им прямоугольный hitArea как запасной вариант — он имеет приоритет
  // в EventManager. Залитым фигурам hitArea не ставим, чтобы работал контур.
  if (obj instanceof PIXI.Graphics) {
    const hasFill = obj.geometry.graphicsData.some((d) => d.fillStyle?.visible);
    if (!hasFill) {
      obj.hitArea = obj.getLocalBounds(new PIXI.Rectangle());
    }
  }
  obj.on("pointerdown", () =>
    useEventStatus.getState().setStatus(`${name} pointerdown`),
  );
  obj.on("pointerup", () =>
    useEventStatus.getState().setStatus(`${name} pointerup`),
  );
}
