import { auth } from "@/lib/auth";
import { getAuthorityDashboardData } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  BarChart3,
  TrendingUp,
  Clock,
  Fingerprint,
} from "lucide-react";
import { format } from "date-fns";

export default async function AdminDashboardPage() {
  const session = await auth();
  const { studentCount, facultyCount, courseCount, recentLogs } = await getAuthorityDashboardData();

  const stats = [
    {
      title: "Total Students",
      value: studentCount.toString(),
      change: "Active Enrollment",
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Active Faculty",
      value: facultyCount.toString(),
      change: "Certified Instructors",
      icon: GraduationCap,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Academic Courses",
      value: courseCount.toString(),
      change: "Live Curriculums",
      icon: BookOpen,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "System Logs",
      value: recentLogs.length.toString(),
      change: "Recent Operations",
      icon: Calendar,
      color: "from-amber-500 to-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm italic">
          Live institutional command center. Everything is synchronized with the database.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all hover:scale-[1.02] duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.title}</p>
                  <p className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg shadow-cyan-500/20`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 font-black uppercase tracking-tighter">
              <BarChart3 className="h-5 w-5 text-cyan-600" />
              Quick Console
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: "Add Student", icon: "👨‍🎓", href: "/admin/students" },
              { label: "Add Faculty", icon: "👨‍🏫", href: "/admin/faculty" },
              { label: "Create Batch", icon: "📦", href: "/admin/batches" },
              { label: "Global Schedule", icon: "📅", href: "/calendar" },
              { label: "Broadcast", icon: "📢", href: "/admin/notifications" },
              { label: "Security Logs", icon: "🛡️", href: "/admin/audit" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-300 group shadow-sm"
              >
                <span className="text-3xl group-hover:scale-125 transition-transform duration-300">
                  {action.icon}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest">{action.label}</span>
              </a>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 font-black uppercase tracking-tighter">
              <Clock className="h-5 w-5 text-cyan-600" />
              Recent System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground italic p-10 text-center">No system activity logged today.</p>
              ) : (
                recentLogs.map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-3xl border border-slate-50 hover:bg-slate-100/50 dark:border-slate-900 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                      <Fingerprint className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black">{log.action}: {log.entity}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">{log.user.name} • {log.user.role}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-muted-foreground font-mono">{format(new Date(log.createdAt), "HH:mm")}</p>
                       <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100 border-0 text-[8px] h-4">Verified</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500 text-white text-[10px] font-black tracking-widest uppercase mb-2">
                System Health
            </div>
            <h3 className="text-3xl font-black italic tracking-tighter">Institute Intelligence Active</h3>
            <p className="opacity-70 text-sm max-w-md italic">CampusOS is monitoring attendance integrity, financial velocity, and academic throughput in real-time.</p>
        </div>
        <div className="relative z-10">
            <TrendingUp className="h-16 w-16 opacity-30 rotate-12" />
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl -mr-20 -mt-20" />
      </Card>
    </div>
  );
}
