export function Controls({
  onChangeScene,
  onAddRandom,
  onExportPdf,
  isLoadingScene,
  isExportingPdf,
}: {
  isLoadingScene: boolean;
  isExportingPdf: boolean;
  onChangeScene: () => void;
  onAddRandom: () => void;
  onExportPdf: () => void;
}) {
  return (
    <>
      <button onClick={onAddRandom}>Добавить фигуру</button>
      <button onClick={onChangeScene} disabled={isLoadingScene}>
        Переключить сцену
      </button>
      <button onClick={onExportPdf} disabled={isExportingPdf}>
        {isExportingPdf ? "Генерация PDF…" : "Экспорт PDF"}
      </button>
    </>
  );
}
