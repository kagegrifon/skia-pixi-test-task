import { describe, it, expect, vi } from 'vitest';
import { StrokeHitArea, distSqToSegment } from '../StrokeHitArea';

// Mock pixi.js-legacy to avoid canvas initialization in test environment
vi.mock('pixi.js-legacy', () => ({
  __esModule: true,
  default: {},
}));

function makeArea(points: number[], width: number, closed = false): StrokeHitArea {
  const half = width / 2 + 3; // HIT_PADDING = 3
  return new StrokeHitArea([{ points, closed, hitRadiusSq: half * half }]);
}

describe('distSqToSegment', () => {
  it('точка на начале отрезка → 0', () => {
    expect(distSqToSegment(0, 0, 0, 0, 10, 0)).toBeCloseTo(0);
  });

  it('точка на конце отрезка → 0', () => {
    expect(distSqToSegment(10, 0, 0, 0, 10, 0)).toBeCloseTo(0);
  });

  it('точка на середине горизонтального отрезка → 0', () => {
    expect(distSqToSegment(5, 0, 0, 0, 10, 0)).toBeCloseTo(0);
  });

  it('точка перпендикулярно отрезку на расстоянии 3 → 9', () => {
    expect(distSqToSegment(5, 3, 0, 0, 10, 0)).toBeCloseTo(9);
  });

  it('точка за концом отрезка — t зажимается в 1', () => {
    expect(distSqToSegment(15, 0, 0, 0, 10, 0)).toBeCloseTo(25);
  });

  it('точка до начала отрезка — t зажимается в 0', () => {
    expect(distSqToSegment(-5, 0, 0, 0, 10, 0)).toBeCloseTo(25);
  });

  it('вырожденный отрезок (точка) — возвращает расстояние до этой точки', () => {
    expect(distSqToSegment(3, 4, 0, 0, 0, 0)).toBeCloseTo(25);
  });
});

describe('StrokeHitArea.contains', () => {
  it('точка точно на сегменте → попадание', () => {
    const area = makeArea([0, 0, 100, 0], 4);
    expect(area.contains(50, 0)).toBe(true);
  });

  it('точка в пределах hitRadius → попадание', () => {
    const area = makeArea([0, 0, 100, 0], 4);
    expect(area.contains(50, 4)).toBe(true);
  });

  it('точка дальше hitRadius → промах', () => {
    const area = makeArea([0, 0, 100, 0], 4);
    expect(area.contains(50, 6)).toBe(false);
  });

  it('ломаная из 3 точек — попадание по любому сегменту', () => {
    const area = makeArea([0, 0, 50, 0, 50, 50], 4);
    expect(area.contains(25, 0)).toBe(true);
    expect(area.contains(50, 25)).toBe(true);
    expect(area.contains(0, 50)).toBe(false);
  });

  it('замыкающий сегмент закрытого контура (closed=true) → попадание', () => {
    const area = makeArea([0, 0, 100, 0, 50, 50], 4, true);
    expect(area.contains(25, 25)).toBe(true);
  });

  it('открытый контур — замыкающий сегмент не проверяется', () => {
    const area = makeArea([0, 0, 100, 0, 50, 50], 4, false);
    expect(area.contains(25, 25)).toBe(false);
  });
});
