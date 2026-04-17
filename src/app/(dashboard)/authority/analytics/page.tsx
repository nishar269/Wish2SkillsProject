"use client";

import { useEffect, useState } from "react";
import { getInstitutionalKPIs } from "@/actions/reports";
import { TrendingUp, Globe, Shield, Target, Activity, BarChart3, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AuthorityAnalyticsPage() {
    const [kpis, setKpis] = useState<Awaited<ReturnType<typeof getInstitutionalKPIs>> | null>(null);

    useEffect(() => {
        getInstitutionalKPIs().then(setKpis);
    }, []);

    if (!kpis) return (
        <div className="p-8 space-y-8 animate-pulse max-w-7xl mx-auto">
            <div className="h-10 w-48 bg-slate-100 rounded-lg" />
            <div className="grid grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className="h-36 bg-slate-100 rounded-2xl" />)}
            </div>
        </div>
    );

    const stats = [
        { 
            label: "Institutional Score", 
            value: `${kpis.institutionalScore}/100`, 
            trend: kpis.institutionalScore > 80 ? "+4% vs Q3" : "Improving", 
            subtitle: "Compliance Index", 
            icon: Target, 
            color: "text-blue-600", 
            bg: "bg-blue-50" 
        },
        { 
            label: "Community Health", 
            value: kpis.healthLabel, 
            trend: `${kpis.totalEngagement} interactions`, 
            subtitle: "Engagement Score", 
            icon: Globe, 
            color: "text-indigo-600", 
            bg: "bg-indigo-50" 
        },
        { 
            label: "Fee Collection", 
            value: `${kpis.collectionEfficiency}%`, 
            trend: "Stable", 
            subtitle: "Revenue Efficiency", 
            icon: Shield, 
            color: "text-emerald-600", 
            bg: "bg-emerald-50" 
        },
    ];

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="premium-shell flex flex-col md:flex-row md:items-end justify-between gap-6 px-6 py-6 md:px-8">
                <div>
                    <div className="premium-kicker border-[#e0d5c4] bg-white/55 text-[#9d7b43] mb-3">
                        <BarChart3 className="h-3.5 w-3.5" /> Executive Analytics
                    </div>
                    <h1 className="premium-title text-5xl text-[#141c2d]">Institutional Overview</h1>
                    <p className="text-[#655742] text-sm font-medium mt-1">Real-time institutional performance metrics and insights.</p>
                </div>
                <Button size="lg" className="text-xs font-semibold">
                    Download Report <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                {stats.map((stat, i) => (
                    <div key={i} className="premium-card p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div className={cn("p-3 rounded-xl", stat.bg)}>
                                <stat.icon className={cn("h-5 w-5", stat.color)} />
                            </div>
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg", stat.bg, stat.color)}>
                                {stat.trend}
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900">{stat.value}</h2>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{stat.subtitle}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Performance Metrics */}
                <div className="lg:col-span-3 premium-card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Performance Metrics</h3>
                            <p className="text-xs text-slate-400 mt-1">Institutional readiness indicators</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        {[
                            { label: "Academic Score", value: kpis.institutionalScore, color: "bg-blue-500" },
                            { label: "Attendance Rate", value: kpis.attendanceRate, color: "bg-indigo-500" },
                            { label: "Engagement Hub Hits", value: kpis.totalEngagement, color: "bg-emerald-500" },
                        ].map((metric, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-600">{metric.label}</span>
                                    <span className="font-bold text-slate-900">{metric.value}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                     <div 
                                        className={cn("h-full rounded-full transition-all duration-1000", metric.color)}
                                        style={{ width: `${metric.label === "Engagement Hub Hits" ? Math.min(metric.value, 100) : metric.value}%` }}
                                     />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Target className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Overall Rating: {kpis.institutionalScore > 80 ? "Excellent" : "Good"}</h4>
                                <p className="text-xs text-slate-400 mt-0.5">Based on academic performance and engagement data</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Insights */}
                <div className="lg:col-span-2 premium-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Key Insights</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-semibold text-slate-400">Live</span>
                        </div>
                    </div>
                    
                    <div className="space-y-5">
                        {[
                            { title: "Academic Performance", desc: `Attendance rate at ${kpis.attendanceRate}% with positive trends.`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
                            { title: "Student Engagement", desc: `Community health rated as ${kpis.healthLabel} with active participation.`, icon: Globe, color: "text-indigo-600", bg: "bg-indigo-50" },
                            { title: "Financial Health", desc: `Fee collection efficiency at ${kpis.collectionEfficiency}%. Revenue on target.`, icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50" },
                        ].map((insight, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", insight.bg)}>
                                    <insight.icon className={cn("h-5 w-5", insight.color)} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{insight.title}</p>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{insight.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-blue-900">AI Insights Available</h4>
                            <p className="text-[10px] text-blue-600 mt-0.5">Powered by Campus Scout</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
