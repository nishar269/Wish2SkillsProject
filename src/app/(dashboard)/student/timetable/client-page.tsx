"use client";

import type { getStudentTimetable } from "@/actions/timetable";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, Video, CalendarDays, DownloadCloud } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

type StudentTimetableSession = Exclude<Awaited<ReturnType<typeof getStudentTimetable>>, { error: string }>[number];

export default function StudentTimetableClientPage({ initialSessions }: { initialSessions: StudentTimetableSession[] }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));

    const dailySessions = initialSessions.filter(session => isSameDay(new Date(session.date), selectedDate));

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-4">
                        Your Schedule
                        <a href="/api/schedule/export" className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-colors">
                            <DownloadCloud className="h-4 w-4" /> <span>Sync .ics</span>
                        </a>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Track your academic sessions and virtual meets.</p>
                </div>
                <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex gap-1">
                    {weekDays.map((day) => {
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());
                        
                        return (
                            <button
                                key={day.toString()}
                                onClick={() => setSelectedDate(day)}
                                className={cn(
                                    "flex flex-col items-center justify-center w-12 h-16 rounded-lg transition-all",
                                    isSelected ? "bg-blue-600 text-white shadow-sm" : "hover:bg-slate-50 text-slate-500",
                                    isToday && !isSelected && "border border-blue-200"
                                )}
                            >
                                <span className={cn("text-[10px] uppercase font-bold", isSelected ? "text-blue-100" : "text-slate-400")}>
                                    {format(day, "EEE")}
                                </span>
                                <span className="text-lg font-bold">{format(day, "dd")}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 pb-2">
                        <Clock className="h-4 w-4" /> Agenda for {format(selectedDate, "MMMM d, yyyy")}
                    </div>
                    
                    {dailySessions.length === 0 ? (
                        <Card className="border border-slate-200 shadow-sm rounded-xl bg-white p-12 text-center">
                            <CalendarDays className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600 font-bold text-lg">No sessions scheduled for today</p>
                            <p className="text-slate-400 text-sm mt-1">Time to focus on self-study!</p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                        {dailySessions.map((session) => (
                            <Card key={session.id} className="border border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden">
                                <CardContent className="p-0 flex flex-col md:flex-row h-full">
                                    <div className="md:w-36 p-6 bg-slate-50 flex flex-col items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-slate-200">
                                        <p className="text-lg font-bold text-slate-900">{format(new Date(session.startTime), "h:mm")}</p>
                                        <p className="text-xs font-semibold text-slate-500 uppercase">{format(new Date(session.startTime), "a")}</p>
                                        <div className="h-4 w-px bg-slate-300 my-2" />
                                        <p className="text-xs font-semibold text-slate-500 uppercase">to {format(new Date(session.endTime), "h:mm a")}</p>
                                    </div>
                                    <div className="flex-1 p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <Badge variant="outline" className="text-[10px] uppercase font-semibold bg-blue-50 text-blue-700">{session.subject.code}</Badge>
                                                <h3 className="text-xl font-bold text-slate-900">{session.subject.name}</h3>
                                            </div>
                                            {session.meetLink && (
                                                <a href={session.meetLink} target="_blank" className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                                                    <Video className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-6 pt-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                                    <User className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Instructor</p>
                                                    <p className="text-sm font-bold text-slate-900">{session.faculty.user.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                                    <MapPin className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Classroom</p>
                                                    <p className="text-sm font-bold text-slate-900">{session.room || "TBA"}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {session.topic && (
                                            <div className="pt-4 border-t border-slate-100 mt-2">
                                                 <p className="text-xs font-semibold text-slate-500 mb-1">Today&apos;s Topic</p>
                                                 <p className="text-sm text-slate-700">{session.topic}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-slate-500">Scheduled Sessions</h3>
                        </div>
                        <p className="text-4xl font-bold text-slate-900 mb-2">{initialSessions.length}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Total classes assigned to your active academic semester timeline.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
