"use client";

import { getAdminReportData } from "@/actions/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Database, Download, PieChart, Activity, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type AdminReportData = Exclude<Awaited<ReturnType<typeof getAdminReportData>>, { error: string }>;

export default function AdminReportsClientPage({ data }: { data: AdminReportData }) {
    const { summary, recentActivity, enrollmentByCourse } = data;

    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">Executive Reports</h1>
                    <p className="text-slate-500 font-medium italic">High-level institutional insights and system health metrics.</p>
                </div>
                <Button className="h-12 px-6 bg-slate-900 text-white rounded-xl font-bold gap-2">
                    <Download className="h-4 w-4" /> Export Annual Audit
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total Students", value: summary.students, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Total Faculty", value: summary.faculty, icon: UserCheck, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Active Courses", value: summary.courses, icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Active Batches", value: summary.batches, icon: Database, color: "text-amber-600", bg: "bg-amber-50" },
                ].map((item, i) => (
                    <Card key={i} className="border-0 shadow-lg rounded-[2rem] overflow-hidden">
                        <CardContent className="p-8 flex items-center gap-6">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", item.bg)}>
                                <item.icon className={cn("h-7 w-7", item.color)} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black italic tracking-tighter">{item.value}</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{item.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Course Distribution */}
                <Card className="border-0 shadow-xl rounded-[3rem] bg-white dark:bg-slate-950 overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                            <PieChart className="h-4 w-4 text-cyan-600" /> Enrollment Split
                        </div>
                        <CardTitle className="text-2xl font-black italic tracking-tighter uppercase">By Course</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                        {enrollmentByCourse.map((course, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                    <span className="truncate max-w-[150px]">{course.name}</span>
                                    <span className="text-cyan-600">{course.count}</span>
                                </div>
                                <Progress value={(course.count / summary.students) * 100} className="h-2 bg-slate-100" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Recent Academic Events */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                         <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-rose-500" /> Real-time academic stream
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {recentActivity.map((act) => (
                             <div key={act.id} className="p-6 bg-white dark:bg-slate-950 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-xl">
                                        🎓
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            {act.student.user.name} completed {act.test.title}
                                        </p>
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                            {format(new Date(act.createdAt), "hh:mm a")} • {format(new Date(act.createdAt), "MMM dd, yyyy")}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black italic text-cyan-600">{Math.round((act.marksObtained / act.test.totalMarks) * 100)}%</p>
                                    <Badge variant="outline" className="text-[8px] h-4 px-1 border-slate-200 uppercase font-black tracking-tighter">Verified</Badge>
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
