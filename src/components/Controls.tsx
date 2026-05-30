export function Controls({
  onChangeScene,
  onAddRandom,
  isLoadingScene,
}: {
  isLoadingScene: boolean;
  onChangeScene: () => void;
  onAddRandom: () => void;
}) {
  return (
    <>
      <button onClick={onAddRandom}>Добавить фигуру</button>
      <button onClick={onChangeScene} disabled={isLoadingScene}>
        Переключить сцену
      </button>
      <button>Экспорт PDF</button>
    </>
  );
}
