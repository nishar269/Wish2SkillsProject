"use client";

import { useEffect, useState } from "react";
import { getAuthorityDashboardData } from "@/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Shield, 
  Layout, 
  Activity, 
  ArrowRight, 
  Settings,
  BarChart3,
  TrendingUp,
  Fingerprint
} from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getAuthorityDashboardData().then(setData);
  }, []);

  if (!data) return (
    <div className="p-8 space-y-8 animate-pulse max-w-7xl mx-auto">
        <div className="h-12 w-64 bg-muted rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-muted rounded-xl" />
            <div className="h-96 bg-muted rounded-xl" />
        </div>
    </div>
  );

  const { studentCount, facultyCount, courseCount, recentLogs } = data;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header Info */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
            <Shield className="h-3 w-3" /> Institutional Headquarters
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Master Terminal</h1>
        <p className="text-muted-foreground text-sm font-medium">Synchronizing cross-sector operational telemetry in real-time.</p>
      </div>

      {/* Metadata Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Student Nodes", value: studentCount, icon: Users, sub: "Enrollment Density", color: "text-cyan-400" },
          { label: "Instructional Load", value: facultyCount, icon: GraduationCap, sub: "Certified Mentors", color: "text-indigo-400" },
          { label: "Knowledge Assets", value: courseCount, icon: BookOpen, sub: "Live Curriculums", color: "text-purple-400" },
          { label: "Operational Logs", value: recentLogs.length, icon: Activity, sub: "Signal Volume", color: "text-emerald-400" },
        ].map((stat, i) => (
          <div key={i} className="premium-card p-6 flex items-center justify-between group cursor-default relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[9px] font-black italic text-slate-500 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
              <h2 className="text-3xl font-black italic mt-1 text-white tracking-tighter">{stat.value}</h2>
              <p className="text-[8px] text-slate-600 mt-2 font-black uppercase tracking-[0.2em]">{stat.sub}</p>
            </div>
            <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/10 relative z-10 group-hover:scale-110 transition-transform shadow-2xl", stat.color)}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Audit Log */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Forensic Signal Log</h3>
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest hover:text-primary">Open Audit Portal</Button>
           </div>
           
           <div className="space-y-4">
              {recentLogs.length === 0 ? (
                <div className="premium-card p-20 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] italic border-dashed border-white/5 flex flex-col items-center gap-6">
                  <Fingerprint className="h-12 w-12 opacity-10 text-cyan-400" />
                  No operational signals detected in current block.
                </div>
              ) : (
                recentLogs.slice(0, 10).map((log: any, i: number) => (
                  <div key={i} className="premium-card p-5 flex items-center gap-6 group">
                    <div className="p-3.5 bg-white/5 rounded-2xl text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-all duration-500 border border-white/5 shadow-inner">
                       <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black italic text-white leading-none mb-2 tracking-tight">{log.action}: {log.entity}</p>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">
                        {log.user.name} <span className="text-cyan-500/50 italic px-2">node::</span><span className="text-cyan-500">{log.user.role}</span>
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black italic text-slate-400 uppercase tracking-widest mb-1">{format(new Date(log.createdAt), "HH:mm:ss")}</p>
                       <div className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-black text-cyan-500 uppercase tracking-widest">Secure</div>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* Sidebar: Institutional Modules */}
        <div className="space-y-6">
           <div className="premium-card p-6 space-y-6 bg-card">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground border-b pb-4">Operational Nodes</h3>
              <div className="grid grid-cols-2 gap-3">
                 {[
                   { label: "Students", icon: "👨‍🎓", href: "/admin/students" },
                   { label: "Faculty", icon: "👨‍🏫", href: "/admin/faculty" },
                   { label: "Batches", icon: "📦", href: "/admin/batches" },
                   { label: "Schedule", icon: "📅", href: "/admin/schedule" },
                   { label: "Broadcast", icon: "📢", href: "/admin/notifications" },
                   { label: "Analytics", icon: "📊", href: "/admin/audit" },
                 ].map((action, i) => (
                   <a 
                     key={i} 
                     href={action.href}
                     className="flex flex-col items-center justify-center p-6 rounded-2xl border border-border/50 bg-muted/20 hover:bg-primary/[0.03] hover:border-primary/30 transition-all group text-center"
                   >
                     <span className="text-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 mb-3">{action.icon}</span>
                     <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">{action.label}</span>
                   </a>
                 ))}
              </div>
           </div>

           <div className="premium-card p-8 bg-zinc-900 dark:bg-zinc-800 text-white relative overflow-hidden group cursor-pointer shadow-xl transition-all hover:scale-[1.02]">
              <div className="relative z-10 flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">Security Protocol</p>
                    <Shield className="h-5 w-5 opacity-40 animate-pulse text-cyan-400" />
                 </div>
                 <h4 className="text-xl font-bold tracking-tight">Master Guard Protocol</h4>
                 <p className="text-[10px] font-medium uppercase tracking-widest opacity-50">Active Institutional Over-watch</p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700" />
           </div>
        </div>
      </div>
    </div>
  );
}
