# Своя сборка `canvaskit-pdf.wasm` с PDF-бэкендом

Кастомная сборка CanvasKit (Skia/WASM) с включённым и **экспонированным в JavaScript**
PDF-бэкендом (`SkPDF`). Стандартный npm-пакет `canvaskit-wasm` PDF в JS не отдаёт:
в его `canvaskit_bindings.cpp` нет биндингов к `SkPDF`/`SkDocument::MakePDF`. Здесь мы
добавляем свой Emscripten-биндинг (`pdf_bindings.cpp`) и пересобираем Skia в Docker. 
Нашел похожий случай и использовал его в качестве референса.

### Референс

- **Патч к Skia:** `github.com/google/skia/compare/main...pushpagarwal:skia:canvas-kit-pdf`
  (добавляет `pdf_bindings`, держит правки вне core-`src/pdf`).
- **Готовый артефакт для сверки:** npm `@rollerbird/canvaskit-wasm-pdf` и репозиторий
  `pushpagarwal/html2pdf-skia` (там лежит собранный `canvaskit-pdf.wasm`).


## Результат

| Артефакт | Размер | Что это |
|---|---|---|
| `dist/canvaskit-pdf.cjs` | ~134 КБ | JS-загрузчик (CommonJS) с PDF-обёрткой |
| `dist/canvaskit-pdf.wasm` | ~9.3 МБ | WASM-модуль Skia с PDF-бэкендом и JPEG-кодеком |

Публичный JS-API (совпадает с контрактом `src/pdf/canvaskit-pdf.d.ts`):

```ts
CanvasKit.MakePDFDocument(metadata?): PDFDocument
  PDFDocument.beginPage(width, height): Canvas
  PDFDocument.endPage(): void
  PDFDocument.close(): Uint8Array   // байты PDF, начинаются с %PDF-
  PDFDocument.delete(): void
```

## Окружение (зафиксированные версии)

| Компонент | Версия |
|---|---|
| Docker (хост) | 27.1.1 |
| Базовый образ | Ubuntu 22.04.5 LTS |
| Python | 3.10.12 |
| Emscripten (`emsdk`) | 3.1.44 |
| Skia (пин-коммит) | `bb8c36fdf7b915a8c096e35e2f08109e477fe1b8` (2025-07-22) |

Версия emsdk скачивается самой Skia через `./bin/activate-emsdk`,
она привязана к пин-коммиту Skia. Пин Skia выбран по версии, на которой основан
референс-патч `pushpagarwal:canvas-kit-pdf`, — потому что на другой версии референсом было бы сложнее воспользоваться (скомпилировать C++).

## Структура папки

```
wasm-build/
  Dockerfile          # воспроизводимый рецепт: Ubuntu + deps + Skia(пин) + emsdk + сборка
  build.sh            # docker build + docker cp артефакта в dist/
  pdfBinginds/        # файлы для биндинга методов для создания pdf
    pdf_bindings.cpp  # C++-мостик SkPDF → JS (по образцу pushpagarwal)
    pdf.js            # JS-обёртка: оборачивает embind _MakePDFDocument → MakePDFDocument
  patch/              # build-файлы Skia, заменяемые обновленными (с PDF-правками):
    BUILD.gn          #   — добавляет pdf_bindings.cpp в sources, pdf.js в --pre-js, CK_INCLUDE_PDF
    canvaskit.gni     #   — declare_args: skia_canvaskit_enable_pdf = true
    compile.sh        #   — GN-аргументы: skia_enable_pdf=true, skia_canvaskit_enable_pdf=true
    externs.js        #   — защищает PDF-имена от closure compiler (см. грабли #1)
  test/               # папка для тестов
    test-pdf.mjs      # микро-проверка: рисует прямоугольник, пишет PDF, проверяет %PDF-
  dist/               # сюда падает артефакт; в .gitignore
```

В git есть только **рецепт** (Dockerfile, скрипты, биндинги, патчи), а не сам артефакт `dist/`.

## Как собрать

запуститить команду:

```bash
npm run wasm-build:start
```
(команда запустит `bash wasm-build/build.sh`)

Скрипт: `docker build` образа → запуск временного контейнера → `docker cp`
артефакта из `/skia/out/canvaskit_wasm/` → переименование в `canvaskit-pdf.{cjs,wasm}`
→ `dist/`. Первая сборка может занять много времени (~час) и может занять ~15–20 ГБ диска (clone Skia + `git-sync-deps` тянет third_party).
Последующие — минуты: тяжёлые слои кэшируются Docker, пересобирается только слой
компиляции при правке `pdf_bindings.cpp` / `pdf.js` / `patch/*`.

## Как проверить

```bash
npm run wasm-build:test
```
(команда запустит `node wasm-build/test-pdf.mjs`)

Ожидаемый вывод:

```
MakePDFDocument: function
PDF header: %PDF-
Saved test-output.pdf, size: 768 bytes
```

## Копирование в проект (вручную)

`build.sh` намеренно **не** копирует в `public/`. Когда артефакт признан годным копируем в `/dist`:

```bash
cp wasm-build/dist/canvaskit-pdf.cjs public/canvaskit/canvaskit-pdf.js
cp wasm-build/dist/canvaskit-pdf.wasm public/canvaskit/canvaskit-pdf.wasm
```

> Нюанс с именем wasm — см. грабли #4: имя `canvaskit.wasm` зашито внутри `.js`,
> поэтому `locateFile` в потребителе (`src/pdf/exportPdf.ts`) должен отдавать
> реальный путь, а не склеивать с зашитым именем.

