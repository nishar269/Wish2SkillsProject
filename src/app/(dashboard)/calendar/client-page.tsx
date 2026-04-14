"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, ChevronLeft, ChevronRight, GraduationCap, ClipboardList } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns";

export default function CalendarClientPage({ initialEvents }: { initialEvents: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return initialEvents.filter(e => isSameDay(new Date(e.date), day));
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Institute Calendar</h1>
          <p className="text-muted-foreground">Stay updated with class sessions, exams, and national holidays.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-bold min-w-[140px] text-center">
                {format(currentDate, "MMMM yyyy")}
            </span>
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Grid */}
        <Card className="lg:col-span-3 border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-0">
                <div className="grid grid-cols-7 border-b bg-slate-50/50 dark:bg-slate-950/50">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                        <div key={d} className="p-4 text-center text-xs font-black uppercase tracking-widest text-slate-500">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {days.map((day, i) => {
                        const dayEvents = getEventsForDay(day);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div 
                                key={i} 
                                className={`min-h-[120px] p-2 border-r border-b group transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 ${
                                    !isCurrentMonth ? "bg-slate-50/10 dark:bg-slate-900/5 opacity-30" : ""
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${
                                        isToday ? "bg-cyan-600 text-white shadow-lg" : "text-slate-700 dark:text-slate-300"
                                    }`}>
                                        {format(day, "d")}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {dayEvents.map(e => (
                                        <div key={e.id} className={`p-1.5 rounded-lg text-[10px] font-bold border-l-4 truncate ${
                                            e.type === 'EXAM' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-cyan-50 text-cyan-700 border-cyan-500'
                                        }`}>
                                            {e.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>

        {/* Sidebar Filter/Upcoming */}
        <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
                 <CardHeader>
                    <CardTitle className="text-lg">Event Legends</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50" />
                        <span className="text-sm font-medium">Regular Classes</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                        <span className="text-sm font-medium">Examinations</span>
                    </div>
                 </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-500 pl-1">Selected Day Agenda</h3>
                {getEventsForDay(currentDate).length === 0 ? (
                    <p className="text-xs text-muted-foreground italic pl-1">No activities scheduled for this date.</p>
                ) : (
                    getEventsForDay(currentDate).map(e => (
                        <Card key={e.id} className="border-0 shadow-md">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className={`p-2 rounded-xl ${e.type === 'EXAM' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                    {e.type === 'EXAM' ? <ClipboardList className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold line-clamp-1">{e.title}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                                        <Clock className="h-3 w-3" /> {format(new Date(e.date), "p")}
                                        {e.location && <><MapPin className="h-3 w-3 ml-2" /> {e.location}</>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
