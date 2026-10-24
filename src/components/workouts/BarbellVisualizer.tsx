import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BAR_WEIGHT, platesPerSide, summarize, type BarType, type Unit, type PlateSpec } from "../../lib/plates";

const spring = { type: "spring" as const, stiffness: 350, damping: 25 };
const CY = 90;
const SLEEVE_START = 470; // collar x
const SLEEVE_END = 690;

interface PlacedPlate {
  p: PlateSpec;
  px: number;
  key: string;
}

export function BarbellVisualizer({ initialKg = 60, initialUnit = "kg" }: { initialKg?: number; initialUnit?: Unit }) {
  const [unit, setUnit] = useState<Unit>(initialUnit);
  const [bar, setBar] = useState<BarType>("men");
  const [total, setTotal] = useState(initialUnit === "lbs" && initialKg === 60 ? 135 : initialKg);
  const barW = BAR_WEIGHT[bar][unit];
  const { plates, remainder } = useMemo(() => platesPerSide(total, barW, unit), [total, barW, unit]);
  const steps = unit === "kg" ? [-5, -1, 1, 5] : [-10, -2.5, 2.5, 10];

  const changeUnit = (u: Unit) => {
    if (u === unit) return;
    const conv = u === "lbs" ? total * 2.20462 : total / 2.20462;
    const step = u === "lbs" ? 2.5 : 1;
    setTotal(Math.max(BAR_WEIGHT[bar][u], Math.round(conv / step) * step));
    setUnit(u);
  };
  const changeBar = (b: BarType) => { setBar(b); setTotal(t => Math.max(t, BAR_WEIGHT[b][unit])); };

  let x = SLEEVE_START + 14;
  const placed: PlacedPlate[] = plates.map((p: PlateSpec, i: number) => {
    const px = x;
    x += p.w + 1.5;
    return { p, px, key: `${i}-${p.kg}` };
  });

  const knurl = Array.from({ length: 34 }, (_, i) => 150 + i * 6);

  const barOptions: [BarType, string][] = unit === "lbs"
    ? [
        ["ez", "EZ 25lb"],
        ["women", "35lb"],
        ["men", "Olympic 45lb"],
        ["ssb", "SSB 55lb"]
      ]
    : [
        ["ez", "EZ 10kg"],
        ["women", "15kg"],
        ["men", "Olympic 20kg"],
        ["ssb", "SSB 25kg"]
      ];

  return (
    <section className="oled-panel w-full max-w-full overflow-hidden rounded-2xl border border-white/10 p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex flex-wrap gap-1 p-1 bg-black/60 rounded-xl border border-white/10 w-full sm:w-auto">
          {barOptions.map(([bKey, bLabel]) => (
            <button
              key={bKey}
              type="button"
              onClick={() => changeBar(bKey)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                bar === bKey
                  ? "bg-lime text-black font-extrabold shadow-[0_0_10px_rgba(50,255,50,0.3)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {bLabel}
            </button>
          ))}
        </div>
        <Toggle options={[["kg", "kg"], ["lbs", "lbs"]]} value={unit} onChange={v => changeUnit(v as Unit)} />
      </div>

      <p className="lime-glow mt-4 text-center font-mono text-5xl font-black italic">
        {total}<span className="ml-1 text-2xl">{unit}</span>
      </p>

      <svg viewBox="0 0 720 180" className="mt-3 block h-auto w-full" role="img" aria-label={`Barbell loaded to ${total}${unit}`}>
        <defs>
          <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--steel-hi)" />
            <stop offset="0.5" stopColor="var(--steel)" />
            <stop offset="1" stopColor="var(--steel-lo)" />
          </linearGradient>
        </defs>
        {/* shaft + knurling */}
        <rect x="30" y={CY - 6} width={SLEEVE_START - 30} height="12" rx="2" fill="url(#steel)" />
        {knurl.map(k => <line key={k} x1={k} y1={CY - 6} x2={k + 4} y2={CY + 6} stroke="var(--steel-lo)" strokeWidth="1" opacity="0.7" />)}
        {/* collar */}
        <rect x={SLEEVE_START - 10} y={CY - 18} width="12" height="36" rx="2" fill="url(#steel)" />
        <rect x={SLEEVE_START + 2} y={CY - 12} width="10" height="24" rx="1" fill="url(#steel)" />
        {/* sleeve + end cap */}
        <rect x={SLEEVE_START + 12} y={CY - 10} width={SLEEVE_END - SLEEVE_START - 12} height="20" rx="2" fill="url(#steel)" />
        <rect x={SLEEVE_END - 2} y={CY - 12} width="10" height="24" rx="3" fill="var(--steel-hi)" />
        <AnimatePresence initial={false}>
          {placed.map(({ p, px, key }: PlacedPlate) => (
            <motion.g key={key} initial={{ x: SLEEVE_END - px, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: SLEEVE_END - px, opacity: 0 }} transition={spring}>
              <rect x={px} y={CY - p.h / 2} width={p.w} height={p.h} rx="3" fill={p.color} stroke="var(--plate-edge)" strokeWidth="1" />
              <rect x={px + 1.5} y={CY - p.h / 2 + 4} width="2" height={p.h - 8} rx="1" fill="var(--plate-shine)" />
            </motion.g>
          ))}
        </AnimatePresence>
      </svg>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {steps.map(s => (
          <button key={s} onClick={() => setTotal(t => Math.max(barW, Math.round((t + s) * 100) / 100))}
            className="tap rounded-xl border border-white/10 font-mono text-sm font-bold text-foreground active:scale-95 py-3 text-center">
            {s > 0 ? "+" : ""}{s}{unit}
          </button>
        ))}
      </div>

      <p className="mx-auto mt-4 w-fit max-w-full rounded-full border border-white/10 px-4 py-2 text-center font-mono text-xs text-muted-foreground">
        {plates.length ? `${summarize(plates, unit)} per side` : "Empty bar"}
        {remainder > 0 && ` · ${remainder}${unit}/side not loadable`}
      </p>
    </section>
  );
}

function Toggle({ options, value, onChange }: { options: [string, string][]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex rounded-full border border-white/10 p-0.5">
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} aria-pressed={value === v}
          className={`min-h-9 rounded-full px-3 text-xs font-bold transition-colors ${value === v ? "bg-white text-black" : "text-muted-foreground hover:text-white"}`}>{l}</button>
      ))}
    </div>
  );
}
