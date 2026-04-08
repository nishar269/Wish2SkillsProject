import { auth } from "@/lib/auth";
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
  AlertCircle,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();

  const stats = [
    {
      title: "Total Students",
      value: "245",
      change: "+12 this month",
      changeType: "positive" as const,
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Active Faculty",
      value: "18",
      change: "+2 this month",
      changeType: "positive" as const,
      icon: GraduationCap,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Active Courses",
      value: "8",
      change: "3 new batches",
      changeType: "neutral" as const,
      icon: BookOpen,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Today's Classes",
      value: "12",
      change: "2 remaining",
      changeType: "neutral" as const,
      icon: Calendar,
      color: "from-amber-500 to-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening at your institute today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                  <div className="flex items-center gap-1.5">
                    {stat.changeType === "positive" && (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                    <p className={`text-xs font-medium ${
                      stat.changeType === "positive" ? "text-emerald-600" : "text-muted-foreground"
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              {/* Gradient accent line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: "Add Student", icon: "👨‍🎓", href: "/admin/students" },
              { label: "Add Faculty", icon: "👨‍🏫", href: "/admin/faculty" },
              { label: "Create Batch", icon: "📦", href: "/admin/batches" },
              { label: "Schedule Class", icon: "📅", href: "/admin/schedule" },
              { label: "Send Notice", icon: "📢", href: "/admin/notifications" },
              { label: "View Reports", icon: "📊", href: "/admin/reports" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all duration-200 group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {action.icon}
                </span>
                <span className="text-sm font-medium">{action.label}</span>
              </a>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "New student registered",
                  detail: "Rahul Kumar joined JFS-B12",
                  time: "2 hours ago",
                  badge: "New",
                  badgeVariant: "default" as const,
                },
                {
                  action: "Attendance marked",
                  detail: "JFS-B12 - Java Basics (92%)",
                  time: "3 hours ago",
                  badge: "Attendance",
                  badgeVariant: "secondary" as const,
                },
                {
                  action: "Material uploaded",
                  detail: "React Hooks Guide - MERN-B05",
                  time: "5 hours ago",
                  badge: "Content",
                  badgeVariant: "secondary" as const,
                },
                {
                  action: "Test results published",
                  detail: "Weekly Test #12 - Python-B03",
                  time: "1 day ago",
                  badge: "Results",
                  badgeVariant: "secondary" as const,
                },
                {
                  action: "Low attendance alert",
                  detail: "3 students below 75% in JFS-B12",
                  time: "1 day ago",
                  badge: "Alert",
                  badgeVariant: "destructive" as const,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <div className="mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={item.badgeVariant} className="text-[10px] h-5">
                      {item.badge}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Overview */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Batch Attendance Overview
            </CardTitle>
            <Badge variant="secondary" className="font-medium">This Week</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { batch: "JFS-B12", course: "Java Full Stack", attendance: 92, students: 32 },
              { batch: "MERN-B05", course: "MERN Stack", attendance: 87, students: 28 },
              { batch: "PY-B03", course: "Python Full Stack", attendance: 78, students: 30 },
              { batch: "DS-B01", course: "Data Science", attendance: 95, students: 25 },
            ].map((batch) => (
              <div key={batch.batch} className="flex items-center gap-4">
                <div className="w-32 shrink-0">
                  <p className="text-sm font-semibold">{batch.batch}</p>
                  <p className="text-xs text-muted-foreground">{batch.course}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          batch.attendance >= 90
                            ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                            : batch.attendance >= 80
                            ? "bg-gradient-to-r from-amber-400 to-amber-500"
                            : "bg-gradient-to-r from-red-400 to-red-500"
                        }`}
                        style={{ width: `${batch.attendance}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold w-12 text-right ${
                      batch.attendance >= 90
                        ? "text-emerald-600"
                        : batch.attendance >= 80
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}>
                      {batch.attendance}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-20 text-right">
                  {batch.students} students
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
