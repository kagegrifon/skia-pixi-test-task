export function Controls({
  onChangeScene,
  isLoadingScene,
}: {
  isLoadingScene: boolean;
  onChangeScene: () => void;
}) {
  return (
    <>
      <button>Добавить фигуру</button>
      <button onClick={onChangeScene} disabled={isLoadingScene}>
        Переключить сцену
      </button>
      <button>Экспорт PDF</button>
    </>
  );
}
