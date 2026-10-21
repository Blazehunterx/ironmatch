import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Award, ChevronRight } from "lucide-react";

export const RANKS = [
  { name: "Freshman", icon: "🌱", min: 0, tier: "freshman" as const, desc: "Building base strength & neurological adaptations" },
  { name: "Grinder", icon: "⚙️", min: 200, tier: "grinder" as const, desc: "Consistent progression through linear overload" },
  { name: "Contender", icon: "🥊", min: 350, tier: "contender" as const, desc: "Intermediate lifter with formidable compound strength" },
  { name: "Athlete", icon: "🏋️", min: 475, tier: "athlete" as const, desc: "Advanced total approaching 3x bodyweight coefficients" },
  { name: "Beast", icon: "🔥", min: 600, tier: "beast" as const, desc: "Elite raw power surpassing regional standards" },
  { name: "Legend", icon: "👑", min: 725, tier: "legend" as const, desc: "Mythic strength tier with national hall of fame recognition" },
] as const;

export type RankTier = (typeof RANKS)[number]["tier"];
export const KG_TO_LB = 2.20462;

export function rankFor(totalKg: number) {
  let i = 0;
  RANKS.forEach((r, idx) => { if (totalKg >= r.min) i = idx; });
  const next = RANKS[i + 1];
  const cur = RANKS[i]!;
  return { ...cur, index: i, next, progress: next ? Math.min(1, Math.max(0, (totalKg - cur.min) / (next.min - cur.min))) : 1 };
}

type Palette = { a: string; b: string; c: string; glow: string; label: string };
const PAL: Record<RankTier, Palette> = {
  freshman: { a: "#9CA3AF", b: "#4B5563", c: "#1F2937", glow: "#9CA3AF", label: "I" },
  grinder: { a: "#E3A869", b: "#8C5A2B", c: "#3B2412", glow: "#D97745", label: "II" },
  contender: { a: "#60A5FA", b: "#1D4ED8", c: "#0B1B4D", glow: "#3B82F6", label: "III" },
  athlete: { a: "#32FF32", b: "#059669", c: "#022C1C", glow: "#32FF32", label: "IV" },
  beast: { a: "#FDE68A", b: "#F59E0B", c: "#5A3505", glow: "#F59E0B", label: "V" },
  legend: { a: "#C4B5FD", b: "#7C3AED", c: "#0A0612", glow: "#8B5CF6", label: "VI" },
};

const SIZES = { sm: 30, md: 54, lg: 96 } as const;

export interface TierBadgeProps {
  tier: RankTier;
  size?: "sm" | "md" | "lg";
  isPro?: boolean;
  className?: string;
}

