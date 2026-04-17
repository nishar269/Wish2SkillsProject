"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Users,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Activity,
  Briefcase,
  CalendarDays,
  PieChart,
  UserCircle2,
  BellRing,
  ArrowUpRight,
} from "lucide-react";

import { getAuthorityDashboardData } from "@/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AdminDashboardData = Awaited<ReturnType<typeof getAuthorityDashboardData>>;
type RecentLog = AdminDashboardData["recentLogs"][number];

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    getAuthorityDashboardData().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 p-8">
        <div className="h-10 w-56 animate-pulse rounded-2xl bg-white/70" />
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-[24px] bg-white/70" />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="h-[28rem] animate-pulse rounded-[28px] bg-white/70 lg:col-span-2" />
          <div className="h-[28rem] animate-pulse rounded-[28px] bg-white/70" />
        </div>
      </div>
    );
  }

  const { studentCount, facultyCount, courseCount, recentLogs } = data;

  const stats = [
    {
      label: "Total Students",
      value: studentCount,
      detail: "Institution-wide enrolment",
      icon: Users,
      iconClass: "bg-[#f2eadf] text-[#a07a3d]",
    },
    {
      label: "Active Faculty",
      value: facultyCount,
      detail: "Teaching workforce online",
      icon: GraduationCap,
      iconClass: "bg-[#e8edf6] text-[#374b7d]",
    },
    {
      label: "Course Modules",
      value: courseCount,
      detail: "Structured academic programs",
      icon: BookOpen,
      iconClass: "bg-[#e7f1ed] text-[#2d6a57]",
    },
    {
      label: "Activity Index",
      value: "High",
      detail: "Operational rhythm stable",
      icon: Activity,
      iconClass: "bg-[#efe7f7] text-[#7450a8]",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20">
      <section className="premium-shell px-6 py-6 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="premium-kicker border-[#e0d5c4] bg-white/55 text-[#9d7b43]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Administrative Command
            </div>
            <div>
              <h1 className="premium-title text-5xl text-[#141c2d]">Overview Dashboard</h1>
              <p className="pt-2 text-sm leading-relaxed text-[#655742]">
                Real-time operational visibility for enrollment, people, systems and institutional movement.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="lg">
              Generate Report
            </Button>
            <Button size="lg">Add Student</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="premium-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#92754a]">{stat.label}</p>
                <h2 className="pt-3 text-3xl font-bold tracking-tight text-[#141c2d]">{stat.value}</h2>
                <p className="pt-2 text-sm text-[#6b5b45]">{stat.detail}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconClass}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#92754a]">
              System Activity Feed
            </h3>
            <Button variant="ghost" className="px-0 text-xs font-semibold text-[#9d7b43]">
              View all activity
            </Button>
          </div>

          <div className="space-y-4">
            {recentLogs.length === 0 ? (
              <div className="pleasant-card flex flex-col items-center gap-4 border-dashed p-16 text-center text-[#88765a]">
                <Activity className="h-10 w-10 opacity-30" />
                <p className="text-sm font-medium">No system activity recorded in this session.</p>
              </div>
            ) : (
              recentLogs.slice(0, 8).map((log: RecentLog) => (
                <div key={log.id} className="pleasant-card flex items-center gap-5 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4ede2] text-[#8b6a37]">
                    <UserCircle2 className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#141c2d]">
                      {log.action}: <span className="font-medium text-[#6b5b45]">{log.entity}</span>
                    </p>
                    <div className="pt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9d7b43]">
                      {log.user.name} <span className="px-2 text-[#d0c0a7]">/</span> {log.user.role}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8565]">
                      {format(new Date(log.createdAt), "MMM d, HH:mm")}
                    </p>
                    <Badge variant="secondary" className="mt-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                      Verified
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="premium-card relative overflow-hidden p-6">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-4 opacity-[0.08] text-[#a17a3d]">
              <PieChart className="h-24 w-24" />
            </div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#92754a]">Management Nodes</h3>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: "Students", icon: Users, href: "/admin/students" },
                { label: "Faculty", icon: GraduationCap, href: "/admin/faculty" },
                { label: "Classes", icon: CalendarDays, href: "/admin/schedule" },
                { label: "Career", icon: Briefcase, href: "/admin/career" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="group rounded-[20px] border border-[#e2d7c8] bg-white/70 p-4 transition-all hover:border-[#c7a46a] hover:bg-white"
                >
                  <link.icon className="mb-4 h-5 w-5 text-[#a27a3d]" />
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64563f]">{link.label}</div>
                </a>
              ))}
            </div>
          </div>

          <div className="premium-dark-panel relative overflow-hidden p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(199,164,106,0.18),transparent_34%)]" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c39b]">
                  Institutional Notice
                </p>
                <BellRing className="h-4 w-4 text-[#f0d6a5]" />
              </div>
              <h4 className="premium-title text-4xl text-white">Enrollment cycle is active.</h4>
              <p className="text-sm leading-relaxed text-[#d8ccb7]">
                Review intake, course demand and internal staffing before the next academic window closes.
              </p>
              <Button variant="secondary" size="lg" className="w-full">
                Review Details
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
