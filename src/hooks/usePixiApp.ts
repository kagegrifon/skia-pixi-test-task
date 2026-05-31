import * as PIXI from "pixi.js-legacy";
import { createPixiApp } from "../pixi/createPixiApp";
import { create } from "zustand";

interface usePixiAppState {
  pixiApp: PIXI.Application | null;
  initApp: (canvasNode: HTMLCanvasElement) => void;
  destroyApp: () => void;
}

export const usePixiApp = create<usePixiAppState>((set, get) => ({
  pixiApp: null,
  initApp: (canvasNode: HTMLCanvasElement) => {
    set(() => ({ pixiApp: createPixiApp(canvasNode) }));
  },
  destroyApp() {
    get().pixiApp?.destroy();
    set(() => ({ pixiApp: null }));
  },
}));
