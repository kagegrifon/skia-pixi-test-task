import { describe, it, expect, vi } from 'vitest';
import * as PIXI from 'pixi.js-legacy';
import { hitTest, hitsChild } from '../EventManager';

function makeObjWithHitArea(contains: (x: number, y: number) => boolean): PIXI.DisplayObject {
  const obj = new PIXI.Graphics() as PIXI.DisplayObject;
  obj.hitArea = { contains };
  return obj;
}

function makeObjWithContainsPoint(
  containsPoint: (p: PIXI.IPointData) => boolean,
): PIXI.DisplayObject {
  const obj = new PIXI.Graphics() as PIXI.DisplayObject & {
    containsPoint?: (p: PIXI.IPointData) => boolean;
  };
  obj.containsPoint = containsPoint;
  return obj;
}

describe('hitsChild', () => {
  it('hitArea имеет приоритет — если hitArea.contains→true, возвращает true', () => {
    const obj = makeObjWithHitArea(() => true);
    expect(hitsChild(obj, new PIXI.Point(0, 0))).toBe(true);
  });

  it('hitArea имеет приоритет — если hitArea.contains→false, возвращает false', () => {
    const obj = makeObjWithHitArea(() => false);
    expect(hitsChild(obj, new PIXI.Point(0, 0))).toBe(false);
  });

  it('containsPoint вызывается если нет hitArea', () => {
    const containsPoint = vi.fn().mockReturnValue(true);
    const obj = makeObjWithContainsPoint(containsPoint);
    expect(hitsChild(obj, new PIXI.Point(5, 5))).toBe(true);
    expect(containsPoint).toHaveBeenCalled();
  });

  it('fallback на getBounds если нет hitArea и containsPoint', () => {
    const obj = new PIXI.Container() as PIXI.DisplayObject;
    expect(typeof hitsChild(obj, new PIXI.Point(0, 0))).toBe('boolean');
  });
});

describe('hitTest', () => {
  it('пустой контейнер → null', () => {
    const container = new PIXI.Container();
    expect(hitTest(container, new PIXI.Point(0, 0))).toBeNull();
  });

  it('возвращает верхний по z-order объект при перекрытии', () => {
    const container = new PIXI.Container();
    const bottom = makeObjWithHitArea(() => true);
    const top = makeObjWithHitArea(() => true);
    container.addChild(bottom);
    container.addChild(top);
    expect(hitTest(container, new PIXI.Point(0, 0))).toBe(top);
  });

  it('нижний не попадает — возвращает верхний', () => {
    const container = new PIXI.Container();
    const bottom = makeObjWithHitArea(() => false);
    const top = makeObjWithHitArea(() => true);
    container.addChild(bottom);
    container.addChild(top);
    expect(hitTest(container, new PIXI.Point(0, 0))).toBe(top);
  });

  it('если ни один не попадает → null', () => {
    const container = new PIXI.Container();
    const obj = makeObjWithHitArea(() => false);
    container.addChild(obj);
    expect(hitTest(container, new PIXI.Point(0, 0))).toBeNull();
  });

  it('спуск в дочерний контейнер — возвращает вложенный объект', () => {
    const root = new PIXI.Container();
    const inner = new PIXI.Container();
    const leaf = makeObjWithHitArea(() => true);
    inner.addChild(leaf);
    root.addChild(inner);
    expect(hitTest(root, new PIXI.Point(0, 0))).toBe(leaf);
  });

  it('пропускает объект с visible=false', () => {
    const container = new PIXI.Container();
    const obj = makeObjWithHitArea(() => true);
    obj.visible = false;
    container.addChild(obj);
    expect(hitTest(container, new PIXI.Point(0, 0))).toBeNull();
  });

  it('выбирает видимый объект, игнорируя invisible под ним', () => {
    const container = new PIXI.Container();
    const hidden = makeObjWithHitArea(() => true);
    hidden.visible = false;
    const visible = makeObjWithHitArea(() => true);
    container.addChild(hidden);
    container.addChild(visible);
    expect(hitTest(container, new PIXI.Point(0, 0))).toBe(visible);
  });

  it('пропускает объект с eventMode="none"', () => {
    const container = new PIXI.Container();
    const obj = makeObjWithHitArea(() => true);
    (obj as any).eventMode = 'none';
    container.addChild(obj);
    expect(hitTest(container, new PIXI.Point(0, 0))).toBeNull();
  });

  it('объект без eventMode "none" по-прежнему попадает', () => {
    const container = new PIXI.Container();
    const obj = makeObjWithHitArea(() => true);
    container.addChild(obj);
    expect(hitTest(container, new PIXI.Point(0, 0))).toBe(obj);
  });
});
