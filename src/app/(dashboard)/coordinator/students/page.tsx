"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Users, TrendingDown, MessageSquare, Mail, Phone, ExternalLink, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function CoordinatorWeakStudentsPage() {
    const riskStudents = [
        { name: "Rahul Sharma", id: "STU001", attendance: 65, avgScore: 42, risk: "HIGH", batch: "Java Fullstack A1" },
        { name: "Priya Patel", id: "STU042", attendance: 68, avgScore: 48, risk: "MEDIUM", batch: "Python Dev B2" },
        { name: "Anish Kumar", id: "STU108", attendance: 71, avgScore: 35, risk: "HIGH", batch: "Java Fullstack A1" },
        { name: "Sanya Singh", id: "STU015", attendance: 58, avgScore: 55, risk: "MEDIUM", batch: "Data Science D1" },
    ];

    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">Academic Risk Panel</h1>
                <p className="text-slate-500 font-medium italic">Identify and intervene with students showing declining engagement or performance.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Risk Summary */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-2xl rounded-[3rem] bg-rose-600 text-white p-10 relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                             <div className="flex items-center gap-3">
                                <AlertTriangle className="h-10 w-10 text-rose-200" />
                                <h2 className="text-2xl font-black italic tracking-tighter uppercase">High Risk Alerts</h2>
                             </div>
                             <p className="text-5xl font-black italic tracking-tighter">14</p>
                             <p className="text-xs font-black uppercase tracking-widest opacity-70">Students below 70% threshold</p>
                             <Button className="w-full h-14 bg-white text-rose-600 rounded-2xl font-black uppercase tracking-widest hover:bg-rose-50 transition-all shadow-xl shadow-rose-900/20">
                                Initiate Batch Outreach
                             </Button>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    </Card>

                    <Card className="border-0 shadow-lg rounded-[2.5rem] p-8 bg-white dark:bg-slate-950">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Risk Distribution</h3>
                        <div className="space-y-6">
                            {[
                                { label: "Attendance Default", count: 8, color: "bg-amber-500" },
                                { label: "Performance Decline", count: 6, color: "bg-rose-500" },
                                { label: "Low Assignment Submission", count: 12, color: "bg-orange-500" },
                            ].map((stat, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span>{stat.label}</span>
                                        <span>{stat.count} Students</span>
                                    </div>
                                    <div className={cn("h-1.5 w-full bg-slate-100 rounded-full", stat.color)} />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Risk List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-rose-500" /> At-risk Student List
                        </h3>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-slate-200">Current Cycle</Badge>
                    </div>

                    <div className="grid gap-4">
                        {riskStudents.map((student, i) => (
                            <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-all rounded-[2rem] overflow-hidden bg-white dark:bg-slate-950 group">
                                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden shrink-0">
                                             <User className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">{student.name}</h4>
                                                <Badge variant={student.risk === 'HIGH' ? 'destructive' : 'outline'} className="text-[8px] font-black h-4 px-1">{student.risk} RISK</Badge>
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{student.id} • {student.batch}</p>
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex items-center gap-8 border-l border-slate-100 dark:border-slate-800 pl-8">
                                        <div className="text-center">
                                            <p className="text-xl font-black italic tracking-tighter text-amber-600">{student.attendance}%</p>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Attendance</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xl font-black italic tracking-tighter text-rose-600">{student.avgScore}%</p>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Avg Score</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="ghost" className="h-10 w-10 text-cyan-600 hover:bg-cyan-50 rounded-xl">
                                                <Mail className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:bg-slate-50 rounded-xl">
                                                <Phone className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="pt-4 flex justify-center">
                         <Button variant="ghost" className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                            Load 24 More Records &darr;
                         </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
