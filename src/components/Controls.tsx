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
      <button className="btn btn--accent" onClick={onAddRandom}>
        Добавить фигуру
      </button>
      <button className="btn" onClick={onChangeScene} disabled={isLoadingScene}>
        Переключить сцену
      </button>
      <button className="btn" onClick={onExportPdf} disabled={isExportingPdf}>
        {isExportingPdf ? "Генерация PDF…" : "Экспорт PDF"}
      </button>
    </>
  );
}
