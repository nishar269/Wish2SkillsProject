"use client";

import { useEffect, useState } from "react";
import { getStudentDashboardData } from "@/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardCheck,
  Calendar,
  FileText,
  TrendingUp,
  Bell,
  Target,
  ArrowUpRight,
  Zap,
  Flame,
  BookOpen,
  Shield,
  Star,
  Swords,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getStudentDashboardData().then(setData);
  }, []);

  if (!data) return (
    <div className="p-12 space-y-8 animate-pulse">
        <div className="h-12 w-64 bg-slate-200 dark:bg-white/5 rounded-3xl" />
        <div className="grid grid-cols-4 gap-8">
            {[1,2,3,4].map(i => <div key={i} className="h-48 bg-slate-200 dark:bg-white/5 rounded-[2.5rem]" />)}
        </div>
    </div>
  );

  const { student, attendancePercentage, upcomingClasses, notifications, latestResult, gamification } = data;

  const stats = [
    {
      title: "Attendance Velocity",
      value: `${attendancePercentage}%`,
      detail: attendancePercentage >= 75 ? "Compliance Optimal" : "Action Required",
      icon: ClipboardCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Active Learning",
      value: upcomingClasses[0]?.subject.name || "None Found",
      detail: upcomingClasses[0] ? `${format(new Date(upcomingClasses[0].date), "p")} @ ${upcomingClasses[0].room}` : "Schedule Clear",
      icon: Zap,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      title: "Academic Yield",
      value: latestResult ? `${latestResult.marksObtained}/${latestResult.test.totalMarks}` : "Standby",
      detail: latestResult?.test.title || "No data stream",
      icon: FileText,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      title: "Neural Ranking",
      value: attendancePercentage > 90 ? "Alpha" : attendancePercentage > 80 ? "Beta" : "Gamma",
      detail: "Based on presence ratio",
      icon: Target,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="p-8 space-y-12 pb-24"
    >
      {/* Header Section */}
      <motion.div variants={item} className="relative">
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-black uppercase tracking-[0.2em] text-[10px] bg-cyan-500/5 px-4">Student Node</Badge>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Sync: Live</span>
            </div>
            <h1 className="text-6xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                Salutation, <span className="text-cyan-500">{student?.user?.name.split(" ")[0] || "User"}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold italic text-sm tracking-wide max-w-2xl leading-relaxed mt-2">
                Your academic neural network is active. Subscribed to {upcomingClasses.length} live streams today. Overall compliance is rated sustained.
            </p>
        </div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] -mr-48 -mt-24 pointer-events-none" />
      </motion.div>

      {/* Gamification Banner */}
      {gamification && (
      <motion.div variants={item} className="glass rounded-[3rem] p-10 relative overflow-hidden flex flex-col md:flex-row gap-10 items-center justify-between border border-amber-500/10">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/5 to-orange-500/10 rounded-full blur-[80px] -mr-48 -mt-48 pointer-events-none" />
         
         <div className="flex items-center gap-6 relative z-10">
            <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.3)] shadow-amber-500/40 relative">
               <span className="text-4xl font-black italic text-white drop-shadow-md">{gamification.level}</span>
               <div className="absolute -bottom-3 -right-3 bg-slate-900 border-4 border-slate-50 dark:border-slate-950 rounded-full p-2">
                 <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
               </div>
            </div>
            <div>
               <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-amber-500 italic mb-1">Rank {gamification.level} Node</h3>
               <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">XP: {gamification.xp}</h2>
               <div className="flex items-center gap-3 mt-3">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">{gamification.streak} Day Streak</span>
               </div>
            </div>
         </div>

         <div className="flex-1 w-full max-w-xl relative z-10 space-y-4 pt-4 md:pt-0">
             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>Current Tier</span>
                <span className="text-amber-500 tracking-[0.3em]">{gamification.nextLevelXp} XP FOR LEVEL {gamification.level + 1}</span>
             </div>
             <div className="relative h-4 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${gamification.progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" 
                />
             </div>
             
             <div className="flex items-center gap-4 pt-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 italic">Unlocked Badges:</span>
                <div className="flex gap-2">
                   {gamification.badges.map((b: any, i: number) => {
                      const Icon = b.icon === 'Flame' ? Flame : b.icon === 'Shield' ? Shield : BookOpen;
                      return (
                         <div key={i} className={cn("p-2 rounded-xl flex items-center justify-center border border-slate-200/50 dark:border-white/5 shadow-sm", b.bg)}>
                            <Icon className={cn("h-4 w-4", `text-${b.color}`)} />
                         </div>
                      )
                   })}
                </div>
             </div>
         </div>
      </motion.div>
      )}

      {/* High-Fidelity Stats Grid */}
      <div className="grid gap-8 md:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.title} 
            variants={item}
            whileHover={{ y: -10, scale: 1.02 }}
            className="glass p-10 rounded-[3rem] relative overflow-hidden group cursor-default"
          >
            <div className="relative z-10 space-y-8">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl", stat.bg)}>
                <stat.icon className={cn("h-7 w-7", stat.color)} />
              </div>
              <div className="space-y-2">
                <h2 className={cn("text-4xl font-black italic tracking-tighter uppercase leading-none text-slate-900 dark:text-white", stat.value.length > 8 ? "text-2xl" : "text-4xl")}>
                    {stat.value}
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{stat.title}</p>
              </div>
              <div className="pt-6 border-t border-slate-200/50 dark:border-white/5">
                 <p className="text-[10px] font-bold text-slate-500 italic leading-relaxed">"{stat.detail}"</p>
              </div>
            </div>
            <div className={cn("absolute bottom-0 right-0 w-32 h-32 rounded-full blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 -mr-16 -mb-16", stat.bg)} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Living Stream: Schedule */}
        <motion.div 
            variants={item}
            className="lg:col-span-3 glass rounded-[3.5rem] p-12 space-y-10 relative overflow-hidden"
        >
          <div className="relative z-10">
              <div className="flex items-center justify-between mb-12">
                <div className="flex flex-col">
                   <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-400 mb-2 italic">Neural Map</h3>
                   <h2 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white leading-none">Live Sessions</h2>
                </div>
                <div className="p-4 bg-slate-900 rounded-[1.75rem] shadow-2xl subtle-glow">
                    <Calendar className="h-6 w-6 text-cyan-500" />
                </div>
              </div>

              <div className="space-y-6">
                {upcomingClasses.length === 0 ? (
                  <div className="py-24 text-center glass rounded-3xl border-dashed border-2 border-slate-200 dark:border-white/5">
                     <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Neutral Network State: Idle</p>
                  </div>
                ) : (
                  upcomingClasses.map((cls, i) => (
                    <motion.div
                      whileHover={{ x: 10 }}
                      key={i}
                      className="flex items-center gap-8 p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group"
                    >
                      <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl w-24 shrink-0 shadow-inner group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-colors duration-500">
                        <span className="text-[10px] font-black uppercase tracking-widest">{format(new Date(cls.date), "HH:mm")}</span>
                        <div className="w-4 h-px bg-current my-1 opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">UTC+</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-tight">{cls.subject.name}</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 opacity-70">
                          {cls.faculty.user.name} <span className="mx-2">/</span> {cls.room || "Node Sector A"}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-4">
                         <Badge className="bg-cyan-500 text-slate-950 font-black uppercase tracking-widest text-[9px] hover:bg-cyan-600 border-0 rounded-full px-3 h-6 shadow-[0_4px_10px_rgba(6,182,212,0.3)]">Active</Badge>
                         <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-cyan-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[60px] -mr-32 -mt-32" />
        </motion.div>

        {/* Intelligence Stream: Notifications */}
        <motion.div 
            variants={item}
            className="lg:col-span-2 glass rounded-[3.5rem] p-12 space-y-10 flex flex-col"
        >
          <div className="flex items-center justify-between">
             <div className="flex flex-col">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 italic">Signal Flow</h3>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white leading-none">Inbox</h2>
             </div>
             <div className="relative">
                <Bell className="h-6 w-6 text-slate-300" />
                <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_theme('colors.cyan.500')]" />
             </div>
          </div>

          <div className="flex-1 space-y-8">
            {notifications.length === 0 ? (
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic py-12 text-center opacity-50">No inbound signals detected.</p>
            ) : (
              notifications.slice(0, 4).map((notif, i) => (
                <div key={i} className="flex gap-4 group cursor-default">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-cyan-500 group-hover:scale-150 transition-transform duration-500 bg-glow-cyan" />
                  <div className="space-y-1">
                    <p className="text-[13px] font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">{notif.title}</p>
                    <p className="text-[11px] text-slate-500 font-bold italic leading-relaxed opacity-70 line-clamp-2 mt-1">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">{format(new Date(notif.createdAt), "MMM dd")}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-white/10" />
                        <span className="text-[9px] text-cyan-600 dark:text-cyan-400 font-black uppercase tracking-widest">Protocol Sync</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-8 border-t border-slate-200/50 dark:border-white/5 space-y-6">
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-[10px] font-black italic uppercase mb-2">
                       <span>Syllabus Coverage</span>
                       <span className="text-cyan-500">74%</span>
                    </div>
                    <Progress value={74} className="h-1.5 bg-slate-100 dark:bg-white/5" />
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] font-black italic uppercase mb-2">
                       <span>Attendance Quota</span>
                       <span className="text-emerald-500">92%</span>
                    </div>
                    <Progress value={92} className="h-1.5 bg-slate-100 dark:bg-white/5" />
                 </div>
              </div>
              <Button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black italic uppercase tracking-widest py-6 rounded-2xl hover:bg-cyan-500 hover:text-slate-900 transition-colors">
                 Verify Terminal Status
              </Button>
          </div>
        </motion.div>
      </div>

      {/* Quick Access */}
      <div className="glass p-12 rounded-[4rem] space-y-10">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Rapid Overrides</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: "Intelligence", icon: FileText, href: "/student/resources" },
            { label: "Assessments", icon: Zap, href: "/student/tests" },
            { label: "Portfolio", icon: Globe, href: `/portfolio/${student?.id}` },
            { label: "Resources", icon: TrendingUp, href: "/student/fees" },
          ].map((link, idx) => (
            <motion.a
                whileHover={{ y: -5, scale: 1.05 }}
                key={link.label}
                href={link.href}
                className="group relative flex flex-col items-center gap-6 p-10 rounded-[2.5rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-slate-950 dark:hover:bg-white transition-all duration-500 shadow-sm"
            >
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <link.icon className="h-6 w-6 text-slate-600 group-hover:text-cyan-500 transition-colors" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-white dark:group-hover:text-slate-950 transition-colors">{link.label}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Globe(props: any) {
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
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20" />
          <path d="M2 12h20" />
        </svg>
    )
}
