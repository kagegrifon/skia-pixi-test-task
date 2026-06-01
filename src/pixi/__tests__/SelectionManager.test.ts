import { describe, it, expect, vi, afterEach } from "vitest";
import * as PIXI from "pixi.js-legacy";
import { SelectionManager } from "../SelectionManager";
import { interactionBus, type SelectionEvent } from "../interactionBus";

function makeManager() {
  const overlay = new PIXI.Container();
  const onChange = vi.fn();
  const manager = new SelectionManager(overlay, onChange);
  return { manager, onChange };
}

describe("SelectionManager публикует selection", () => {
  afterEach(() => {
    interactionBus.removeAllListeners("selection");
  });

  it("select(obj) публикует selection с именем объекта", () => {
    const handler = vi.fn();
    interactionBus.on("selection", handler);

    const { manager } = makeManager();
    const obj = new PIXI.Graphics();
    obj.name = "circle";

    manager.select(obj);

    expect(handler).toHaveBeenCalledTimes(1);
    const payload = handler.mock.calls[0][0] as SelectionEvent;
    expect(payload).toEqual({ name: "circle" });
  });

  it("select(obj) без имени публикует selection с null", () => {
    const handler = vi.fn();
    interactionBus.on("selection", handler);

    const { manager } = makeManager();
    const obj = new PIXI.Graphics();

    manager.select(obj);

    const payload = handler.mock.calls[0][0] as SelectionEvent;
    expect(payload).toEqual({ name: null });
  });

  it("select(null) публикует selection с null", () => {
    const handler = vi.fn();
    interactionBus.on("selection", handler);

    const { manager } = makeManager();

    manager.select(null);

    expect(handler).toHaveBeenCalledTimes(1);
    const payload = handler.mock.calls[0][0] as SelectionEvent;
    expect(payload).toEqual({ name: null });
  });
});
