import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const CanvasKitInit = require("../dist/canvaskit-pdf.cjs");

const CanvasKit = await CanvasKitInit({
  locateFile: () => path.join(__dirname, "../dist/canvaskit-pdf.wasm"),
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

writeFileSync(path.join(__dirname, "../test-output.pdf"), bytes);
console.log("Saved test-output.pdf, size:", bytes.length, "bytes");
