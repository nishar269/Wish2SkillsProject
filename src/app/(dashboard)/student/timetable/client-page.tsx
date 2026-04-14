"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, Video, CalendarDays } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function StudentTimetableClientPage({ initialSessions }: { initialSessions: any[] }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));

    const dailySessions = initialSessions.filter(session => isSameDay(new Date(session.date), selectedDate));

    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">Your Schedule</h1>
                    <p className="text-slate-500 font-medium italic">Track your academic sessions and virtual meets.</p>
                </div>
                <div className="bg-white dark:bg-slate-950 p-1 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 flex gap-1">
                    {weekDays.map((day) => {
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());
                        
                        return (
                            <button
                                key={day.toString()}
                                onClick={() => setSelectedDate(day)}
                                className={cn(
                                    "flex flex-col items-center justify-center w-14 h-20 rounded-xl transition-all",
                                    isSelected ? "bg-cyan-600 text-white shadow-xl shadow-cyan-600/20" : "hover:bg-slate-50 dark:hover:bg-slate-900",
                                    isToday && !isSelected && "border-2 border-cyan-500/30"
                                )}
                            >
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", isSelected ? "text-cyan-100" : "text-slate-400")}>
                                    {format(day, "EEE")}
                                </span>
                                <span className="text-lg font-black">{format(day, "dd")}</span>
                                {isToday && <div className={cn("w-1 h-1 rounded-full mt-1", isSelected ? "bg-white" : "bg-cyan-600")} />}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 px-2 uppercase text-xs font-black tracking-widest text-slate-400">
                        <Clock className="h-3 w-3" /> Agenda for {format(selectedDate, "MMMM d, yyyy")}
                    </div>
                    
                    {dailySessions.length === 0 ? (
                        <Card className="border-0 shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-950 p-12 text-center overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                            <CalendarDays className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold italic text-lg uppercase tracking-tight">No sessions scheduled for today</p>
                            <p className="text-slate-300 text-xs mt-2 uppercase tracking-widest">Time to focus on self-study!</p>
                        </Card>
                    ) : (
                        dailySessions.map((session) => (
                            <Card key={session.id} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-950 group">
                                <CardContent className="p-0 flex flex-col md:flex-row h-full">
                                    <div className="md:w-40 p-6 md:p-8 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                                        <p className="text-lg font-black text-slate-900 dark:text-white uppercase">{format(new Date(session.startTime), "hh:mm")}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{format(new Date(session.startTime), "a")}</p>
                                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 my-2" />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">to {format(new Date(session.endTime), "hh:mm a")}</p>
                                    </div>
                                    <div className="flex-1 p-6 md:p-8 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest border-cyan-500/30 text-cyan-600 bg-cyan-50/50">{session.subject.code}</Badge>
                                                <h3 className="text-2xl font-black italic tracking-tighter uppercase">{session.subject.name}</h3>
                                            </div>
                                            {session.meetLink && (
                                                <a href={session.meetLink} target="_blank" className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:scale-110 active:scale-95 transition-all">
                                                    <Video className="h-5 w-5" />
                                                </a>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-6 pt-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                                    <User className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Instructor</p>
                                                    <p className="text-sm font-bold">{session.faculty.user.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                                    <MapPin className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Classroom</p>
                                                    <p className="text-sm font-bold">{session.room || "Digital Lab"}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {session.topic && (
                                            <div className="pt-4 border-t border-slate-50 dark:border-slate-900 mt-2">
                                                 <p className="text-[10px] font-black uppercase tracking-widest text-cyan-600 mb-1">Today's Topic</p>
                                                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400 italic">"{session.topic}"</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="border-0 shadow-lg rounded-[2.5rem] bg-slate-900 text-white p-8 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-black uppercase tracking-tighter mb-4 italic">Next up</h3>
                            <div className="p-4 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-sm">
                                <p className="text-[10px] uppercase font-black tracking-widest opacity-50 mb-1">Upcoming Session</p>
                                <p className="text-sm font-bold">Lab Connectivity Check</p>
                                <p className="text-[10px] text-cyan-400 mt-1 uppercase font-black">Tomorrow at 09:00 AM</p>
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-16 -mb-16" />
                    </Card>

                    <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Attendance Target</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-4xl font-black italic tracking-tighter">84%</p>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Cumulative</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-emerald-500 uppercase tracking-tighter">+5%</p>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 underline decoration-cyan-500 decoration-2">On Track</p>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-600 w-[84%] rounded-full shadow-[0_0_10px_rgba(8,145,178,0.5)]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
