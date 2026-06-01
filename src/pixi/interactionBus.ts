import * as PIXI from "pixi.js-legacy";

export interface InteractionEvent {
  type: "pointerdown" | "pointerup";
  name: string;
}

export interface SelectionEvent {
  name: string | null;
}

export const interactionBus = new PIXI.utils.EventEmitter();
