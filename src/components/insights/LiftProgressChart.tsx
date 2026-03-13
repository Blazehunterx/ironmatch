import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Calendar, Target, Loader2, ChevronDown, Trophy, History, Zap, Sparkles, Flame } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface LiftRecord {
    id: string;
    exercise_name: string;
    weight: number;
    reps: number;
    estimated_1rm: number;
    created_at: string;
}

const CHART_THEMES: Record<string, any> = {
    default: {
        primary: '#3B82F6',
        secondary: '#60A5FA',
        glow: 'rgba(59, 130, 246, 0.4)',
        bg: 'bg-oled',
        areaGradient: ['rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0)'],
        filter: '',
        icon: <Target className="text-blue-400 w-5 h-5" />,
        markerUrl: null,
    },
    one_piece: {
        primary: '#EAB308', // Gold
        secondary: '#0EA5E9', // Ocean Blue
        glow: 'rgba(234, 179, 8, 0.6)',
        bg: 'bg-gradient-to-b from-blue-900/40 to-oled',
        areaGradient: ['rgba(14, 165, 233, 0.4)', 'rgba(2, 6, 23, 0)'],
        filter: 'url(#hakiGlow)',
        icon: <Zap className="text-yellow-400 w-5 h-5 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />,
        markerUrl: '/assets/markers/luffy.png',
    },
    dbz: {
        primary: '#FACC15', // Electric Yellow
        secondary: '#F97316', // Aura Orange
        glow: 'rgba(250, 204, 21, 0.8)',
        bg: 'bg-oled',
        areaGradient: ['rgba(250, 204, 21, 0.3)', 'rgba(250, 204, 21, 0)'],
        filter: 'url(#superSaiyanFilter)',
        icon: <Flame className="text-yellow-400 w-5 h-5 animate-pulse" />,
        markerUrl: '/assets/markers/goku.png',
    },
    naruto: {
        primary: '#DC2626', // Sharingan Red
        secondary: '#000000', // Uchiha Black
        glow: 'rgba(220, 38, 38, 0.5)',
        bg: 'bg-gradient-to-br from-red-950/20 via-oled to-oled',
        areaGradient: ['rgba(220, 38, 38, 0.3)', 'rgba(0, 0, 0, 0)'],
        filter: 'url(#sharinganBlur)',
        icon: <Sparkles className="text-red-500 w-5 h-5" />,
        markerUrl: '/assets/markers/naruto.png',
    },
    aot: {
        primary: '#94A3B8', // Steel
        secondary: '#15803D', // Forest Green
        glow: 'rgba(148, 163, 184, 0.4)',
        bg: 'bg-gradient-to-tr from-green-950/30 to-oled',
        areaGradient: ['rgba(21, 128, 61, 0.3)', 'rgba(0, 0, 0, 0)'],
        filter: 'url(#titanHardening)',
        icon: <Zap className="text-slate-400 w-5 h-5" />,
        markerUrl: '/assets/markers/titan.png',
    },
    bleach: {
        primary: '#FFFFFF', // Spiritual White
        secondary: '#000000', // Shinigami Black
        glow: 'rgba(255, 255, 255, 0.4)',
        bg: 'bg-gradient-to-b from-gray-900 via-oled to-oled',
        areaGradient: ['rgba(255, 255, 255, 0.2)', 'rgba(0, 0, 0, 0)'],
        filter: 'url(#hakiGlow)',
        icon: <Zap className="text-white w-5 h-5" />,
        markerUrl: '/assets/markers/ichigo.png',
    },
    demon_slayer: {
        primary: '#0EA5E9', // Water Blue
        secondary: '#94A3B8', // Nichirin Steel
        glow: 'rgba(14, 165, 233, 0.6)',
        bg: 'bg-gradient-to-r from-blue-950/40 to-oled',
        areaGradient: ['rgba(14, 165, 233, 0.3)', 'rgba(0, 0, 0, 0)'],
        filter: 'url(#hakiGlow)',
        icon: <Sparkles className="text-blue-400 w-5 h-5" />,
        markerUrl: '/assets/markers/tanjiro.png',
    },
    jjk: {
        primary: '#A855F7', // Void Purple
        secondary: '#3B82F6', // Cursed Blue
        glow: 'rgba(168, 85, 247, 0.6)',
        bg: 'bg-gradient-to-br from-purple-950/30 via-oled to-oled',
        areaGradient: ['rgba(168, 85, 247, 0.3)', 'rgba(0, 0, 0, 0)'],
        filter: 'url(#superSaiyanFilter)',
        icon: <Zap className="text-purple-400 w-5 h-5" />,
        markerUrl: '/assets/markers/gojo.png',
    },
    mha: {
        primary: '#10B981', // Hero Green
        secondary: '#EAB308', // One For All Yellow
        glow: 'rgba(16, 185, 129, 0.6)',
        bg: 'bg-gradient-to-tr from-green-950/30 to-oled',
        areaGradient: ['rgba(16, 185, 129, 0.3)', 'rgba(0, 0, 0, 0)'],
        filter: 'url(#superSaiyanFilter)',
        icon: <Flame className="text-green-400 w-5 h-5" />,
        markerUrl: '/assets/markers/deku.png',
    },
    hxh: {
        primary: '#22C55E', // Nen Green
        secondary: '#3B82F6', // Hunter Blue
        glow: 'rgba(34, 197, 94, 0.5)',
        bg: 'bg-gradient-to-bl from-green-950/20 via-oled to-oled',
        areaGradient: ['rgba(34, 197, 94, 0.2)', 'rgba(0, 0, 0, 0)'],
        filter: 'url(#hakiGlow)',
        icon: <Target className="text-green-500 w-5 h-5" />,
        markerUrl: '/assets/markers/gon.png',
    },
    solo_leveling: {
        primary: '#7C3AED', // Monarch Purple
        secondary: '#000000', // Shadow Black
        glow: 'rgba(124, 58, 237, 0.7)',
        bg: 'bg-gradient-to-b from-purple-950/50 to-oled',
        areaGradient: ['rgba(124, 58, 237, 0.4)', 'rgba(0, 0, 0, 0)'],
        filter: 'url(#superSaiyanFilter)',
        icon: <Zap className="text-purple-600 w-5 h-5 animate-pulse" />,
        markerUrl: '/assets/markers/jinwoo.png',
    }
};

