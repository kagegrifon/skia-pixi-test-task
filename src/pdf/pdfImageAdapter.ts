import type { CanvasKit, Image as SkImage } from "canvaskit-wasm";
import * as PIXI from "pixi.js-legacy";
import type { SpriteImageResolver } from "../skia/renderSprite";

// КОСТЫЛЬ под текущую сборку canvaskit-pdf.js.
//
// В этой урезанной сборке CanvasKit.MakeImageFromCanvasImageSource сломан:
// внутри он вызывает a.MakeImage({...}), но a.MakeImage в этой сборке указывает
// на перегрузку для ImageFilter, а не на создание SkImage из пикселей. В итоге
// возвращается невалидный объект → BindingError: Cannot pass "[object Object]"
// as a sk_sp<Image> при canvas.drawImageRect.
//
// Обходим через MakeImageFromEncoded: рисуем источник на offscreen-canvas,
// кодируем в PNG (toDataURL) и декодируем штатным _decodeImage. Этот путь в
// PDF-сборке рабочий.
//
// Когда появится собственная полноценная PDF-сборка — этот модуль и передача
// resolveImage в renderContainer удаляются, остаётся обычный getSpriteImage.

function toCanvasSource(src: unknown): CanvasImageSource | null {
  if (src instanceof HTMLImageElement) return src;
  if (src instanceof ImageBitmap) return src;
  if (src instanceof HTMLCanvasElement) return src;
  return null;
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function encodeToPng(src: CanvasImageSource, w: number, h: number): Uint8Array {
  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  offscreen.getContext("2d")!.drawImage(src, 0, 0);
  return dataUrlToBytes(offscreen.toDataURL("image/png"));
}

export function makePdfImageResolver(): SpriteImageResolver {
  const cache = new Map<number, SkImage>();

  return (CK: CanvasKit, sprite: PIXI.Sprite): SkImage | null => {
    const base = sprite.texture?.baseTexture;
    const resource = base?.resource;
    if (!base || !(resource instanceof PIXI.BaseImageResource)) return null;

    const cached = cache.get(base.uid);
    if (cached) return cached;

    const src = toCanvasSource(resource.source);
    if (!src) return null;

    const w = base.realWidth || base.width;
    const h = base.realHeight || base.height;
    const png = encodeToPng(src, w, h);
    const img = CK.MakeImageFromEncoded(png);
    if (img) cache.set(base.uid, img);
    return img;
  };
}
