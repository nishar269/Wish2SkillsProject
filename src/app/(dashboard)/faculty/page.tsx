import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ClipboardCheck,
  Upload,
  Users,
  BookOpen,
  FileText,
  Clock,
  TrendingUp,
} from "lucide-react";

export default async function FacultyDashboardPage() {
  const session = await auth();

  const stats = [
    {
      title: "Today's Classes",
      value: "4",
      detail: "2 completed, 2 upcoming",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Avg Attendance",
      value: "89%",
      detail: "Across all batches",
      icon: ClipboardCheck,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Materials",
      value: "24",
      detail: "3 uploaded this week",
      icon: Upload,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Students",
      value: "93",
      detail: "Across 3 batches",
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
          Manage your classes and track student progress.
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

      {/* Actions & Schedule */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cyan-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: "Mark Attendance", icon: "✅", href: "/faculty/attendance" },
              { label: "Upload Notes", icon: "📤", href: "/faculty/materials" },
              { label: "Create Test", icon: "📝", href: "/faculty/tests" },
              { label: "View Students", icon: "👨‍🎓", href: "/faculty/students" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all duration-200 group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {action.icon}
                </span>
                <span className="text-sm font-medium">{action.label}</span>
              </a>
            ))}
          </CardContent>
        </Card>

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
                { time: "9:00 AM", subject: "Java Basics", batch: "JFS-B12", room: "Lab 1", status: "completed" },
                { time: "11:00 AM", subject: "OOP Concepts", batch: "JFS-B12", room: "Room 204", status: "completed" },
                { time: "2:00 PM", subject: "React.js", batch: "MERN-B05", room: "Lab 3", status: "upcoming" },
                { time: "4:00 PM", subject: "Node.js", batch: "MERN-B05", room: "Lab 3", status: "upcoming" },
              ].map((cls, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-3 rounded-xl border ${
                    cls.status === "completed"
                      ? "border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/20"
                      : "border-cyan-100 bg-cyan-50/50 dark:border-cyan-900/30 dark:bg-cyan-950/20"
                  }`}
                >
                  <div className="text-center w-16 shrink-0">
                    <p className="text-xs text-muted-foreground font-medium">{cls.time}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{cls.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {cls.batch} • {cls.room}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
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
      </div>

      {/* Batch Performance */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-600" />
            Batch Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { batch: "JFS-B12", avgScore: 85, attendance: 92, students: 32, trend: "up" },
              { batch: "MERN-B05", avgScore: 78, attendance: 87, students: 28, trend: "up" },
              { batch: "PY-B03", avgScore: 72, attendance: 78, students: 30, trend: "down" },
            ].map((batch) => (
              <div
                key={batch.batch}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold">{batch.batch}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {batch.students} students
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Score</span>
                    <span className="font-semibold">{batch.avgScore}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Attendance</span>
                    <span className="font-semibold">{batch.attendance}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
