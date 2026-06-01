import * as PIXI from "pixi.js-legacy";

interface Stroke {
  points: number[];
  closed: boolean;
  // Квадрат радиуса попадания (половина толщины + запас), чтобы не считать корень.
  hitRadiusSq: number;
}

// Запас к половине толщины линии — иначе по тонким линиям (2-3px) почти
// невозможно попасть. В локальных координатах фигуры.
const HIT_PADDING = 3;

/**
 * hitArea для незалитых линий (lineStyle + moveTo/lineTo).
 * Попадание = точка лежит не дальше половины толщины (+запас) от любого
 * сегмента ломаной, а не где-то в её прямоугольном bounding box.
 *
 * Точка приходит уже в локальных координатах фигуры — EventManager делает
 * worldTransform.applyInverse перед вызовом contains().
 */
export class StrokeHitArea implements PIXI.IHitArea {
  private strokes: Stroke[];

  constructor(strokes: Stroke[]) {
    this.strokes = strokes;
  }

  /**
   * Собирает штрихи из геометрии Graphics. Возвращает null, если видимых
   * линий нет (тогда вызывающий код откатывается на прямоугольный hitArea).
   */
  static fromGraphics(gfx: PIXI.Graphics): StrokeHitArea | null {
    // Открытый путь (moveTo/lineTo без endFill) живёт в currentPath и попадает
    // в graphicsData только после finishPoly — форсируем это.
    gfx.finishPoly();

    const strokes: Stroke[] = [];
    for (const data of gfx.geometry.graphicsData) {
      const points = (data.shape as PIXI.Polygon).points;
      if (!data.lineStyle?.visible || data.lineStyle.width <= 0) continue;
      if (!points || points.length < 4) continue;

      const half = data.lineStyle.width / 2 + HIT_PADDING;
      strokes.push({
        points,
        closed: Boolean((data.shape as PIXI.Polygon).closeStroke),
        hitRadiusSq: half * half,
      });
    }

    return strokes.length > 0 ? new StrokeHitArea(strokes) : null;
  }

  contains(x: number, y: number): boolean {
    for (const stroke of this.strokes) {
      const { points, closed, hitRadiusSq } = stroke;
      for (let i = 0; i + 3 < points.length; i += 2) {
        if (
          distSqToSegment(x, y, points[i], points[i + 1], points[i + 2], points[i + 3]) <=
          hitRadiusSq
        ) {
          return true;
        }
      }
      // Замыкающий сегмент для закрытых контуров.
      if (closed && points.length >= 4) {
        const last = points.length - 2;
        if (
          distSqToSegment(x, y, points[last], points[last + 1], points[0], points[1]) <=
          hitRadiusSq
        ) {
          return true;
        }
      }
    }
    return false;
  }
}

/** Квадрат расстояния от точки (px,py) до отрезка (ax,ay)-(bx,by). */
export function distSqToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  // Вырожденный отрезок (точка).
  let t = lenSq > 0 ? ((px - ax) * dx + (py - ay) * dy) / lenSq : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  const ex = px - cx;
  const ey = py - cy;
  return ex * ex + ey * ey;
}
