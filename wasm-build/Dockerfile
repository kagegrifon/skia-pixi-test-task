FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    python3-pip \
    curl \
    build-essential \
    ninja-build \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /skia
RUN git clone https://skia.googlesource.com/skia . \
    && git checkout bb8c36fdf7b915a8c096e35e2f08109e477fe1b8

# RUN python3 tools/git-sync-deps 
# Сервер Google отвергает слишком много запросов с одного IP за короткое время.
# python3 tools/git-sync-deps скачивает десятки репозиториев параллельно — Google ограничивает это.
# поэтому делаем в несколько заходов. Частичные скачивания сохраняются между попытками (Git не перекачивает то что уже скачал).
RUN for i in 1 2 3 4 5; do \
    python3 tools/git-sync-deps && break || \
    (echo "Attempt $i failed, retrying in 60s..." && sleep 60); \
    done
RUN ./bin/activate-emsdk
ENV PATH="/skia/third_party/externals/emsdk:/skia/third_party/externals/emsdk/upstream/emscripten:${PATH}"
WORKDIR /skia/modules/canvaskit

# заменяем build-файлы нашими (с PDF-правками) и копируем биндинг
COPY patch/externs.js ./
COPY patch/canvaskit.gni ./
COPY patch/BUILD.gn ./
COPY patch/compile.sh ./

# Копируем наш C++-биндинг и JS-обёртку
COPY pdfBindings/pdf_bindings.cpp ./
COPY pdfBindings/pdf.js ./

RUN ./compile.sh release