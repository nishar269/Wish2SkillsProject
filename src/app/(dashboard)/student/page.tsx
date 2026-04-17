"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  Flame,
  Shield,
  Target,
} from "lucide-react";

import { getStudentDashboardData } from "@/actions/dashboard";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 p-8">
        <div className="h-10 w-64 animate-pulse rounded-2xl bg-white/70" />
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-[24px] bg-white/70" />
          ))}
        </div>
      </div>
    );
  }

  const { student, attendancePercentage, upcomingClasses, notifications, latestResult, gamification } = data;

  const stats = [
    {
      title: "Attendance",
      value: `${attendancePercentage}%`,
      detail: attendancePercentage >= 75 ? "On Track" : "Needs Improvement",
      icon: ClipboardCheck,
      iconClass: "bg-[#e7f1ed] text-[#2d6a57]",
    },
    {
      title: "Next Class",
      value: upcomingClasses[0]?.subject.name || "None",
      detail: upcomingClasses[0]
        ? `${format(new Date(upcomingClasses[0].date), "h:mm a")} - Room ${upcomingClasses[0].room ?? "TBA"}`
        : "No classes today",
      icon: Calendar,
      iconClass: "bg-[#e8edf6] text-[#37518c]",
    },
    {
      title: "Latest Score",
      value: latestResult ? `${latestResult.marksObtained}/${latestResult.test.totalMarks}` : "N/A",
      detail: latestResult?.test.title || "No test results",
      icon: FileText,
      iconClass: "bg-[#efe7f7] text-[#7550a9]",
    },
    {
      title: "Achievement Level",
      value: `Level ${gamification.level}`,
      detail: `${gamification.xp} total XP`,
      icon: Target,
      iconClass: "bg-[#f4ede2] text-[#8d6a32]",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-24">
      <section className="premium-shell px-6 py-6 md:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="premium-kicker border-[#e0d5c4] bg-white/55 text-[#9d7b43]">
              Student Workspace
            </div>
            <div>
              <h1 className="premium-title text-5xl text-[#141c2d]">
                Welcome back, {student?.user?.name.split(" ")[0] || "Student"}
              </h1>
              <p className="pt-2 text-sm leading-relaxed text-[#655742]">
                You have {upcomingClasses.length} classes in your queue today and your academic momentum is being tracked live.
              </p>
            </div>
          </div>
          <div className="premium-panel flex items-center gap-4 px-5 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#d5b482,#b78c46)] text-[#131b2c]">
              {student?.user?.name.charAt(0) ?? "S"}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#141c2d]">{student?.batch?.name || "Unassigned"}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-[#92754a]">
                {student?.batch?.course?.name || "Student"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {gamification && (
        <section className="premium-dark-panel p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.78fr_1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c7a46a]">Learning Progress</p>
              <div className="premium-title pt-2 text-5xl text-white">Level {gamification.level}</div>
              <div className="pt-3 text-sm text-[#d8ccb7]">
                <span className="inline-flex items-center gap-2">
                  <Flame className="h-4 w-4 text-[#f0d6a5]" />
                  {gamification.streak} day streak
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm font-semibold text-[#f1e8d7]">
                <span>{gamification.xp} XP</span>
                <span>{gamification.nextLevelXp} XP</span>
              </div>
              <Progress value={gamification.progress} className="h-3" />
              <p className="text-xs text-[#d8ccb7]">
                Your current pace is stable. Keep attendance and assessments consistent.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              {gamification.badges.map((badge: GamificationBadge) => {
                const Icon = badge.icon === "Flame" ? Flame : badge.icon === "Shield" ? Shield : BookOpen;
                return (
                  <div key={badge.name} className="rounded-[22px] border border-white/8 bg-white/6 px-4 py-3 text-center">
                    <div className={cn("mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full", badge.bg)}>
                      <Icon className={cn("h-5 w-5", getBadgeTextClass(badge.color))} />
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d8ccb7]">
                      {badge.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="premium-card p-6">
            <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconClass}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#92754a]">{stat.title}</p>
            <h2 className="pt-3 text-2xl font-bold tracking-tight text-[#141c2d]">{stat.value}</h2>
            <p className="pt-2 text-sm text-[#6b5b45]">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-5">
        <div className="premium-card p-6 lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="premium-title text-4xl text-[#141c2d]">Today&apos;s Schedule</h2>
              <p className="pt-1 text-sm text-[#6b5b45]">Your next academic blocks, with room and online access details.</p>
            </div>
            <Link href="/student/timetable" className="text-sm font-semibold text-[#9d7b43] hover:text-[#141c2d]">
              View Calendar
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-[22px] border border-dashed border-[#dfd2c0] py-16 text-center text-[#88765a]">
                <Calendar className="h-8 w-8 opacity-35" />
                <p className="text-sm font-medium">No classes scheduled for today.</p>
              </div>
            ) : (
              upcomingClasses.map((cls: DashboardClass) => (
                <div key={cls.id} className="rounded-[22px] border border-[#e2d7c8] bg-white/65 p-4 transition-all hover:border-[#c7a46a] hover:bg-white">
                  <div className="flex items-center gap-4">
                    <div className="min-w-[74px] text-center">
                      <p className="text-sm font-bold text-[#141c2d]">{format(new Date(cls.date), "h:mm")}</p>
                      <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#92754a]">
                        {format(new Date(cls.date), "a")}
                      </p>
                    </div>
                    <div className="h-11 w-px bg-[#e0d5c4]" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-semibold text-[#141c2d]">{cls.subject.name}</h4>
                      <p className="pt-1 text-sm text-[#6b5b45]">
                        Prof. {cls.faculty.user.name} - Room {cls.room || "TBA"}
                      </p>
                    </div>
                    {cls.meetLink && (
                      <a
                        href={cls.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e2d7c8] bg-white text-[#8f6c35] transition-all hover:border-[#c7a46a]"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="premium-card p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="premium-title text-4xl text-[#141c2d]">Recent Notifications</h2>
              <p className="pt-1 text-sm text-[#6b5b45]">Important academic and batch alerts.</p>
            </div>
            <Link href="/student/notifications" className="text-sm font-semibold text-[#9d7b43] hover:text-[#141c2d]">
              See All
            </Link>
          </div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="py-10 text-center text-sm font-medium text-[#88765a]">No new notifications.</p>
            ) : (
              notifications.slice(0, 4).map((notification: DashboardNotification) => (
                <div key={notification.id} className="rounded-[22px] border border-[#e2d7c8] bg-white/65 p-4">
                  <div className="flex gap-4">
                    <div className="mt-2 h-2.5 w-2.5 rounded-full bg-[#c7a46a]" />
                    <div>
                      <p className="text-sm font-semibold text-[#141c2d]">{notification.title}</p>
                      <p className="pt-1 text-sm leading-relaxed text-[#6b5b45]">{notification.message}</p>
                      <p className="pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#92754a]">
                        {format(new Date(notification.createdAt), "MMM dd, hh:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
