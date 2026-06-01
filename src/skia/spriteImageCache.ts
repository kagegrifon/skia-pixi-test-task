import type { CanvasKit, Image as SkImage } from 'canvaskit-wasm';
import * as PIXI from 'pixi.js-legacy';

const cache = new Map<number, SkImage>();

export function buildSkImage(
  CK: CanvasKit,
  src: unknown,
): SkImage | null {
  if (src instanceof HTMLImageElement) {
    const offscreen = document.createElement('canvas');
    offscreen.width = src.naturalWidth;
    offscreen.height = src.naturalHeight;
    offscreen.getContext('2d')!.drawImage(src, 0, 0);
    return CK.MakeImageFromCanvasImageSource(offscreen);
  }
  if (src instanceof ImageBitmap) {
    return CK.MakeImageFromCanvasImageSource(src);
  }
  return null;
}

export function getSpriteImage(CK: CanvasKit, sprite: PIXI.Sprite): SkImage | null {
  const base = sprite.texture?.baseTexture;
  const resource = base?.resource;
  if (!(resource instanceof PIXI.BaseImageResource)) return null;

  const key = base.uid;
  const cached = cache.get(key);
  if (cached) return cached;

  const img = buildSkImage(CK, resource.source);
  if (img) cache.set(key, img);
  return img;
}

export function clearSpriteImageCache(): void {
  for (const img of cache.values()) img.delete();
  cache.clear();
}
