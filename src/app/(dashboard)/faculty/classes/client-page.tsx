"use client";

import type { getFacultyClasses } from "@/actions/faculty-classes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Video, CalendarDays, DownloadCloud } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

type FacultyClassSession = Exclude<Awaited<ReturnType<typeof getFacultyClasses>>, { error: string }>[number];

export default function FacultyClassesClientPage({ initialSessions }: { initialSessions: FacultyClassSession[] }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));

    const dailySessions = initialSessions.filter(session => isSameDay(new Date(session.date), selectedDate));

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-4">
                        Teaching Schedule
                        <a href="/api/schedule/export" className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-colors">
                            <DownloadCloud className="h-4 w-4" /> <span>Sync .ics</span>
                        </a>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your active lecture sessions.</p>
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

            <div className="grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 border-b pb-4 border-slate-200">
                        <CalendarDays className="h-4 w-4" /> Sessions for {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </div>

                    {dailySessions.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                             <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                             <p className="text-slate-600 font-bold text-lg">No lectures scheduled</p>
                             <p className="text-slate-400 text-sm mt-1">You have no teaching assignments for this date.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {dailySessions.map((session) => (
                                <Card key={session.id} className="border border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden">
                                    <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
                                        <div className="flex flex-col items-center justify-center shrink-0 w-24">
                                            <p className="text-xl font-bold text-slate-900">
                                                {format(new Date(session.startTime), "h:mm")}
                                            </p>
                                            <p className="text-xs font-semibold text-slate-500 uppercase">{format(new Date(session.startTime), "a")}</p>
                                        </div>

                                        <div className="h-10 w-px bg-slate-200 hidden md:block" />

                                        <div className="flex-1 space-y-2 text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-2">
                                                <Badge variant="outline" className="text-[10px] font-semibold bg-slate-50 text-slate-700">
                                                    {session.batch.course.code}
                                                </Badge>
                                                <Badge className="text-[10px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">
                                                    Batch {session.batch.name}
                                                </Badge>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900">
                                                {session.subject.name}
                                            </h3>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
                                            <div className="flex flex-col items-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                                                <p className="text-base font-bold text-slate-700">{session.batch.capacity}</p>
                                                <p className="text-[10px] font-semibold text-slate-500">Students</p>
                                            </div>
                                            {session.meetLink && (
                                                <a href={session.meetLink} target="_blank" className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                                                    <Video className="h-4 w-4 mr-2" /> Join Meet
                                                </a>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) }
                </div>

                <div className="space-y-6">
                    <div className="border border-slate-200 shadow-sm rounded-2xl bg-white p-6">
                        <Users className="h-8 w-8 mb-4 text-blue-500" />
                        <h3 className="text-sm font-semibold text-slate-500 mb-1">Total Academic Load</h3>
                        <p className="text-4xl font-bold text-slate-900 mb-2">{initialSessions.length}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Total mapped sessions for your account during this active semester.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
