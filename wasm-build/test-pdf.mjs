import { readFileSync, writeFileSync } from "fs";

const { default: CanvasKitInit } =
  await import("../wasm-build/dist/canvaskit-pdf.js");

const CanvasKit = await CanvasKitInit({
  locateFile: (file) => `./wasm-build/dist/${file}`,
});

// Проверяем что MakePDFDocument существует
console.log("MakePDFDocument:", typeof CanvasKit.MakePDFDocument);

// Создаём PDF
const doc = CanvasKit.MakePDFDocument();
const canvas = doc.beginPage(595, 842); // A4 в пунктах

// Рисуем прямоугольник
const paint = new CanvasKit.Paint();
paint.setColor(CanvasKit.Color(255, 0, 0, 1.0));
canvas.drawRect(CanvasKit.LTRBRect(50, 50, 200, 200), paint);
paint.delete();

doc.endPage();
const bytes = doc.close();
doc.delete();

// Проверяем сигнатуру PDF
const header = String.fromCharCode(...bytes.slice(0, 5));
console.log("PDF header:", header); // должно быть %PDF-

writeFileSync("./wasm-build/test-output.pdf", bytes);
console.log("Saved test-output.pdf, size:", bytes.length, "bytes");
