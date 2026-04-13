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
          { label: "Student Nodes", value: studentCount, icon: Users, sub: "Enrollment Density" },
          { label: "Instructional Load", value: facultyCount, icon: GraduationCap, sub: "Certified Mentors" },
          { label: "Knowledge Assets", value: courseCount, icon: BookOpen, sub: "Live Curriculums" },
          { label: "Operational Logs", value: recentLogs.length, icon: Activity, sub: "Signal Volume" },
        ].map((stat, i) => (
          <div key={i} className="premium-card p-6 flex items-center justify-between group cursor-default transition-all hover:border-primary/20 bg-card">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <h2 className="text-2xl font-bold mt-1 text-foreground tracking-tight">{stat.value}</h2>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">{stat.sub}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 text-primary group-hover:scale-110 transition-transform">
              <stat.icon className="h-5 w-5" />
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
                <div className="premium-card p-20 text-center text-muted-foreground text-xs font-medium italic border-dashed border-2 flex flex-col items-center gap-4">
                  <Fingerprint className="h-10 w-10 opacity-10 text-primary" />
                  No operational signals detected in current block.
                </div>
              ) : (
                recentLogs.slice(0, 10).map((log: any, i: number) => (
                  <div key={i} className="premium-card p-4 flex items-center gap-5 group hover:border-primary/20 bg-card">
                    <div className="p-3 bg-muted rounded-xl text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                       <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-foreground lead-tight truncate">{log.action}: {log.entity}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5 tracking-wider">
                        {log.user.name} • <span className="text-primary/70">{log.user.role}</span>
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-bold text-muted-foreground uppercase">{format(new Date(log.createdAt), "HH:mm:ss")}</p>
                       <Badge className="bg-primary/5 text-primary border-none text-[8px] font-bold px-1.5 h-4 mt-1 rounded-sm uppercase">Secure</Badge>
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
