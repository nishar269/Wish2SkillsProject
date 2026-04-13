"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Video, Plus, CalendarDays, ExternalLink } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function FacultyClassesClientPage({ initialSessions }: { initialSessions: any[] }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));

    const dailySessions = initialSessions.filter(session => isSameDay(new Date(session.date), selectedDate));

    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase text-edge-cap">Teaching Schedule</h1>
                    <p className="text-slate-500 font-medium italic">Manage your active lecture sessions and student engagement.</p>
                </div>
                <div className="bg-white dark:bg-slate-950 p-1.5 rounded-[1.5rem] shadow-xl border border-slate-100 dark:border-slate-800 flex gap-1">
                    {weekDays.map((day) => {
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());
                        
                        return (
                            <button
                                key={day.toString()}
                                onClick={() => setSelectedDate(day)}
                                className={cn(
                                    "flex flex-col items-center justify-center w-14 h-20 rounded-2xl transition-all",
                                    isSelected ? "bg-slate-900 text-white shadow-2xl" : "hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400",
                                    isToday && !isSelected && "border-2 border-slate-200"
                                )}
                            >
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", isSelected ? "text-slate-400" : "text-slate-400")}>
                                    {format(day, "EEE")}
                                </span>
                                <span className="text-xl font-black">{format(day, "dd")}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                         <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                            <CalendarDays className="h-4 w-4" /> Sessions for {format(selectedDate, "EEEE, MMM d")}
                         </div>
                         <Button variant="ghost" className="text-cyan-600 font-bold hover:bg-cyan-50 rounded-xl">
                            <Plus className="h-4 w-4 mr-2" /> Request Reschedule
                         </Button>
                    </div>

                    {dailySessions.length === 0 ? (
                        <div className="py-24 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                             <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                             <p className="text-slate-400 font-black italic uppercase tracking-tighter text-xl">No lectures today</p>
                             <p className="text-slate-300 text-xs mt-2 uppercase tracking-widest font-bold">Enjoy your research time!</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {dailySessions.map((session) => (
                                <Card key={session.id} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 group border-l-[12px] border-l-cyan-500">
                                    <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-center">
                                        <div className="flex flex-col items-center justify-center shrink-0 space-y-1">
                                            <p className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">
                                                {format(new Date(session.startTime), "hh:mm")}
                                            </p>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{format(new Date(session.startTime), "a")}</p>
                                        </div>

                                        <div className="h-12 w-px bg-slate-100 hidden md:block" />

                                        <div className="flex-1 space-y-3 text-center md:text-left">
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-cyan-50 text-cyan-700 border-cyan-100">
                                                    {session.batch.course.code}
                                                </Badge>
                                                <Badge className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white">
                                                    Batch {session.batch.name}
                                                </Badge>
                                            </div>
                                            <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-tight group-hover:text-cyan-600 transition-colors">
                                                {session.subject.name}
                                            </h3>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
                                            <div className="flex flex-col items-center px-4 py-2 bg-slate-50 rounded-2xl">
                                                <p className="text-lg font-black">{session.batch.capacity}</p>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Total Seats</p>
                                            </div>
                                            {session.meetLink && (
                                                <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">
                                                    <Video className="h-5 w-5 mr-2" /> Start Meet
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) }
                </div>

                <div className="space-y-6">
                    <Card className="border-0 shadow-xl rounded-[2.5rem] bg-cyan-600 text-white p-8 relative overflow-hidden">
                        <div className="relative z-10">
                            <Users className="h-10 w-10 mb-4 opacity-50" />
                            <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none mb-1">Weekly Load</h3>
                            <p className="text-5xl font-black italic tracking-tighter mb-4">{initialSessions.length}</p>
                            <p className="text-[10px] opacity-70 uppercase font-black tracking-widest leading-relaxed italic">Active lecture sessions scheduled for this academic cycle.</p>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                    </Card>

                    <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-6 shadow-sm">
                         <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Tools & Quick Actions</h3>
                         <div className="grid gap-3">
                            <Button variant="outline" className="justify-start h-12 rounded-xl font-bold text-xs uppercase tracking-tight">
                                <Clock className="h-4 w-4 mr-3 text-cyan-600" /> Mark Exam Dates
                            </Button>
                            <Button variant="outline" className="justify-start h-12 rounded-xl font-bold text-xs uppercase tracking-tight">
                                <Users className="h-4 w-4 mr-3 text-cyan-600" /> Generate Batch List
                            </Button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
