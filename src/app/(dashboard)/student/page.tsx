"use client";

import { useEffect, useState } from "react";
import { getStudentDashboardData } from "@/actions/dashboard";
import {
  ClipboardCheck,
  Calendar,
  FileText,
  Target,
  ArrowUpRight,
  Flame,
  BookOpen,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

type StudentDashboardData = Awaited<ReturnType<typeof getStudentDashboardData>>;
type DashboardClass = StudentDashboardData["upcomingClasses"][number];
type DashboardNotification = StudentDashboardData["notifications"][number];
type GamificationBadge = StudentDashboardData["gamification"]["badges"][number];

function getBadgeTextClass(color: GamificationBadge["color"]) {
  switch (color) {
    case "amber-500":
      return "text-amber-500";
    case "blue-500":
      return "text-blue-500";
    case "emerald-500":
      return "text-emerald-500";
    default:
      return "text-slate-500";
  }
}

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboardData | null>(null);

  useEffect(() => {
    getStudentDashboardData().then(setData);
  }, []);

  if (!data) return (
    <div className="p-8 space-y-8 animate-pulse max-w-7xl mx-auto">
        <div className="h-8 w-64 bg-slate-100 rounded-md" />
        <div className="grid grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl" />)}
        </div>
    </div>
  );

  const { student, attendancePercentage, upcomingClasses, notifications, latestResult, gamification } = data;

  const stats = [
    {
      title: "Attendance",
      value: `${attendancePercentage}%`,
      detail: attendancePercentage >= 75 ? "On Track" : "Needs Improvement",
      icon: ClipboardCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Next Class",
      value: upcomingClasses[0]?.subject.name || "None",
      detail: upcomingClasses[0] ? `${format(new Date(upcomingClasses[0].date), "h:mm a")} - Room ${upcomingClasses[0].room}` : "No classes today",
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Latest Score",
      value: latestResult ? `${latestResult.marksObtained}/${latestResult.test.totalMarks}` : "N/A",
      detail: latestResult?.test.title || "No test results",
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Achievement Level",
      value: `Level ${gamification.level}`,
      detail: `${gamification.xp} Total XP`,
      icon: Target,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto pb-24 bg-slate-50 min-h-screen font-sans">
      
      {/* Basic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {student?.user?.name.split(" ")[0] || "Student"}
            </h1>
            <p className="text-slate-500 font-medium mt-1">
                You have {upcomingClasses.length} classes scheduled for today.
            </p>
        </div>
        <div className="flex bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm items-center gap-3">
             <div className="h-8 w-8 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full font-bold">
                 {student?.user?.name.charAt(0)}
             </div>
             <div>
                <p className="text-sm font-bold text-slate-900 leading-none">{student?.batch?.name || "Unassigned"}</p>
                <p className="text-xs text-slate-500">{student?.batch?.course?.name || "Student"}</p>
             </div>
        </div>
      </div>

      {/* Gamification Banner (Simplified) */}
      {gamification && (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row gap-8 justify-between items-center shadow-sm">
         <div className="flex flex-col min-w-[200px]">
            <h3 className="text-sm font-semibold text-slate-500 uppercase">Learning Progress</h3>
            <div className="flex items-end gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900">Level {gamification.level}</span>
                <span className="text-sm text-slate-500 font-medium pb-1 flex items-center gap-1"><Flame className="h-4 w-4 text-orange-500" /> {gamification.streak} Day Streak</span>
            </div>
         </div>

         <div className="flex-1 w-full space-y-2">
             <div className="flex justify-between text-sm font-semibold text-slate-700">
                <span>{gamification.xp} XP</span>
                <span>{gamification.nextLevelXp} XP</span>
             </div>
             <Progress value={gamification.progress} className="h-3" />
         </div>
         
         <div className="flex items-center gap-3 shrink-0">
            {gamification.badges.map((b: GamificationBadge) => {
                const Icon = b.icon === 'Flame' ? Flame : b.icon === 'Shield' ? Shield : BookOpen;
                return (
                    <div key={b.name} className="flex flex-col items-center gap-1" title={b.name}>
                        <div className={cn("p-3 rounded-full flex items-center justify-center", b.bg)}>
                            <Icon className={cn("h-5 w-5", getBadgeTextClass(b.color))} />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500">{b.name}</span>
                    </div>
                )
            })}
         </div>
      </div>
      )}

      {/* Standard Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className={cn("p-3 rounded-xl shrink-0", stat.bg)}>
              <stat.icon className={cn("h-6 w-6", stat.color)} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{stat.title}</p>
              <h2 className="text-xl font-bold text-slate-900 truncate">{stat.value}</h2>
              <p className="text-xs text-slate-400 mt-1">{stat.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        
        {/* Classes List */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-bold text-slate-900">Today&apos;s Schedule</h2>
             <Link href="/student/timetable" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View Calendar</Link>
          </div>

          <div className="flex-1 space-y-4">
            {upcomingClasses.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                   <Calendar className="h-8 w-8 mb-2 opacity-50" />
                   <p className="text-sm font-medium">No classes scheduled for today.</p>
                </div>
            ) : (
                upcomingClasses.map((cls: DashboardClass) => (
                <div key={cls.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col items-center justify-center shrink-0 w-16 text-slate-900">
                    <span className="text-sm font-bold">{format(new Date(cls.date), "h:mm")}</span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">{format(new Date(cls.date), "a")}</span>
                    </div>
                    <div className="h-10 w-px bg-slate-200" />
                    <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-slate-900 leading-none mb-1 truncate">{cls.subject.name}</h4>
                        <p className="text-xs font-medium text-slate-500 truncate mt-1">
                           Prof. {cls.faculty.user.name} • Room {cls.room || "TBA"}
                        </p>
                    </div>
                    {cls.meetLink && (
                        <a href={cls.meetLink} target="_blank" className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg">
                            <ArrowUpRight className="h-4 w-4" />
                        </a>
                    )}
                </div>
                ))
            )}
          </div>
        </div>

        {/* Notifications & Progress */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-bold text-slate-900">Recent Notifications</h2>
             <Link href="/student/notifications" className="text-sm font-semibold text-blue-600 hover:text-blue-700">See All</Link>
          </div>

          <div className="flex-1 space-y-4">
            {notifications.length === 0 ? (
                <p className="text-sm font-medium text-slate-500 py-6 text-center">No new notifications.</p>
            ) : (
                notifications.slice(0, 3).map((notif: DashboardNotification) => (
                <div key={notif.id} className="flex gap-4 p-3 rounded-lg hover:bg-slate-50">
                    <div className="mt-1 w-2 h-2 rounded-full shrink-0 bg-blue-500" />
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900 leading-snug">{notif.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 font-medium block mt-2">
                           {format(new Date(notif.createdAt), "MMM dd, hh:mm a")}
                        </span>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
