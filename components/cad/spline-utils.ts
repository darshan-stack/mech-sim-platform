// Utilities for Bezier spline creation and manipulation

export interface Point { x: number; y: number; }

export function getBezierPath(points: Point[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 3) {
    if (points[i + 2]) {
      d += ` C ${points[i].x} ${points[i].y}, ${points[i + 1].x} ${points[i + 1].y}, ${points[i + 2].x} ${points[i + 2].y}`;
    }
  }
  return d;
}
