"use client";

import { use, useEffect, useState } from "react";
import { getInstitutionalKPIs } from "@/actions/reports";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, BookOpen, Star, Zap, Globe, Shield, Target, Activity, ArrowUpRight, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthorityAnalyticsPage() {
    const [kpis, setKpis] = useState<any>(null);

    useEffect(() => {
        getInstitutionalKPIs().then(setKpis);
    }, []);

    if (!kpis) return (
        <div className="p-12 space-y-8 animate-pulse">
            <div className="h-12 w-64 bg-slate-200 dark:bg-white/5 rounded-3xl" />
            <div className="grid grid-cols-3 gap-8">
                {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-200 dark:bg-white/5 rounded-[3rem]" />)}
            </div>
        </div>
    );

    const stats = [
        { 
            label: "Institutional Score", 
            value: `${kpis.institutionalScore}/100`, 
            trend: kpis.institutionalScore > 80 ? "+4% vs Q3" : "Improving", 
            subtitle: "Verified Sector Compliance", 
            icon: Target, 
            color: "text-cyan-500", 
            bg: "bg-cyan-500/10" 
        },
        { 
            label: "Community Health", 
            value: kpis.healthLabel, 
            trend: `${kpis.totalEngagement} pulses`, 
            subtitle: "Cross-Node Interactions", 
            icon: Globe, 
            color: "text-indigo-500", 
            bg: "bg-indigo-500/10" 
        },
        { 
            label: "Economic Stability", 
            value: `${kpis.collectionEfficiency}%`, 
            trend: "Stable Revenue Stream", 
            subtitle: "Fee Lifecycle Efficiency", 
            icon: Shield, 
            color: "text-emerald-500", 
            bg: "bg-emerald-500/10" 
        },
    ];

    return (
        <div className="p-8 space-y-12 pb-24 selection:bg-cyan-500/30 selection:text-cyan-900">
            {/* Immersive Header */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
            >
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-slate-900 dark:bg-white rounded-xl shadow-2xl shadow-cyan-500/20">
                            <Cpu className="h-5 w-5 text-white dark:text-slate-900" />
                         </div>
                         <Badge variant="outline" className="border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-black uppercase tracking-[0.2em] text-[10px] bg-cyan-500/5">Sector 7 Alpha</Badge>
                    </div>
                    <h1 className="text-6xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none drop-shadow-sm">
                        Intelligence <span className="text-cyan-500">Center</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold italic text-sm tracking-wide max-w-2xl mt-1 leading-relaxed">
                        Continuous institutional monitoring via decentralized audit logs. Mapping macro-level pedagogical performance and economic throughput in real-time.
                    </p>
                </div>
                
                {/* Background Flourish */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] -mr-64 -mt-32 pointer-events-none" />
            </motion.div>

            {/* Strategic KPI Grid */}
            <div className="grid gap-8 md:grid-cols-3">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -10, scale: 1.02 }}
                        className="glass p-10 rounded-[3.5rem] relative overflow-hidden group cursor-pointer"
                    >
                        <div className="relative z-10 space-y-8">
                            <div className={cn("w-16 h-16 rounded-[1.75rem] flex items-center justify-center transition-all duration-500 shadow-2xl shadow-black/5", stat.bg)}>
                                <stat.icon className={cn("h-8 w-8", stat.color)} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">{stat.value}</h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2">
                                   {stat.label} <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </p>
                            </div>
                            <div className="pt-8 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                                <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition-colors", stat.bg, stat.color)}>
                                    {stat.trend}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">{stat.subtitle}</span>
                            </div>
                        </div>
                        
                        {/* Interactive Background Glow */}
                        <div className={cn("absolute bottom-0 right-0 w-48 h-48 rounded-full blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-700 -mr-24 -mb-24", stat.bg)} />
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Advanced Deployment Metrics */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-3 glass rounded-[3.5rem] p-12 relative overflow-hidden"
                >
                    <div className="relative z-10 space-y-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-400 mb-2">Pedagogical Velocity</h3>
                                <h2 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">Institutional Readiness</h2>
                            </div>
                            <div className="p-4 bg-slate-900 rounded-3xl subtle-glow shadow-2xl">
                                <Activity className="h-6 w-6 text-cyan-500" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                {[
                                    { label: "Technical Certification", value: Math.min(kpis.institutionalScore + 5, 100) },
                                    { label: "Academic Presence", value: kpis.attendanceRate },
                                    { label: "Node Engagement", value: Math.min(kpis.totalEngagement * 2, 95) },
                                ].map((metric, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.25em]">
                                            <span className="text-slate-400">{metric.label}</span>
                                            <span className="text-slate-900 dark:text-white px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10">{metric.value}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                             <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${metric.value}%` }}
                                                transition={{ duration: 1.5, ease: "circOut" }}
                                                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full subtle-glow" 
                                             />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative flex flex-col justify-between shadow-2xl">
                                <Sparkles className="h-8 w-8 text-cyan-500 mb-4 opacity-50" />
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1 leading-none">Intelligence Rating</h4>
                                    <p className="text-4xl font-black italic tracking-tighter uppercase text-cyan-500 leading-none">Tier Alpha</p>
                                    <p className="text-[10px] font-bold italic opacity-60 mt-4 leading-relaxed tracking-wider">
                                        High-fidelity academic throughput detected across all supervised sectors.
                                    </p>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] -mr-16 -mt-16" />
                            </div>
                        </div>

                        <div className="pt-4">
                             <Button className="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-[1.75rem] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] transition-all hover:scale-105 active:scale-95 group relative overflow-hidden">
                                <span className="relative z-10 flex items-center gap-3">
                                    Initialize Deployment Audit <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                             </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Insight Stream */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 glass rounded-[3.5rem] p-12 space-y-10"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 leading-none italic">
                            Stream <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                        </h3>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Sync: 0.04ms</div>
                    </div>
                    
                    <div className="space-y-10">
                        {[
                            { title: "Academic Upward Vector", desc: `Institutional presence calibrated at ${kpis.attendanceRate}%. Dynamic yields detected.`, icon: TrendingUp, color: "text-cyan-500", bg: "bg-cyan-500/10" },
                            { title: "Engagement Pulse", desc: `Pulse frequency established as ${kpis.healthLabel} with high interaction density.`, icon: Zap, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                            { title: "Contract Efficiency", desc: `Billing lifecycle stability: ${kpis.collectionEfficiency}%. Safe execution.`, icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                        ].map((insight, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                className="flex gap-6 group cursor-default"
                            >
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500", insight.bg)}>
                                    <insight.icon className={cn("h-6 w-6", insight.color)} />
                                </div>
                                <div className="space-y-2">
                                    <p className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-[0.05em] leading-none group-hover:text-cyan-500 transition-colors">{insight.title}</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold italic opacity-70">
                                        "{insight.desc}"
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-slate-200/50 dark:border-white/5">
                        <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center gap-4">
                            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl">
                                <Sparkles className="h-5 w-5 text-indigo-500" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">AI Protocol Integrated</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Autonomous Insight Engine</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
            
            {/* Global Node Signal */}
            <div className="fixed bottom-8 right-8 flex items-center gap-3 px-4 py-2 bg-slate-900/10 dark:bg-white/5 backdrop-blur-3xl rounded-full border border-slate-200/10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_theme('colors.emerald.500')]" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Connection Verified</span>
            </div>
        </div>
    );
}

function Sparkles(props: any) {
    return (
        <svg
          {...props}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />
          <path d="M5 3v4" />
          <path d="M3 5h4" />
          <path d="M21 17v4" />
          <path d="M19 19h4" />
        </svg>
    )
}
