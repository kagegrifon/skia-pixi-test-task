# Pixi → Skia → PDF

Приложение на TypeScript, которое рендерит `PIXI.Container` (со всеми трансформациями) в
**собственную обёртку на Skia** (canvaskit-wasm) и экспортирует сцену в **векторный PDF**
через Skia PDF backend, скомпилированный в кастомную wasm-сборку.

Решение тестового задания (см. [TEST_TASK_DESCRIPTION.md](TEST_TASK_DESCRIPTION.md)).

**Демо:** https://kagegrifon.github.io/skia-pixi-test-task/

---

## Что реализовано

- **Обёртка `convertPixiContainerToSkia`** — обход дерева `PIXI.Container`, рендер
  каждого `DisplayObject` нативным API Skia (`SkCanvas` / `SkPaint` / `SkPath`) с учётом
  `worldTransform` (translate / rotate / scale, в т.ч. вложенные контейнеры).
- **Поддерживаемые объекты:** `PIXI.Graphics` (`drawRect`, `drawCircle`, `drawEllipse`,
  `drawPolygon`, `moveTo`/`lineTo`, fill + lineStyle) и `PIXI.Sprite` (jpg/png как bitmap).
- **Два канваса рядом:** слева — Pixi (`forceCanvas: true`), справа — Skia. Один и тот же
  граф сцены рисуется обоими рендерерами.
- **Экспорт в PDF** — та же сцена прогоняется через **свою** сборку `canvaskit-pdf.wasm`
  (биндинг `SkPDF`). Графика выходит **векторной**, `Sprite` — bitmap (допустимо заданием).
- **События `pointerDown` / `pointerUp`** работают на обоих канвасах (на Skia — через свой
  hit-test), плюс выделение объекта по клику и панель статуса.
- **Интерактивность:** кнопки «Добавить случайную фигуру» и «Переключить сцену»
  (три заготовленных `PIXI.Container`).

---

## Дополнительно к заданию

Сверх минимальных требований реализовано:

- **Точный hit-test по линиям** ([StrokeHitArea.ts](src/pixi/StrokeHitArea.ts)). Для
  незалитых `lineStyle`-линий попадание считается по расстоянию от точки до **сегментов
  ломаной** (а не по прямоугольному bounding box) — по тонкой линии реально можно кликнуть.
  Расстояние берётся в квадрате (без `sqrt`), с запасом `HIT_PADDING` к половине толщины.
- **Свой hit-test для Skia-канваса** ([EventManager.ts](src/pixi/EventManager.ts)). На
  Skia нет встроенного дерева событий Pixi, поэтому обход детей и `worldTransform.applyInverse`
  для попадания в локальные координаты сделаны вручную — события работают одинаково на обоих
  канвасах.
- **Подсветка выделения** ([SelectionManager.ts](src/pixi/SelectionManager.ts)). По клику
  вокруг объекта рисуется рамка по его `localBounds`, спроецированным через `worldTransform`
  (то есть повёрнутая/масштабированная вместе с объектом, а не осевой прямоугольник).
- **Кеш Skia-картинок** ([spriteImageCache.ts](src/skia/spriteImageCache.ts)). `SkImage`
  для каждого спрайта строится один раз и кешируется по `baseTexture.uid` — повторные рендеры
  и переключения сцен не пересоздают изображения; есть явная очистка с `image.delete()`.
- **Шина взаимодействий** ([interactionBus.ts](src/pixi/interactionBus.ts)). Лёгкий
  event-emitter разделяет рендер-слой и React-UI: панель статуса («последнее событие»,
  «выделено») подписана на шину, а не завязана на внутренности Pixi.
- **Богатый генератор случайных фигур** ([addRandomShape.ts](src/pixi/addRandomShape.ts)).
  Кнопка добавляет круги / прямоугольники / линии со случайными цветом, обводкой, позицией,
  поворотом, масштабом и **skew** — проверка рендера и трансформаций на «грязных» данных.
- **Курсор по наведению** — `pointermove` обновляет `cursor` канваса в зависимости от того,
  есть ли под указателем интерактивный объект.
- **CI с ручным аппрувом деплоя** — lint + тесты + сборка гоняются параллельно, прод-деплой
  на Pages требует ручного подтверждения в GitHub environment.

---

## Стек

