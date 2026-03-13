
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Calendar, Target, Loader2, ChevronDown, Trophy, History } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LiftRecord {
    id: string;
    exercise_name: string;
    weight: number;
    reps: number;
    estimated_1rm: number;
    created_at: string;
}

export default function LiftProgressChart({ userId }: { userId: string }) {
    const [history, setHistory] = useState<LiftRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedExercise, setSelectedExercise] = useState<string>('');
    const [exercises, setExercises] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        async function fetchHistory() {
            if (!userId) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
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
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <Target className="text-blue-400 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Focus Exercise</p>
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
                    <div className="bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/20 rounded-[2rem] p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Trophy size={16} className="text-blue-400" />
                            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">All-Time PR</p>
                        </div>
                        <h4 className="text-2xl font-black text-white">{stats.allTimeBest.toFixed(1)} <span className="text-xs font-medium text-gray-500">lbs</span></h4>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-transparent border border-green-500/20 rounded-[2rem] p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp size={16} className="text-green-400" />
                            <p className="text-[10px] font-black text-green-300 uppercase tracking-widest">Total Growth</p>
                        </div>
                        <h4 className="text-2xl font-black text-white">+{stats.pctIncrease}%</h4>
                    </div>
                </div>
            )}

            {/* The Graph */}
            <div className="bg-oled border border-gray-800 rounded-[2.5rem] p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-white">Progress Graph</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full">
                        <Calendar size={12} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400">Total Entries: {chartData.length}</span>
                    </div>
                </div>

                {chartConfig ? (
                    <div className="relative aspect-[2/1] w-full">
                        <svg viewBox={`0 0 ${chartConfig.w} ${chartConfig.h}`} className="w-full h-full overflow-visible">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            
                            {/* Grid Lines (simplified) */}
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
                                stroke="#3B82F6" 
                                strokeWidth="3" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                            />

                            {/* Data Points */}
                            {chartConfig.points.map((p, i) => (
                                <motion.g
                                    key={i}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5 + (i * 0.05) }}
                                >
                                    <circle cx={p.x} cy={p.y} r="6" fill="#3B82F6" stroke="#000" strokeWidth="2" />
                                    {/* Optional: Value label on hover or some points */}
                                    {i === chartConfig.points.length - 1 && (
                                        <text x={p.x} y={p.y - 12} textAnchor="middle" className="fill-white text-[10px] font-black">
                                            {p.val.toFixed(0)}
                                        </text>
                                    )}
                                </motion.g>
                            ))}
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
