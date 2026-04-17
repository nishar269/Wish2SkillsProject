"use client";

import { useEffect, useState } from "react";
import { getFacultyDashboardData } from "@/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Clock, 
  Layout, 
  ArrowRight, 
  Plus, 
  Upload,
  Cpu,
  Layers,
  Zap
} from "lucide-react";
import type { SVGProps } from "react";
import { format } from "date-fns";

export default function FacultyDashboardPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getFacultyDashboardData>> | null>(null);

  useEffect(() => {
    getFacultyDashboardData().then(setData);
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

  const { upcomingClasses, totalMaterials, activeAssignments, loadCount } = data;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header Info */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
            <Layout className="h-3 w-3" /> Academic Ops
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Faculty Command</h1>
        <p className="text-muted-foreground text-sm font-medium">Session density and resource throughput are within optimal ranges.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Subject Streams", value: loadCount, icon: Cpu, sub: "Active Allocation" },
          { label: "Upcoming Sessions", value: upcomingClasses.length, icon: Layers, sub: "Next 24h Queue" },
          { label: "Knowledge Assets", value: totalMaterials, icon: BookOpen, sub: "Resource Index" },
          { label: "Active Paths", value: activeAssignments, icon: Zap, sub: "Assessment Streams" },
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
        {/* Main Content: Session Map */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Session Map</h3>
              <Button size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                 <Plus className="h-3 w-3 mr-2" /> New Session
              </Button>
           </div>
           
           <div className="space-y-4">
              {upcomingClasses.length === 0 ? (
                <div className="premium-card p-20 text-center text-muted-foreground text-xs font-medium italic border-dashed border-2 flex flex-col items-center gap-4">
                  <Clock className="h-10 w-10 opacity-10 text-primary" />
                  No upcoming sessions found in queue.
                </div>
              ) : (
                upcomingClasses.map((cls, i) => (
                  <div key={i} className="premium-card p-5 flex items-center gap-6 group hover:border-primary/20 bg-card">
                    <div className="text-center min-w-[60px]">
                      <p className="text-xs font-bold text-primary leading-none mb-1">{format(new Date(cls.date), "HH:mm")}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter opacity-60">UTC+</p>
                    </div>
                    <div className="h-10 w-[1px] bg-border/60" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{cls.subject.name}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-1 opacity-70">
                        {cls.batch.name} <span className="mx-2 opacity-30">/</span> {cls.room || "Sector C"}
                      </p>
                    </div>
                    <Badge className="bg-primary/5 text-primary border-none text-[9px] font-bold px-3 py-0.5 rounded-full">PENDING</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all text-primary hover:translate-x-1">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* Sidebar: Instant Actions */}
        <div className="space-y-6">
           <div className="premium-card p-6 space-y-6 bg-card">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground border-b pb-4">Rapid Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                 {[
                   { label: "Take Attendance", icon: Users, href: "/faculty/attendance" },
                   { label: "Upload Resource", icon: Upload, href: "/faculty/resources" },
                   { label: "Grade Assessment", icon: Zap, href: "/faculty/tests" },
                   { label: "View Calendar", icon: Calendar, href: "/calendar" },
                 ].map((action, i) => (
                   <a 
                     key={i} 
                     href={action.href}
                     className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-primary/[0.03] hover:border-primary/30 transition-all group"
                   >
                     <div className="flex items-center gap-3">
                        <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">{action.label}</span>
                     </div>
                     <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                   </a>
                 ))}
              </div>
           </div>

           <div className="premium-card p-8 bg-primary text-primary-foreground relative overflow-hidden group cursor-pointer shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
              <div className="relative z-10 flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">Insight Engine</p>
                    <TrendingUp className="h-5 w-5 opacity-50" />
                 </div>
                 <h4 className="text-xl font-bold tracking-tight">Generate Performance Analytics</h4>
                 <p className="text-[10px] font-medium uppercase tracking-widest opacity-70">Synthesized report from active streams</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all" />
           </div>
        </div>
      </div>
    </div>
  );
}

function TrendingUp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
