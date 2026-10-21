export type Unit = "kg" | "lbs";
export type BarType = "men" | "women";

export interface PlateSpec { kg: number; lbs: number; color: string; h: number; w: number }

/** Olympic plates, heaviest first. h/w are relative SVG units. */
export const PLATES: PlateSpec[] = [
  { kg: 25, lbs: 55, color: "var(--plate-25)", h: 150, w: 22 },
  { kg: 20, lbs: 45, color: "var(--plate-20)", h: 150, w: 19 },
  { kg: 15, lbs: 35, color: "var(--plate-15)", h: 138, w: 16 },
  { kg: 10, lbs: 25, color: "var(--plate-10)", h: 126, w: 13 },
  { kg: 5, lbs: 10, color: "var(--plate-5)", h: 75, w: 11 },
  { kg: 2.5, lbs: 5, color: "var(--plate-2-5)", h: 58, w: 9 },
  { kg: 1.25, lbs: 2.5, color: "var(--plate-1-25)", h: 46, w: 7 },
];

export const BAR_WEIGHT: Record<BarType, Record<Unit, number>> = {
  men: { kg: 20, lbs: 45 },
  women: { kg: 15, lbs: 35 },
};

/** Greedy plate breakdown for one side. Returns plates heaviest-first and any unloadable remainder. */
export function platesPerSide(total: number, bar: number, unit: Unit) {
  let side = Math.max(0, (total - bar) / 2);
  const out: PlateSpec[] = [];
  for (const p of PLATES) {
    const v = p[unit];
    while (side + 1e-9 >= v) { out.push(p); side -= v; }
  }
  return { plates: out, remainder: Math.round(side * 1000) / 1000 };
}

export function summarize(plates: PlateSpec[], unit: Unit) {
  const counts = new Map<number, number>();
  plates.forEach(p => counts.set(p[unit], (counts.get(p[unit]) ?? 0) + 1));
  return [...counts].map(([v, n]) => `${n}x ${v}${unit}`).join(" · ");
}
