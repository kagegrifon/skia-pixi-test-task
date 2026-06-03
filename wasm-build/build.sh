#!/usr/bin/env bash
set -e

IMAGE_NAME="canvaskit-pdf-builder"
DIST_DIR="$(dirname "$0")/dist"

# Создаём dist/ если нет
mkdir -p "$DIST_DIR"

# Собираем Docker-образ
docker build -t "$IMAGE_NAME" "$(dirname "$0")"

# Достаём артефакт из образа
# Запускаем временный контейнер только чтобы скопировать файл
CONTAINER_ID=$(docker create "$IMAGE_NAME")
docker cp "$CONTAINER_ID:/skia/out/canvaskit_wasm/canvaskit.js" "$DIST_DIR/canvaskit-pdf.js"
docker cp "$CONTAINER_ID:/skia/out/canvaskit_wasm/canvaskit.wasm" "$DIST_DIR/canvaskit-pdf.wasm"
docker rm "$CONTAINER_ID"

echo "Done! Artifacts in $DIST_DIR"