export default function LiftProgressChart({ userId }: { userId: string }) {
    const { user } = useAuth();
    const [history, setHistory] = useState<LiftRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedExercise, setSelectedExercise] = useState<string>('');
    const [exercises, setExercises] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const activeTheme = useMemo(() => {
        const skinKey = user?.active_graph_skin || 'default';
        return CHART_THEMES[skinKey] || CHART_THEMES.default;
    }, [user?.active_graph_skin]);

    useEffect(() => {
        async function fetchHistory() {
            if (!userId) return;
            setLoading(true);
            try {
                const { data } = await supabase
                    .from('lift_history')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: true });

                if (data) {
                    setHistory(data);
                    const uniqueExercises = Array.from(new Set(data.map(d => d.exercise_name)));
                    setExercises(uniqueExercises);
                    if (uniqueExercises.length > 0 && !selectedExercise) {
                        setSelectedExercise(uniqueExercises[0]);
                    }
                }
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, [userId]);

    const chartData = useMemo(() => {
        return history.filter(d => d.exercise_name === selectedExercise);
    }, [history, selectedExercise]);

    const stats = useMemo(() => {
        if (chartData.length === 0) return null;
        const allTimeBest = Math.max(...chartData.map(d => d.estimated_1rm));
        const first = chartData[0].estimated_1rm;
        const last = chartData[chartData.length - 1].estimated_1rm;
        const increase = last - first;
        const pctIncrease = ((increase / first) * 100).toFixed(1);
        return { allTimeBest, increase, pctIncrease };
    }, [chartData]);

    const chartConfig = useMemo(() => {
        if (chartData.length < 2) return null;

        const padding = 40;
        const w = 400; // Viewbox width
        const h = 200; // Viewbox height

        const weights = chartData.map(d => d.estimated_1rm);
        const minW = Math.min(...weights) * 0.95;
        const maxW = Math.max(...weights) * 1.05;
        const range = maxW - minW || 1;

        const points = chartData.map((d, i) => ({
            x: padding + (i * (w - padding * 2) / (chartData.length - 1)),
            y: h - padding - (((d.estimated_1rm - minW) / range) * (h - padding * 2)),
            val: d.estimated_1rm
        }));

        // Generate smooth path (bézier)
        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const controlX = p0.x + (p1.x - p0.x) / 2;
            path += ` C ${controlX} ${p0.y}, ${controlX} ${p1.y}, ${p1.x} ${p1.y}`;
        }

        const areaPath = `${path} L ${points[points.length - 1].x} ${h - padding} L ${points[0].x} ${h - padding} Z`;

        return { points, path, areaPath, w, h, padding };
    }, [chartData]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-900/40 rounded-[2.5rem] border border-gray-800/50 backdrop-blur-sm">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-400 font-medium text-sm">Synchronizing your gains...</p>
            </div>
        );
    }

    if (exercises.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-900/40 rounded-[2.5rem] border border-gray-800/50 backdrop-blur-sm">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <History className="text-blue-400 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Tracking History Yet</h3>
                <p className="text-gray-400 text-sm max-w-[240px] mx-auto leading-relaxed">
                    Complete your first workout to start generating your progress insights.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Exercise Selector */}
            <div className="relative">
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between px-6 py-4 bg-gray-900 border border-gray-800 rounded-2xl text-left transition-all active:scale-[0.98]"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${activeTheme.primary}20` }}>
                            {activeTheme.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: activeTheme.primary }}>Focus Exercise</p>
                            <p className="text-white font-bold">{selectedExercise}</p>
                        </div>
                    </div>
                    <ChevronDown className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isDropdownOpen && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsDropdownOpen(false)}
                                className="fixed inset-0 z-40"
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -10 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto"
                            >
                                {exercises.map(ex => (
                                    <button
                                        key={ex}
                                        onClick={() => { setSelectedExercise(ex); setIsDropdownOpen(false); }}
                                        className={`w-full px-6 py-4 text-left font-bold transition-colors border-b border-gray-800 last:border-0 ${selectedExercise === ex ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:bg-gray-800'}`}
                                    >
                                        {ex}
                                    </button>
                                ))}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Performance Stats */}
            {stats && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-[2rem] p-5 transition-all" style={{ background: `linear-gradient(135deg, ${activeTheme.primary}15, transparent)`, borderColor: `${activeTheme.primary}20` }}>
                        <div className="flex items-center gap-2 mb-3">
                            <Trophy size={16} style={{ color: activeTheme.primary }} />
                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: activeTheme.primary }}>All-Time PR</p>
                        </div>
                        <h4 className="text-2xl font-black text-white">{stats.allTimeBest.toFixed(1)} <span className="text-xs font-medium text-gray-500">lbs</span></h4>
                    </div>
                    <div className="border rounded-[2rem] p-5 transition-all" style={{ background: `linear-gradient(135deg, ${activeTheme.secondary}15, transparent)`, borderColor: `${activeTheme.secondary}20` }}>
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp size={16} style={{ color: activeTheme.secondary }} />
                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: activeTheme.secondary }}>Total Growth</p>
                        </div>
                        <h4 className="text-2xl font-black text-white">+{stats.pctIncrease}%</h4>
                    </div>
                </div>
            )}

            {/* The Graph */}
            <div className={`${activeTheme.bg} border border-gray-800 rounded-[2.5rem] p-6 overflow-hidden transition-all duration-700`}>
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Progress Graph</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full">
                        <Calendar size={12} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400">Entries: {chartData.length}</span>
                    </div>
                </div>

                {chartConfig ? (
                    <div className="relative aspect-[2/1] w-full">
                        <svg viewBox={`0 0 ${chartConfig.w} ${chartConfig.h}`} className="w-full h-full overflow-visible">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={activeTheme.primary} stopOpacity="0.5" />
                                    <stop offset="100%" stopColor={activeTheme.primary} stopOpacity="0" />
                                </linearGradient>

                                <filter id="hakiGlow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="4" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>

                                <filter id="superSaiyanFilter">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 1  0 1 0 0 1  0 0 1 0 0  0 0 0 18 -7" result="glow" />
                                    <feComposite in="SourceGraphic" in2="glow" operator="over" />
                                </filter>

                                <filter id="sharinganBlur">
                                    <feGaussianBlur stdDeviation="2" />
                                </filter>

                                <filter id="titanHardening">
                                    <feSpecularLighting surfaceScale="5" specularConstant="1" specularExponent="20" lightingColor="#94a3b8">
                                        <fePointLight x="-50" y="-50" z="100" />
                                    </feSpecularLighting>
                                </filter>
                            </defs>
                            
                            {/* Grid Lines */}
                            <line x1={chartConfig.padding} y1={chartConfig.h - chartConfig.padding} x2={chartConfig.w - chartConfig.padding} y2={chartConfig.h - chartConfig.padding} stroke="#1F2937" strokeWidth="1" />
                            
                            {/* Area Fill */}
                            <motion.path 
                                initial={{ opacity: 0, d: chartConfig.areaPath.replace(/[^MLC]\d+/g, '0') }}
                                animate={{ opacity: 1, d: chartConfig.areaPath }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                d={chartConfig.areaPath} 
                                fill="url(#chartGradient)" 
                            />

                            {/* Line Path */}
                            <motion.path 
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.2, ease: 'easeInOut' }}
                                d={chartConfig.path} 
                                fill="none" 
                                stroke={activeTheme.primary} 
                                strokeWidth="4" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                filter={activeTheme.filter}
                            />

                            {/* Data Points */}
                            {chartConfig.points.map((p, i) => {
                                const isLatest = i === chartConfig.points.length - 1;
                                return (
                                    <motion.g
                                        key={i}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5 + (i * 0.05) }}
                                    >
                                        {activeTheme.markerUrl ? (
                                            <>
                                                {/* Halo for latest point */}
                                                {isLatest && (
                                                    <motion.circle 
                                                        cx={p.x} cy={p.y} r="12" 
                                                        fill={activeTheme.primary} 
                                                        fillOpacity="0.2"
                                                        animate={{ r: [12, 16, 12], opacity: [0.2, 0.4, 0.2] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    />
                                                )}
                                                <motion.image 
                                                    href={activeTheme.markerUrl} 
                                                    x={p.x - 10} y={p.y - 10} 
                                                    width="20" height="20" 
                                                    className="rounded-full"
                                                    style={{ filter: isLatest ? 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' : '' }}
                                                    animate={user?.active_graph_skin === 'aot' ? { y: [p.y - 10, p.y - 12, p.y - 10] } : {}}
                                                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                                />
                                            </>
                                        ) : (
                                            <circle cx={p.x} cy={p.y} r="5" fill={activeTheme.primary} stroke="#000" strokeWidth="2" />
                                        )}
                                        
                                        {isLatest && (
                                            <text x={p.x} y={p.y - 15} textAnchor="middle" className="fill-white text-[10px] font-black italic">
                                                {p.val.toFixed(0)}
                                            </text>
                                        )}
                                    </motion.g>
                                );
                            })}
                        </svg>
                    </div>
                ) : (
                    <div className="aspect-[2/1] flex items-center justify-center border-2 border-dashed border-gray-800 rounded-3xl">
                        <p className="text-gray-500 text-sm font-medium">Need at least 2 logs to draw the curve</p>
                    </div>
                )}
            </div>

            <p className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Analytics engine powered by IronMatch Science
            </p>
        </div>
    );
}
