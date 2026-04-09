import { auth } from "@/lib/auth";
import { getStudentDashboardData } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardCheck,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  Bell,
  Target,
} from "lucide-react";
import { format } from "date-fns";

export default async function StudentDashboardPage() {
  const session = await auth();
  const { 
    student,
    attendancePercentage, 
    upcomingClasses, 
    notifications, 
    latestResult 
  } = await getStudentDashboardData();

  const stats = [
    {
      title: "Self Attendance",
      value: `${attendancePercentage}%`,
      detail: attendancePercentage >= 75 ? "On track" : "Below 75%",
      icon: ClipboardCheck,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Next Class",
      value: upcomingClasses[0]?.subject.name || "None",
      detail: upcomingClasses[0] ? format(new Date(upcomingClasses[0].date), "p 'at' " + upcomingClasses[0].room) : "No classes today",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Latest Score",
      value: latestResult ? `${latestResult.marksObtained}/${latestResult.test.totalMarks}` : "N/A",
      detail: latestResult?.test.title || "No tests taken",
      icon: FileText,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Performance",
      value: attendancePercentage > 90 ? "A+" : attendancePercentage > 80 ? "A" : "B",
      detail: "Based on active presence",
      icon: TrendingUp,
      color: "from-amber-500 to-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hey, {session?.user?.name?.split(" ")[0]}! 🎓
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your live academic pulse for today.
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
              <Clock className="h-5 w-5 text-cyan-600" />
              Today&apos;s Live Schedule
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
                    className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <div className="text-center w-16 shrink-0">
                      <p className="text-xs text-muted-foreground font-bold">{format(new Date(cls.date), "p")}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{cls.subject.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {cls.faculty.user.name} • {cls.room || "Room 201"}
                      </p>
                    </div>
                    <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-0">Upcoming</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-cyan-600" />
              Latest Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Your inbox is empty.</p>
              ) : (
                notifications.map((notif, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <div className="mt-1 w-2 h-2 rounded-full shrink-0 bg-cyan-500 shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{notif.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{notif.message}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {format(new Date(notif.createdAt), "MMM dd")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
              { label: "Certificates", icon: "🥇", href: "/student/certificates" },
              { label: "Materials", icon: "📚", href: "/student/resources" },
              { label: "Assessments", icon: "📝", href: "/student/tests" },
              { label: "Portfolio", icon: "🌐", href: `/portfolio/${student.id}` },
              { label: "Finances", icon: "💰", href: "/student/fees" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-cyan-200 transition-all duration-300 group shadow-sm"
              >
                <span className="text-2xl group-hover:scale-125 transition-transform duration-300">
                  {link.icon}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest">{link.label}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
