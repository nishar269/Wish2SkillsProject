import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Calendar, BookOpen, GraduationCap } from "lucide-react";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage() {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") redirect("/login");

  const student = await db.student.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      course: true,
      batch: true,
      attendances: true,
      results: true,
    }
  });

  if (!student) return <div className="p-6 text-red-500">Profile data not found. Contact administrator.</div>;

  const attendanceAvg = student.attendances.length > 0
    ? Math.round((student.attendances.filter(a => a.status === "PRESENT").length / student.attendances.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and academic record.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-cyan-500/20 shadow-lg shadow-cyan-500/5 transition-all hover:scale-[1.01]">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-xl">
              {student.user.name.charAt(0)}
            </div>
            <CardTitle>{student.user.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-1 mt-1">
              <Badge variant="outline" className="bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                {student.enrollmentNo || "ENR-PENDING"}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <Mail className="h-4 w-4" />
              {student.user.email}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <Phone className="h-4 w-4" />
              {student.user.phone || "No phone added"}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="h-4 w-4" />
              Joined: {format(student.user.createdAt, "MMM dd, yyyy")}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cyan-600" /> Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Course</span>
                <p className="font-medium text-lg">{student.course.name}</p>
                <div className="text-xs text-muted-foreground font-mono">{student.course.code}</div>
              </div>
              <div className="space-y-1 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Batch Allocation</span>
                <p className="font-medium text-lg">{student.batch.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                <div className="space-y-1">
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider">Overall Attendance</span>
                    <p className="font-medium text-emerald-800 dark:text-emerald-300">Based on {student.attendances.length} Sessions</p>
                </div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-500">{attendanceAvg}%</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-100 dark:border-orange-900/50">
                <div className="space-y-1">
                    <span className="text-xs text-orange-700 dark:text-orange-400 font-semibold uppercase tracking-wider">Assessments Taken</span>
                    <p className="font-medium text-orange-800 dark:text-orange-300">Total Valid Submissions</p>
                </div>
                <div className="text-3xl font-black text-orange-600 dark:text-orange-500">{student.results.length}</div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold mb-3">System Permissions</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800"><User className="h-3 w-3 mr-1"/> Student Access</Badge>
                <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800"><GraduationCap className="h-3 w-3 mr-1"/> LMS Materials</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
