import * as PIXI from "pixi.js-legacy";
import { createPixiApp } from "../pixi/createPixiApp";
import { create } from "zustand";
import { scenes } from "../pixi/DemoScene";
import { SelectionManager } from "../pixi/SelectionManager";

interface usePixiAppState {
  pixiApp: PIXI.Application | null;
  selectionManager: SelectionManager | null;
  selectionVersion: number;
  curSceneIndex: number;
  isLoadingAssets: boolean;
  sceneVersion: number;
  initApp: (canvasNode: HTMLCanvasElement) => void;
  destroyApp: () => void;
  switchScene: () => void;
  notifySceneChanged: () => void;
  notifySelectionChanged: () => void;
}

export const usePixiApp = create<usePixiAppState>((set, get) => ({
  pixiApp: null,
  selectionManager: null,
  selectionVersion: 0,
  curSceneIndex: 0,
  isLoadingAssets: false,
  sceneVersion: 0,
  notifySceneChanged: () => set((s) => ({ sceneVersion: s.sceneVersion + 1 })),
  notifySelectionChanged: () =>
    set((s) => ({ selectionVersion: s.selectionVersion + 1 })),
  initApp: (canvasNode: HTMLCanvasElement) => {
    const pixiApp = createPixiApp(canvasNode);
    const selectionManager = new SelectionManager(pixiApp, () =>
      get().notifySelectionChanged(),
    );
    set(() => ({ pixiApp, selectionManager }));
  },
  destroyApp() {
    get().selectionManager?.destroy();
    get().pixiApp?.destroy();
    set(() => ({ pixiApp: null, selectionManager: null, selectionVersion: 0, sceneVersion: 0 }));
  },
  switchScene: async function () {
    const { curSceneIndex, pixiApp } = get();
    const curScene = scenes[curSceneIndex];

    set(() => ({ curSceneIndex: (curSceneIndex + 1) % scenes.length }));

    const uncached = curScene.assets.filter(
      (url) => !PIXI.Assets.cache.has(url),
    );

    if (uncached.length > 0) {
      set(() => ({ isLoadingAssets: true }));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let loadedAssets: Record<string, any> = {};
    try {
      loadedAssets =
        curScene.assets.length > 0
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
