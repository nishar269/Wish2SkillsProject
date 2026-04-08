import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardCheck,
  Calendar,
  FileText,
  TrendingUp,
  BookOpen,
  Bell,
  Clock,
  Target,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const session = await auth();

  const stats = [
    {
      title: "Attendance",
      value: "87%",
      detail: "12 classes this week",
      icon: ClipboardCheck,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Next Class",
      value: "React",
      detail: "Today 2:00 PM - Lab 3",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Latest Score",
      value: "92/100",
      detail: "Weekly Test #12 - Rank #3",
      icon: FileText,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Performance",
      value: "A+",
      detail: "Top 5% of batch",
      icon: TrendingUp,
      color: "from-amber-500 to-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hey, {session?.user?.name?.split(" ")[0]}! 🎓
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your academic overview for today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.detail}</p>
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

      {/* Today's Schedule & Notifications */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-600" />
              Today&apos;s Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: "9:00 AM", subject: "Java Basics", faculty: "Prof. Sharma", room: "Lab 1", status: "completed" },
                { time: "11:00 AM", subject: "SQL & Databases", faculty: "Prof. Patel", room: "Room 204", status: "completed" },
                { time: "2:00 PM", subject: "React.js", faculty: "Prof. Kumar", room: "Lab 3", status: "upcoming" },
                { time: "4:00 PM", subject: "DSA Practice", faculty: "Prof. Singh", room: "Lab 2", status: "upcoming" },
              ].map((cls, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                    cls.status === "completed"
                      ? "border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/20"
                      : cls.status === "upcoming"
                      ? "border-cyan-100 bg-cyan-50/50 dark:border-cyan-900/30 dark:bg-cyan-950/20"
                      : "border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <div className="text-center w-16 shrink-0">
                    <p className="text-xs text-muted-foreground font-medium">{cls.time}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{cls.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {cls.faculty} • {cls.room}
                    </p>
                  </div>
                  <Badge
                    variant={cls.status === "completed" ? "secondary" : "default"}
                    className={
                      cls.status === "completed"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                        : "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-400"
                    }
                  >
                    {cls.status === "completed" ? "Done" : "Upcoming"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-cyan-600" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: "New material uploaded", desc: "React Hooks Guide added for MERN-B05", time: "1h ago", type: "info" },
                { title: "Test scheduled", desc: "Weekly Test #13 on Friday", time: "3h ago", type: "warning" },
                { title: "Results published", desc: "Weekly Test #12 - Score: 92/100", time: "1d ago", type: "success" },
                { title: "Low attendance warning", desc: "Your attendance in SQL is 72%", time: "2d ago", type: "alert" },
              ].map((notif, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    notif.type === "success" ? "bg-emerald-500"
                    : notif.type === "warning" ? "bg-amber-500"
                    : notif.type === "alert" ? "bg-red-500"
                    : "bg-cyan-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.desc}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {notif.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan-600" />
            Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Attendance", icon: "📋", href: "/student/attendance" },
              { label: "Timetable", icon: "📅", href: "/student/timetable" },
              { label: "Materials", icon: "📚", href: "/student/materials" },
              { label: "Tests", icon: "📝", href: "/student/tests" },
              { label: "Feedback", icon: "💬", href: "/student/feedback" },
              { label: "Profile", icon: "👤", href: "/student/profile" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all duration-200 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {link.icon}
                </span>
                <span className="text-xs font-medium">{link.label}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