---

## Как происходит сборка:

1. **Окружение:** Создаем Docker (Ubuntu 22.04 в контейнере), python3, git, emsdk 3.1.44.
2. **Исходники:** Клонируем репозиторий skia: `git clone` Skia → `git checkout bb8c36fdf...` → `python3 tools/git-sync-deps`
   (с ретраями: Google ограничивает параллельные запросы, делаем в несколько заходов).
3. **Активация Emscripten:** `./bin/activate-emsdk` (Skia сама тянет нужную версию emsdk).
4. **Проблема, которую решает PDF-бэкенд:** стоковый `canvaskit-wasm` не экспонирует
   `SkPDF` в JS — сам бэкенд в исходниках есть, но не прокинут в JavaScript.
5. **Изменения:** добавил `modules/canvaskit/pdf_bindings.cpp` (обёртка над
   `SkPDF::MakeDocument`, отдаёт PDF как `Uint8Array`/`ArrayBuffer`); зарегистрировал
   его в `BUILD.gn`; включил `//src/pdf` через GN-флаги `skia_enable_pdf=true` и
   `skia_canvaskit_enable_pdf=true`. Опирался на референс `pushpagarwal:canvas-kit-pdf`.
6. **Сборка:** `./compile.sh release` в Docker (десятки минут).
7. **Артефакт:** `canvaskit-pdf.wasm` (~9.3 МБ) + `canvaskit-pdf.cjs` (~134 КБ).
8. **Проверка:** Node-скрипт рисует прямоугольник, `MakePDFDocument → beginPage →
   close()` возвращает непустой `Uint8Array`, начинающийся с байтов `%PDF-`.

### Подводные камни

Путь от «`MakePDFDocument is not a function`» до рабочего PDF выявил пять проблем:

1. **Closure Compiler (`--closure=1`) вырезает JS-обёртки.** C++-биндинги попадают в
   `.wasm`, но публичный JS-API из `pdf.js` (он оборачивает embind `_MakePDFDocument`
   в `MakePDFDocument`) closure удаляет/переименовывает как «мёртвый код». Лечится
   **только** объявлением имён в `externs.js`. Объявить нужно ВСЕ имена, к которым
   `pdf.js` обращается через `CanvasKit.*`, включая `_`-префиксные embind-имена
   (`MakePDFDocument`, `_MakePDFDocument`, `Document.prototype.beginPage`/`_beginPage`,
   `PDFCompressionLevel` + значения enum, `_PDFTagNode` + методы). Симптом —
   минифицированная ошибка вида `a.Tg is not a function`.

2. **embind `value_object` требует ВСЕ поля при маршалинге.** `_MakePDFDocument` берёт
   `SimplePDFMetadata` как `value_object` с полем `_rootTag`. `pdf.js` ставил `_rootTag`
   только при наличии `rootTag` → `TypeError: Missing field: "_rootTag"`. Починка в
   `pdf.js`: поле выставляется всегда (`null`, когда structure-тегов нет).

3. **Skia PDF требует ЯВНОЙ передачи JPEG-кодека.** Эта версия Skia не тянет JPEG в PDF
   автоматически: `SK_ABORT("Must set both a jpegDecoder and jpegEncoder")`. В
   `pdf_bindings.cpp` пришлось задать `metadata.jpegDecoder`/`.jpegEncoder` обёртками над
   `SkJpegDecoder::Decode` / `SkJpegEncoder::Encode` (до вызова `metadata.to(...)`).

4. **Имя `.wasm` зашито внутри `.js`.** Emscripten вкомпилил `canvaskit.wasm`, а артефакт
   переименован в `canvaskit-pdf.wasm`. Потребитель должен в `locateFile` возвращать
   реальный путь, а не склеивать с зашитым именем.

5. **Node ESM vs CommonJS.** Проект — `"type": "module"`, поэтому `.js` грузится как ESM,
   а артефакт — CommonJS (`module.exports`). Лечится расширением `.cjs` + `createRequire`
   в `.mjs`-тесте.

---

## Интеграция в проект и разбор совместимости

После того как артефакт собрался и прошёл `test-pdf.mjs`, нужно подключить его в
`public/canvaskit/` и убедиться, что приложение работает на своей сборке. Сделано:
скопировали `dist/canvaskit-pdf.{cjs,wasm}` в `public/canvaskit/` (cjs → `.js`),
проверили онскрин-рендер и PDF-экспорт — всё работает.

### Два разных CanvasKit в одном приложении

| Путь | Грузит | Где | Path-стратегия |
|---|---|---|---|
| Онскрин-рендер | официальный `canvaskit-wasm` (npm) | `SkiaRenderer.ts` (`CanvasKitInit`) | `makeBuilderStrategy` (на `ck.PathBuilder`) |
| PDF-экспорт | **своя кастомная сборка** `canvaskit-pdf.js` | `exportPdf.ts` | `makePathStrategy` (на `ck.Path`) |

Сборки различаются по API, и из-за этого две части кода используют **разные**
стратегии построения пути. `ck.PathBuilder` есть в официальной сборке (32 вхождения),
но **отсутствует** в кастомной PDF-сборке и в референсе `pushpagarwal`. `ck.Path` есть везде,
поэтому применять онскрин-стратегию к PDF-сборке нельзя — будет
`ck.PathBuilder is not a constructor`. Обе стратегии живут в `src/skia/pathStrategy.ts`
с комментариями, какая для какой сборки.
