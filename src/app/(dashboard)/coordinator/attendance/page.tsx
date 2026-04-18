import { getCoordinatorAttendanceOverview } from "@/actions/attendance";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarClock, ClipboardCheck, ShieldCheck, Users } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function CoordinatorAttendancePage() {
  const data = await getCoordinatorAttendanceOverview();

  const overallCoverage = data.sessionsToday.reduce((total, session) => {
    const studentCount = session.batch._count.students;
    if (studentCount === 0) {
      return total;
    }

    return total + session._count.attendances / studentCount;
  }, 0);

  const averageCoverage = data.sessionsToday.length > 0
    ? Math.round((overallCoverage / data.sessionsToday.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Oversight</h1>
        <p className="text-muted-foreground mt-1">
          Monitor attendance capture across active sessions and identify lagging batches quickly.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Sessions Today</p>
                <p className="text-3xl font-bold tracking-tight">{data.sessionsToday.length}</p>
              </div>
              <div className="rounded-xl bg-blue-600 p-3 text-white">
                <CalendarClock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Active Batches</p>
                <p className="text-3xl font-bold tracking-tight">{data.activeBatches.length}</p>
              </div>
              <div className="rounded-xl bg-amber-600 p-3 text-white">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Marked Today</p>
                <p className="text-3xl font-bold tracking-tight">{data.attendanceMarkedToday}</p>
              </div>
              <div className="rounded-xl bg-emerald-600 p-3 text-white">
                <ClipboardCheck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Coverage</p>
                <p className="text-3xl font-bold tracking-tight">{averageCoverage}%</p>
              </div>
              <div className="rounded-xl bg-slate-900 p-3 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Today&apos;s Attendance Queue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Attendance Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.sessionsToday.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                    No class sessions are scheduled today.
                  </TableCell>
                </TableRow>
              ) : (
                data.sessionsToday.map((session) => {
                  const studentCount = session.batch._count.students;
                  const coverage = studentCount > 0
                    ? Math.round((session._count.attendances / studentCount) * 100)
                    : 0;

                  return (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold">{session.subject.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(session.date), "MMM dd")} at {format(new Date(session.startTime), "p")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{session.faculty.user.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {session.batch.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-48">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">{session._count.attendances}/{studentCount}</span>
                            <span className="text-muted-foreground">{coverage}%</span>
                          </div>
                          <Progress value={coverage} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={coverage >= 80 ? "border-none bg-emerald-50 text-emerald-700" : "border-none bg-amber-50 text-amber-700"}
                        >
                          {coverage >= 80 ? "On Track" : "Needs Follow-up"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
