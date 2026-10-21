export type Muscle = "chest" | "shoulders" | "biceps" | "triceps" | "abs" | "lats" | "upperBack" | "glutes" | "quads" | "hamstrings" | "calves";

export const MUSCLES: Record<Muscle, string> = {
  chest: "Pectorals / Chest",
  shoulders: "Deltoids / Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  abs: "Abdominals / Core",
  lats: "Latissimus Dorsi / Lats",
  upperBack: "Traps & Rhomboids / Upper Back",
  glutes: "Glutes",
  quads: "Quadriceps",
  hamstrings: "Hamstrings",
  calves: "Calves",
};

/** Exercise name keyword → muscles it trains (one working set counts once per muscle). */
const RULES: [RegExp, Muscle[]][] = [
  [/chest|pec|fly|bench|push-?up/i, ["chest", "triceps"]],
  [/dip/i, ["chest", "triceps"]],
  [/ohp|overhead press|shoulder press|landmine|pin press|smith.*press|neutral cable press/i, ["shoulders", "triceps"]],
  [/lateral|delt|face pull|pull-?apart|infraspinatus|external rot/i, ["shoulders"]],
  [/tricep|pushdown|extension \(rope\)|skull/i, ["triceps"]],
  [/^(?!.*(wrist|reverse|leg|hamstring)).*curl/i, ["biceps"]],
  [/bayesian|hammer|chin/i, ["biceps"]],
  [/pull-?up|chin-?up|pulldown|lat /i, ["lats", "biceps"]],
  [/row/i, ["upperBack", "lats"]],
  [/shrug|farmer|carry/i, ["upperBack"]],
  [/leg raise|crunch|plank|ab |core|pallof/i, ["abs"]],
  [/glute|hip thrust|kickback|rdl|deadlift/i, ["glutes", "hamstrings"]],
  [/hamstring|leg curl/i, ["hamstrings"]],
  [/leg press|squat|leg extension|machine extension|wall sit|lunge/i, ["quads", "glutes"]],
  [/calf/i, ["calves"]],
];

export function musclesFor(name: string): Muscle[] {
  const out = new Set<Muscle>();
  for (const [re, ms] of RULES) if (re.test(name)) ms.forEach(m => out.add(m));
  return [...out];
}

import type { WorkoutLog } from '../types/database';

export function weeklyMuscleSets(sessions: (WorkoutLog | any)[], now = Date.now()): Record<Muscle, number> {
  const res = Object.fromEntries(Object.keys(MUSCLES).map(k => [k, 0])) as Record<Muscle, number>;
  const cutoff = now - 7 * 864e5;
  for (const s of sessions) {
    const sessionTime = new Date(s.completed_at || s.started_at || s.date || s.created_at || '').getTime();
    if (!isNaN(sessionTime) && sessionTime < cutoff) continue;
    const items = s.exercises || s.entries || [];
    for (const e of items) {
      let n = 0;
      if (Array.isArray(e.setDetails) && e.setDetails.length > 0) {
        n = e.setDetails.filter((x: any) => x.completed !== false).length;
      } else if (typeof e.sets === 'number') {
        n = e.sets;
      } else if (Array.isArray(e.sets)) {
        n = e.sets.filter((x: any) => x.done || x.completed).length;
      } else {
        n = 1;
      }

      if (n > 0) {
        musclesFor(e.name ?? "").forEach(m => { res[m] += n; });
      }
    }
  }
  return res;
}

export type Zone = "untrained" | "maintenance" | "optimal" | "high" | "junk";

export function zoneFor(sets: number): Zone {
  if (sets <= 0) return "untrained";
  if (sets <= 5) return "maintenance";
  if (sets <= 12) return "optimal";
  if (sets <= 18) return "high";
  return "junk";
}

export const ZONE_COLOR: Record<Zone, string> = {
  untrained: "#1F2937",
  maintenance: "#0E7490",
  optimal: "#32FF32",
  high: "#10B981",
  junk: "#F43F5E"
};

export const statusFor = (z: Zone) => (z === "high" || z === "junk" ? "Near Fatigue Limit" : z === "optimal" ? "Optimal Stimulus" : z === "maintenance" ? "Maintenance Volume" : "Untrained / Recovered");

export const WEEKLY_TARGET = 16;
