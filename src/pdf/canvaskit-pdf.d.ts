import type { Canvas, CanvasKit } from "canvaskit-wasm";

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
}

export interface PDFDocument {
  beginPage(width: number, height: number): Canvas;
  endPage(): void;
  close(): Uint8Array;
  delete(): void;
}

export interface CanvasKitPDF extends CanvasKit {
  MakePDFDocument(metadata?: PDFMetadata): PDFDocument;
}

declare function CanvasKitPDFInit(opts: {
  locateFile: (filename: string) => string;
}): Promise<CanvasKitPDF>;

export default CanvasKitPDFInit;
