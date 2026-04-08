import { auth } from "@/lib/auth";
import { getFacultyDashboardData } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ClipboardCheck,
  Upload,
  Users,
  BookOpen,
  Clock,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";

export default async function FacultyDashboardPage() {
  const session = await auth();
  const { 
    upcomingClasses, 
    totalMaterials, 
    activeAssignments, 
    loadCount 
  } = await getFacultyDashboardData();

  const stats = [
    {
      title: "Active Load",
      value: loadCount.toString(),
      detail: "Assigned subjects & batches",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Upcoming Classes",
      value: upcomingClasses.length.toString(),
      detail: "Scheduled for next 24h",
      icon: ClipboardCheck,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Shared Resources",
      value: totalMaterials.toString(),
      detail: "Course materials uploaded",
      icon: Upload,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Assignments",
      value: activeAssignments.toString(),
      detail: "Active coursework items",
      icon: Users,
      color: "from-amber-500 to-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Good day, {session?.user?.name?.split(" ")[0]}! 👨‍🏫
        </h1>
        <p className="text-muted-foreground mt-1">
          Managing your live academic workload.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-transform hover:scale-[1.02] duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  <p className="text-2xl font-black italic tracking-tighter">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-semibold">{stat.detail}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cyan-600" />
              Quick Console
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: "Mark Attendance", icon: "✅", href: "/faculty/attendance" },
              { label: "Course Materials", icon: "📤", href: "/faculty/resources" },
              { label: "MCQ Assessment", icon: "📝", href: "/faculty/tests" },
              { label: "Institute Calendar", icon: "📅", href: "/calendar" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-cyan-200 transition-all duration-300 group shadow-sm"
              >
                <span className="text-xl group-hover:rotate-12 transition-transform">
                  {action.icon}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest">{action.label}</span>
              </a>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-600" />
              Upcoming Agenda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingClasses.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No classes scheduled for today.</p>
              ) : (
                upcomingClasses.map((cls, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-100/30 dark:border-slate-800 dark:bg-slate-900/10"
                  >
                    <div className="text-center w-16 shrink-0">
                      <p className="text-xs text-muted-foreground font-black">{format(new Date(cls.date), "p")}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{cls.subject.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">
                        {cls.batch.name} • {cls.room || "Room 302"}
                      </p>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Live Today</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
        <CardContent className="p-8 flex items-center justify-between">
            <div className="space-y-2">
                <h3 className="text-2xl font-black">Generate Performance Insight</h3>
                <p className="text-cyan-100 text-sm max-w-md italic">Use CampusOS AI to analyze your batch&apos;s attendance and test performance trends instantly.</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                <TrendingUp className="h-8 w-8 text-white" />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
