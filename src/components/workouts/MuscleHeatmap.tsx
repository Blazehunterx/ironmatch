import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MUSCLES, ZONE_COLOR, WEEKLY_TARGET, statusFor, weeklyMuscleSets, zoneFor, type Muscle } from "../../lib/muscles";
import type { WorkoutLog } from "../../types/database";

type Part = { m: Muscle; d: string };
const mirror = (d: string) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${200 - Number(x)},${y}`);
const pair = (m: Muscle, d: string): Part[] => [{ m, d }, { m, d: mirror(d) }];

const FRONT: Part[] = [
  ...pair("shoulders", "M62,92 C50,96 44,110 46,124 L66,118 C68,106 70,98 76,94 Z"),
  ...pair("chest", "M78,96 C88,92 98,94 99,98 L99,128 C88,132 76,128 70,120 C68,108 72,100 78,96 Z"),
  ...pair("biceps", "M46,128 L64,122 C66,140 62,156 58,164 L44,162 C40,150 42,138 46,128 Z"),
  { m: "abs", d: "M82,134 L118,134 C120,160 118,190 112,206 L88,206 C82,190 80,160 82,134 Z" },
  ...pair("quads", "M74,214 L98,220 C98,250 96,282 92,300 L76,300 C68,276 66,240 74,214 Z"),
  ...pair("calves", "M76,312 L92,312 C94,332 92,352 88,370 L80,370 C74,352 72,332 76,312 Z"),
];
const BACK: Part[] = [
  ...pair("shoulders", "M62,92 C50,96 44,110 46,124 L66,118 C68,106 70,98 76,94 Z"),
  { m: "upperBack", d: "M78,90 L122,90 C130,100 128,118 118,128 L82,128 C72,118 70,100 78,90 Z" },
  ...pair("lats", "M70,124 L98,132 L98,188 C86,186 76,172 72,156 C68,144 68,132 70,124 Z"),
  ...pair("triceps", "M46,128 L64,122 C66,140 62,156 58,164 L44,162 C40,150 42,138 46,128 Z"),
  ...pair("glutes", "M74,196 L99,198 L99,232 C88,236 76,232 70,222 C68,210 70,202 74,196 Z"),
  ...pair("hamstrings", "M72,238 L98,240 C98,264 96,284 92,300 L76,300 C70,282 68,258 72,238 Z"),
  ...pair("calves", "M76,312 L92,312 C96,330 94,352 88,370 L80,370 C72,352 72,330 76,312 Z"),
];
const BODY = "M100,20 C112,20 118,30 118,44 C118,58 112,68 106,72 L106,80 C120,84 140,86 150,94 C160,102 160,124 158,140 L156,168 L148,200 L136,198 L142,166 L140,136 L134,190 L130,210 L122,300 L116,372 L100,374 L100,230 L100,374 L84,372 L78,300 L70,210 L66,190 L60,136 L58,166 L64,198 L52,200 L44,168 L42,140 C40,124 40,102 50,94 C60,86 80,84 94,80 L94,72 C88,68 82,58 82,44 C82,30 88,20 100,20 Z";

interface MuscleHeatmapProps {
  logs?: WorkoutLog[] | any[];
  className?: string;
}

export function MuscleHeatmap({ logs = [], className = "" }: MuscleHeatmapProps) {
  const sets = useMemo(() => weeklyMuscleSets(logs), [logs]);
  const [view, setView] = useState<"front" | "back">("front");
  const [sel, setSel] = useState<Muscle | null>(null);
  const parts = view === "front" ? FRONT : BACK;
  const zone = sel ? zoneFor(sets[sel]) : null;

  return (
    <section className={`oled-panel relative w-full max-w-full overflow-hidden rounded-2xl border border-white/10 p-4 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-lime">Anatomy Stimulus</p>
          <p className="text-xs font-bold text-white">7-Day Volume Heatmap</p>
        </div>
        <div className="flex rounded-full border border-white/10 p-0.5 bg-black/60">
          {(["front", "back"] as const).map(v => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() => { setView(v); setSel(null); }}
              className={`min-h-8 rounded-full px-3 text-xs font-bold capitalize transition-colors ${view === v ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}
            >
              {v} View
            </button>
          ))}
        </div>
      </div>

      <div className="relative mx-auto mt-3 w-full max-w-[240px]" onClick={() => setSel(null)}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.svg
            key={view}
            viewBox="0 0 200 390"
            className="block h-auto w-full filter drop-shadow-lg"
            role="img"
            aria-label={`${view} muscle heatmap`}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.25 }}
          >
            <defs>
              <filter id="mh-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path d={BODY} fill="#0B0F14" stroke="#1F2937" strokeWidth="1.5" />
            {parts.map((p, i) => {
              const z = zoneFor(sets[p.m]);
              const c = ZONE_COLOR[z];
              const isSelected = sel === p.m;
              return (
                <path
                  key={i}
                  d={p.d}
                  role="button"
                  aria-label={MUSCLES[p.m]}
                  tabIndex={0}
                  onClick={e => { e.stopPropagation(); setSel(p.m); }}
                  onKeyDown={e => e.key === "Enter" && setSel(p.m)}
                  fill={z === "untrained" ? "transparent" : c}
                  fillOpacity={z === "untrained" ? 1 : 0.85}
                  stroke={isSelected ? "#FFFFFF" : z === "untrained" ? "#1F2937" : c}
                  strokeWidth={isSelected ? 2 : 1.2}
                  filter={z === "optimal" ? "url(#mh-glow)" : undefined}
                  className="cursor-pointer outline-none transition-all hover:opacity-100"
                />
              );
            })}
          </motion.svg>
        </AnimatePresence>

        <AnimatePresence>
          {sel && zone && (
            <motion.div
              key={sel}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute inset-x-0 bottom-2 mx-auto w-[94%] rounded-xl border border-white/15 bg-black/95 p-3 text-center backdrop-blur-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-sm font-black italic text-white">{MUSCLES[sel]}</p>
              <p className="font-mono text-lg font-bold mt-0.5" style={{ color: ZONE_COLOR[zone] === "#1F2937" ? "#9CA3AF" : ZONE_COLOR[zone] }}>
                {sets[sel]} / {WEEKLY_TARGET} sets
              </p>
              <span
                className="mt-1 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                style={{ borderColor: ZONE_COLOR[zone], color: zone === "untrained" ? "#9CA3AF" : ZONE_COLOR[zone] }}
              >
                {statusFor(zone)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] font-semibold text-gray-400">
        {([["0", "#1F2937"], ["1-5", "#0E7490"], ["6-12", "#32FF32"], ["13-18", "#10B981"], ["19+", "#F43F5E"]] as const).map(([l, c]) => (
          <span key={l} className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: c }} />
            <span>{l} sets</span>
          </span>
        ))}
      </div>
    </section>
  );
}
