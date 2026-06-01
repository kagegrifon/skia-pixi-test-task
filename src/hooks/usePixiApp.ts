import * as PIXI from "pixi.js-legacy";
import { createPixiApp } from "../pixi/createPixiApp";
import { create } from "zustand";
import { scenes } from "../pixi/DemoScene";
import { SelectionManager } from "../pixi/SelectionManager";
import { clearSpriteImageCache } from "../skia/spriteImageCache";

interface usePixiAppState {
  pixiApp: PIXI.Application | null;
  contentLayer: PIXI.Container | null;
  overlayLayer: PIXI.Container | null;
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
  contentLayer: null,
  overlayLayer: null,
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
    const contentLayer = new PIXI.Container();
    const overlayLayer = new PIXI.Container();
    (overlayLayer as any).eventMode = 'none';
    pixiApp.stage.addChild(contentLayer, overlayLayer);
    const selectionManager = new SelectionManager(overlayLayer, () =>
      get().notifySelectionChanged(),
    );
    set(() => ({ pixiApp, contentLayer, overlayLayer, selectionManager }));
  },
  destroyApp() {
    get().selectionManager?.destroy();
    clearSpriteImageCache();
    get().pixiApp?.destroy();
    set(() => ({
      pixiApp: null,
      contentLayer: null,
      overlayLayer: null,
      selectionManager: null,
      selectionVersion: 0,
      sceneVersion: 0,
      curSceneIndex: 0,
    }));
  },
  switchScene: async function () {
    const { curSceneIndex, pixiApp, contentLayer } = get();
    const nextIndex = (curSceneIndex + 1) % scenes.length;
    const nextScene = scenes[nextIndex];

    const uncached = nextScene.assets.filter(
      (url) => !PIXI.Assets.cache.has(url),
    );

    if (uncached.length > 0) {
      set(() => ({ isLoadingAssets: true }));
    }

    let loadedAssets: Record<string, PIXI.Texture>;
    try {
      loadedAssets =
        nextScene.assets.length > 0
          ? await PIXI.Assets.load(nextScene.assets)
          : {};
    } catch (err) {
      console.error("Не удалось загрузить ассеты сцены", err);
      set(() => ({ isLoadingAssets: false }));
      return;
    } finally {
      if (uncached.length > 0) set(() => ({ isLoadingAssets: false }));
    }

    if (!pixiApp || !contentLayer) {
      console.error("Нет инстанса приложения pixi");
      return;
    }

    clearSpriteImageCache();
    get().selectionManager?.select(null);
    contentLayer.removeChildren();
    contentLayer.addChild(nextScene.build(loadedAssets));
    set(() => ({ curSceneIndex: nextIndex }));
    get().notifySceneChanged();
  },
}));
