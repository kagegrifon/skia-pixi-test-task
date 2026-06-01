// Stub getContext so Pixi doesn't crash when detecting renderer in jsdom
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(type: string, ...args: unknown[]) {
  if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
    return null;
  }
  if (type === '2d') {
    // Return a minimal stub so Pixi's canvas blend mode detection doesn't crash
    return {
      fillStyle: '',
      globalCompositeOperation: '',
      fillRect: () => {},
      drawImage: () => {},
      getImageData: () => ({ data: new Uint8ClampedArray(4) }),
      canvas: this,
    } as unknown as CanvasRenderingContext2D;
  }
  return (originalGetContext as unknown as Function).call(this, type, ...args);
};
