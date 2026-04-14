"use client";

import { useEffect, useState } from "react";
import { getAuthorityDashboardData } from "@/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  Activity, 
  Briefcase,
  PieChart,
  UserCircle2
} from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getAuthorityDashboardData().then(setData);
  }, []);

  if (!data) return (
    <div className="p-8 space-y-8 animate-pulse max-w-7xl mx-auto">
        <div className="h-10 w-48 bg-slate-100 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-slate-100 rounded-2xl" />
            <div className="h-96 bg-slate-100 rounded-2xl" />
        </div>
    </div>
  );

  const { studentCount, facultyCount, courseCount, recentLogs } = data;

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3">
                <ShieldCheck className="h-3.5 w-3.5" /> Institution Management
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Real-time snapshots of institutional academic performance.</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" className="text-xs font-bold rounded-xl border-slate-200 hover:bg-slate-50">Generate Report</Button>
            <Button className="text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700">Add Student</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Students", value: studentCount, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Faculty", value: facultyCount, icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Course Modules", value: courseCount, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Activity Index", value: "High", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((stat, i) => (
          <div key={i} className="pleasant-card p-6 flex items-center justify-between border-slate-100 group">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <h2 className="text-2xl font-extrabold mt-1 text-slate-900">{stat.value}</h2>
            </div>
            <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Activity Logs */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">System Activity Feed</h3>
              <Button variant="ghost" size="sm" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-transparent p-0">View all activity</Button>
           </div>
           
           <div className="space-y-4">
              {recentLogs.length === 0 ? (
                <div className="pleasant-card p-20 text-center border-dashed border-slate-200 bg-transparent flex flex-col items-center gap-4 text-slate-400">
                  <Activity className="h-10 w-10 opacity-20" />
                  <p className="text-sm font-medium">No system activity recorded in this session.</p>
                </div>
              ) : (
                recentLogs.slice(0, 10).map((log: any, i: number) => (
                  <div key={i} className="pleasant-card p-5 flex items-center gap-5 border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                       <UserCircle2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 leading-none mb-1.5">{log.action}: <span className="text-slate-500 font-medium">{log.entity}</span></p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{log.user.name}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] font-medium text-slate-400 capitalize">{log.user.role.toLowerCase()}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                       <p className="text-[10px] font-bold text-slate-400 mb-1">{format(new Date(log.createdAt), "MMM d, HH:mm")}</p>
                       <Badge variant="outline" className="border-green-100 bg-green-50 text-green-700 text-[10px] font-bold px-1.5 py-0 h-4 uppercase">Verified</Badge>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* Sidebar: Module Navigation */}
        <div className="space-y-6">
           <div className="pleasant-card p-6 border-slate-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 transform translate-x-12 -translate-y-8 opacity-[0.03] text-blue-600 rotate-12">
                   <PieChart className="h-24 w-24" />
               </div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Management Nodes</h3>
              <div className="grid grid-cols-2 gap-3">
                 {[
                   { label: "Students", icon: Users, href: "/admin/students", color: "text-blue-600" },
                   { label: "Faculty", icon: GraduationCap, href: "/admin/faculty", color: "text-indigo-600" },
                   { label: "Classes", icon: CalendarDays, href: "/admin/schedule", color: "text-purple-600" },
                   { label: "Career", icon: Briefcase, href: "/admin/career", color: "text-emerald-600" },
                 ].map((link, i) => (
                    <Button 
                      key={i} 
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2 rounded-2xl border-slate-100 hover:bg-slate-50 hover:border-slate-200 group transition-all"
                      asChild
                    >
                      <a href={link.href}>
                        <link.icon className={`h-5 w-5 ${link.color} transition-transform group-hover:scale-110`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{link.label}</span>
                      </a>
                    </Button>
                 ))}
              </div>
           </div>

           <div className="pleasant-card p-6 bg-blue-600 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent pointer-events-none" />
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-200">Institutional Notice</p>
                    <BellRing className="h-4 w-4 text-blue-200 animate-tada" />
                 </div>
                 <h4 className="text-lg font-bold leading-snug">Spring Semester <br/> Enrollment Active</h4>
                 <Button variant="secondary" size="sm" className="w-full text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 rounded-xl">Review Details</Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// Missing imports fix
import { CalendarDays } from "lucide-react";
