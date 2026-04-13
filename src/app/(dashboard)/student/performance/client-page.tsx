"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Award, Calendar, ChevronRight, Zap, Target, BookOpen, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function StudentPerformanceClientPage({ data }: { data: any }) {
    const { results, stats } = data;

    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">Growth Analytics</h1>
                <p className="text-slate-500 font-medium italic">Visualize your academic journey and competency milestones.</p>
            </div>

            {/* Top Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "AVG. SCORE", value: `${stats.avgMarks}%`, sub: "Across all tests", icon: Target, color: "text-cyan-600", bg: "bg-cyan-50" },
                    { label: "ATTENDANCE", value: `${stats.attendanceRate}%`, sub: "Session participation", icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "SUBJECTS", value: stats.subjectsMastered, sub: "Currently active", icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "ASSESSMENTS", value: stats.totalTests, sub: "Completed to date", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
                ].map((stat, i) => (
                    <Card key={i} className="border-0 shadow-lg rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all">
                        <CardContent className="p-8 space-y-4">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12", stat.bg)}>
                                <stat.icon className={cn("h-6 w-6", stat.color)} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black italic tracking-tighter">{stat.value}</h1>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
                                <p className="text-[10px] text-slate-400 italic mt-0.5">{stat.sub}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Result Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-cyan-600" /> Recent Assessments
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {results.length === 0 ? (
                             <Card className="border-0 shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-950 p-12 text-center">
                                <BarChart3 className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold italic">No assessment data found yet.</p>
                             </Card>
                        ) : (
                            results.map((r: any) => {
                                const percentage = Math.round((r.marksObtained / r.test.totalMarks) * 100);
                                return (
                                    <div key={r.id} className="group relative">
                                        <div className="absolute left-4 top-0 bottom-0 w-1 bg-slate-100 dark:bg-slate-900 group-last:bg-transparent" />
                                        <div className="relative pl-12 pb-8">
                                            <div className="absolute left-0 top-1 w-9 h-9 rounded-xl bg-white dark:bg-slate-950 shadow-md border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center z-10">
                                                <div className={cn("w-2 h-2 rounded-full", percentage >= 70 ? "bg-emerald-500" : percentage >= 40 ? "bg-amber-500" : "bg-red-500")} />
                                            </div>
                                            <Card className="border-0 shadow-sm hover:shadow-xl transition-all rounded-[1.5rem] bg-white dark:bg-slate-950 overflow-hidden">
                                                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center">
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="secondary" className="text-[9px] uppercase font-black tracking-widest bg-slate-100">{r.test.subject.code}</Badge>
                                                            <span className="text-xs font-bold text-slate-400">{format(new Date(r.createdAt), "MMM dd, yyyy")}</span>
                                                        </div>
                                                        <h4 className="text-xl font-black tracking-tight uppercase leading-tight">{r.test.title}</h4>
                                                        <p className="text-sm font-medium text-slate-500 italic">Score: {r.marksObtained} / {r.test.totalMarks}</p>
                                                    </div>
                                                    <div className="shrink-0 flex items-center gap-6">
                                                        <div className="text-center">
                                                            <p className="text-2xl font-black italic tracking-tighter text-cyan-600">{percentage}%</p>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yield</p>
                                                        </div>
                                                        <div className="h-12 w-px bg-slate-100 dark:bg-slate-800" />
                                                        <div className="text-center">
                                                            <p className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white">{r.grade || "N/A"}</p>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grade</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Side Analytics */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-lg rounded-[2.5rem] bg-slate-900 text-white p-8 overflow-hidden relative">
                         <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <Award className="h-8 w-8 text-amber-400" />
                                <h3 className="text-xl font-black italic tracking-tighter uppercase">Excellence Hub</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                                        <span className="opacity-70">Core Proficiency</span>
                                        <span className="text-amber-400">{stats.avgMarks}%</span>
                                    </div>
                                    <Progress value={stats.avgMarks} className="h-1.5 bg-white/10" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                                        <span className="opacity-70">Engagement Rate</span>
                                        <span className="text-cyan-400">{stats.attendanceRate}%</span>
                                    </div>
                                    <Progress value={stats.attendanceRate} className="h-1.5 bg-white/10" />
                                </div>
                            </div>
                            <Button className="w-full h-14 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all">
                                Request Transcript
                            </Button>
                         </div>
                         <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    </Card>

                    <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Competency Radar</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Tech Quizzes", val: "High" },
                                { label: "Soft Skills", val: "Ideal" },
                                { label: "Project Del.", val: "Excel." },
                                { label: "Attendance", val: "Good" },
                            ].map((item, i) => (
                                <div key={i} className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                                    <p className="text-sm font-black italic text-slate-900 dark:text-white">{item.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