| Слой | Технология |
|---|---|
| Язык | TypeScript |
| UI-оболочка | React 19 + Vite |
| Графика (источник) | `pixi.js-legacy` 7.2.4 (`forceCanvas: true`) |
| Рендер Skia (онскрин) | `canvaskit-wasm` (официальный npm-билд) |
| PDF | **кастомная** `canvaskit-pdf.wasm` со Skia PDF backend |
| Состояние | zustand |
| Тесты | vitest + jsdom |
| Деплой | GitHub Pages (чистая статика, без бэкенда) |

---

## Запуск

```bash
npm install
npm run dev      # дев-сервер Vite (http://localhost:5173)
```

Другие команды:

```bash
npm run build    # типизация (tsc -b) + продакшн-сборка в dist/
npm run preview  # локальный просмотр продакшн-сборки
npm run lint     # eslint
npm test         # vitest (один прогон)
npm run test:cov # тесты с покрытием
```

> Артефакт PDF-сборки (`public/canvaskit/canvaskit-pdf.{js,wasm}`) уже лежит в репозитории,
> поэтому для запуска приложения **пересобирать wasm не нужно**.

---

## Архитектура

```
            React (layout · кнопки · статус)
                 │ ref + useEffect монтирует канвасы
        ┌────────┴─────────┐
        ▼                  ▼
   Pixi canvas        Skia canvas
   PIXI.Application    canvaskit-wasm
   forceCanvas: true   нативный Skia API
        │                  ▲
        │  convertPixiContainerToSkia():
        └──> обход дерева → worldTransform → graphicsData ──┘

   Экспорт PDF: тот же обход сцены → canvaskit-pdf.wasm (SkPDF)
                → Uint8Array → download (scene.pdf). Векторно.
```

Чистые TS-модули (Pixi / Skia-обёртка / PDF / события) изолированы от React и покрыты
тестами. React только монтирует канвасы и дёргает их через тонкие хуки.

Ключевые модули:

| Путь | Назначение |
|---|---|
| [src/skia/renderScene.ts](src/skia/renderScene.ts) | Обёртка: обход `PIXI.Container` → рисование на `SkCanvas` |
| [src/skia/SkiaRenderer.ts](src/skia/SkiaRenderer.ts) | Инициализация онскрин-canvaskit и рендер-цикл |
| [src/skia/graphicsData.ts](src/skia/graphicsData.ts) | Извлечение шейпов/стилей из `PIXI.Graphics` |
| [src/skia/pathStrategy.ts](src/skia/pathStrategy.ts) | Построение `SkPath` (разные стратегии для онскрин- и PDF-сборок) |
| [src/pdf/exportPdf.ts](src/pdf/exportPdf.ts) | Экспорт сцены в PDF через `canvaskit-pdf.wasm` |
| [src/pixi/DemoScene.ts](src/pixi/DemoScene.ts) | Демо-сцены с трансформациями и вложенностью |
| [src/pixi/EventManager.ts](src/pixi/EventManager.ts) | События `pointerDown`/`Up` и hit-test для Skia-канваса |

---

## Кастомная сборка `canvaskit-pdf.wasm`

Главный нетривиальный пункт задания. Стандартный npm-пакет `canvaskit-wasm` **не отдаёт
PDF в JS**: сам `SkPDF` в исходниках Skia есть, но не прокинут в JavaScript. Поэтому в
[wasm-build/](wasm-build/) собирается своя сборка CanvasKit: добавлен Emscripten-биндинг
(`pdf_bindings.cpp`), включён `//src/pdf`, и Skia пересобирается в Docker.

Публичный JS-API артефакта:

```ts
CanvasKit.MakePDFDocument(metadata?): PDFDocument
  PDFDocument.beginPage(width, height): Canvas
  PDFDocument.endPage(): void
  PDFDocument.close(): Uint8Array   // байты PDF, начинаются с %PDF-
  PDFDocument.delete(): void
```

Собрать и проверить:

```bash
npm run wasm-build:start   # docker build + извлечение артефакта в wasm-build/dist/
npm run wasm-build:test    # node-проверка: рисует прямоугольник и пишет PDF
```

> Подробное описание шагов сборки, зафиксированных версий, биндинга и встреченных
> подводных камней (closure compiler, JPEG-кодек, имя `.wasm`, ESM/CJS) — в
> [wasm-build/README.md](wasm-build/README.md).

---

## Деплой

Пуш в `main` запускает [GitHub Actions](.github/workflows/deploy.yml): параллельно lint +
тесты + сборка, затем деплой на GitHub Pages. Деплой настроен на ручной аппрув.
`base` для продакшн-сборки — `/skia-pixi-test-task/` (см. [vite.config.ts](vite.config.ts)).