export function TierBadge({ tier, size = "md", isPro = false, className = "" }: TierBadgeProps) {
  const p = PAL[tier] || PAL.freshman;
  const px = SIZES[size];
  const id = `rb-${tier}`;

  const svg = (
    <svg viewBox="0 0 100 100" width={px} height={px} role="img" aria-label={`${tier} rank badge`} style={{ filter: `drop-shadow(0 0 ${px / 8}px ${p.glow}99)`, overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}-m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.a} /><stop offset=".5" stopColor={p.b} /><stop offset="1" stopColor={p.c} />
        </linearGradient>
        <radialGradient id={`${id}-core`}><stop offset="0" stopColor={p.b} /><stop offset="1" stopColor={p.c} /></radialGradient>
        <pattern id={`${id}-k`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="2" height="4" fill={p.a} opacity=".18" />
        </pattern>
      </defs>
      {tier === "legend" && (
        <circle cx="50" cy="50" r="47" fill="none" stroke={p.a} strokeWidth="2" strokeDasharray="6 4">
          <animate attributeName="r" values="44;49;44" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;.25;1" dur="2.4s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="12s" repeatCount="indefinite" additive="sum" />
        </circle>
      )}
      <polygon points="50,4 90,27 90,73 50,96 10,73 10,27" fill={`url(#${id}-m)`} stroke={p.a} strokeWidth="2" />
      <polygon points="50,14 81,32 81,68 50,86 19,68 19,32" fill={`url(#${id}-core)`} />
      <polygon points="50,14 81,32 81,68 50,86 19,68 19,32" fill={`url(#${id}-k)`} />
      {tier === "grinder" && <polygon points="50,4 90,27 90,73 50,96 10,73 10,27" fill="none" stroke="#F4A460" strokeWidth=".8" opacity=".9" />}
      {tier === "contender" && (
        <g fill="#000" opacity=".55">
          <rect x="22" y="47" width="10" height="6" /><rect x="68" y="47" width="10" height="6" />
          <polygon points="50,18 55,26 45,26" /><polygon points="50,82 55,74 45,74" />
        </g>
      )}
      {tier === "athlete" && (
        <polygon points="50,14 81,32 81,68 50,86 19,68 19,32" fill="none" stroke="#32FF32" strokeWidth="1.5">
          <animate attributeName="opacity" values=".4;1;.4" dur="1.8s" repeatCount="indefinite" />
        </polygon>
      )}
      {/* barbell glyph */}
      <g fill={p.a}>
        <rect x="28" y="48" width="44" height="4" rx="1" />
        <rect x="32" y="38" width="5" height="24" rx="1" /><rect x="63" y="38" width="5" height="24" rx="1" />
        <rect x="26" y="42" width="4" height="16" rx="1" /><rect x="70" y="42" width="4" height="16" rx="1" />
      </g>
      <text x="50" y="80" textAnchor="middle" fontSize="11" fontWeight="900" fontStyle="italic" fill={p.a}>{p.label}</text>
      {tier === "beast" && [18, 50, 82, 30, 70].map((x, i) => (
        <circle key={i} cx={x} r="1.6" fill="#FDE68A">
          <animate attributeName="cy" values="95;5" dur={`${1.6 + i * 0.35}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;0" dur={`${1.6 + i * 0.35}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );

  if (!isPro) return <span className={`inline-flex shrink-0 ${className}`}>{svg}</span>;
  return (
    <span className={`relative inline-flex shrink-0 overflow-hidden rounded-full p-[2px] ${className}`}>
      <span aria-hidden className="absolute inset-[-50%] animate-spin" style={{ animationDuration: "6s", background: `conic-gradient(${p.a}, ${p.glow}, transparent, ${p.a})` }} />
      <span className="relative rounded-full bg-black p-0.5">{svg}</span>
    </span>
  );
}

const lb = (kg: number) => Math.round(kg * KG_TO_LB);

export function RankDetailModal({
  open,
  onClose,
  totalKg = 380,
  isPro = false
}: {
  open: boolean;
  onClose: () => void;
  totalKg?: number;
  isPro?: boolean;
}) {
  const r = rankFor(totalKg);
  const tier = RANKS[r.index]!.tier;
  const pct = Math.round(r.progress * 100);
  const need = r.next ? Math.max(0, r.next.min - totalKg) : 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed inset-x-4 top-[15%] z-50 max-w-sm mx-auto bg-oled border border-white/15 rounded-3xl p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-lime" />
                <h3 className="font-black text-white text-base tracking-wide uppercase">{r.name} Rank</h3>
              </div>
              <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white bg-white/5">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center py-4">
              <TierBadge tier={tier} size="lg" isPro={isPro} />
              <p className="mt-3 text-xs text-gray-400 text-center max-w-[260px] leading-relaxed">{r.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center mb-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Big 4 Total</p>
                <p className="font-mono text-lg font-black text-lime mt-0.5">{Math.round(totalKg)} kg</p>
                <p className="text-[10px] text-gray-500 font-mono">{lb(totalKg)} lbs</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">{r.next ? `${r.next.name} Target` : "Peak Tier"}</p>
                <p className="font-mono text-lg font-black text-white mt-0.5">{r.next ? `${r.next.min} kg` : "MAX"}</p>
                <p className="text-[10px] text-gray-500 font-mono">{r.next ? `${lb(r.next.min)} lbs` : "Legend Reached"}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1.5 flex justify-between text-xs font-bold">
                <span className="text-gray-400">Rank Progress</span>
                <span className="text-lime font-mono">{pct}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-lime to-emerald-400 transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              {r.next && (
                <p className="text-center text-xs font-bold text-amber-400 mt-2">
                  +{Math.ceil(need)} kg ({lb(need)} lbs) to unlock {r.next.name}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
              {RANKS.map((x, i) => (
                <span key={x.tier} className={i <= r.index ? "scale-100" : "opacity-25 grayscale scale-90"}>
                  <TierBadge tier={x.tier} size="sm" />
                </span>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function RankPill({
  totalKg = 380,
  isPro = false,
  className = ""
}: {
  totalKg?: number;
  isPro?: boolean;
  className?: string;
}) {
  const r = rankFor(totalKg);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-full border border-lime/30 bg-lime/10 py-1 pl-1 pr-3 text-xs font-bold text-lime hover:border-lime/60 transition-all active:scale-95 ${className}`}
      >
        <TierBadge tier={r.tier} size="sm" isPro={isPro} />
        <span>{r.name}</span>
        <ChevronRight size={12} className="text-lime/60" />
      </button>
      <RankDetailModal open={open} onClose={() => setOpen(false)} totalKg={totalKg} isPro={isPro} />
    </>
  );
}
