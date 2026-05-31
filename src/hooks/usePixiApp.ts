import * as PIXI from "pixi.js-legacy";
import { createPixiApp } from "../pixi/createPixiApp";
import { create } from "zustand";
import { scenes } from "../pixi/DemoScene";

interface usePixiAppState {
  pixiApp: PIXI.Application | null;
  curSceneIndex: number;
  isLoadingAssets: boolean;
  sceneVersion: number;
  initApp: (canvasNode: HTMLCanvasElement) => void;
  destroyApp: () => void;
  switchScene: () => void;
  notifySceneChanged: () => void;
}

export const usePixiApp = create<usePixiAppState>((set, get) => ({
  pixiApp: null,
  curSceneIndex: 0,
  isLoadingAssets: false,
  sceneVersion: 0,
  notifySceneChanged: () => set((s) => ({ sceneVersion: s.sceneVersion + 1 })),
  initApp: (canvasNode: HTMLCanvasElement) => {
    set(() => ({ pixiApp: createPixiApp(canvasNode) }));
  },
  destroyApp() {
    get().pixiApp?.destroy();
    set(() => ({ pixiApp: null }));
  },
  switchScene: async function () {
    const { curSceneIndex, pixiApp } = get();
    const curScene = scenes[curSceneIndex];

    set(() => ({ curSceneIndex: (curSceneIndex + 1) % scenes.length }));

    const uncached = curScene.assets.filter(
      (url) => !PIXI.Assets.cache.has(url),
    );

    if (uncached.length > 0) {
      set(() => ({ isLoadingAssets: true })); // показываем лоадер только если есть что грузить (иначе возьмем из кеша)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let loadedAssets: Record<string, any> = {};
    try {
      loadedAssets =
        curScene.assets.length > 0 // не вызываем загрузку для тех кому она не нужна
          ? await PIXI.Assets.load(curScene.assets)
          : {};
    } catch {
      set(() => ({ isLoadingAssets: false }));
    }

    if (uncached.length > 0) {
      set(() => ({ isLoadingAssets: false }));
    }

    pixiApp?.stage.removeChildren();
    pixiApp?.stage.addChild(curScene.build(loadedAssets));
    get().notifySceneChanged();
  },
}));
