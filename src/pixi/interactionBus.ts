import * as PIXI from "pixi.js-legacy";

export interface InteractionEvent {
  type: "pointerdown" | "pointerup";
  name: string;
}

export const interactionBus = new PIXI.utils.EventEmitter();
