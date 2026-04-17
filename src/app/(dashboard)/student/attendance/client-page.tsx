"use client";

import { useTransition } from "react";
import { getStudentAttendance, selfMarkAttendance } from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type AttendanceHistory = Awaited<ReturnType<typeof getStudentAttendance>>;
type AvailableSession = {
  id: string;
  startTime: Date;
  subject: { name: string };
} | null;

export default function StudentAttendanceClientPage({
  history,
  availableSession,
}: {
  history: AttendanceHistory;
  availableSession: AvailableSession;
}) {
  const [isPending, startTransition] = useTransition();

  const handleMarkAttendance = () => {
    if (!availableSession) return;

    if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser.");
        return;
    }

    startTransition(async () => {
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            });

            const res = await selfMarkAttendance(availableSession.id, {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });

            if (res?.error) {
                toast.error(res.error);
            } else {
                toast.success("Attendance verified and marked!");
            }
        } catch {
            toast.error("Unable to retrieve your location. Check your permission settings and GPS.");
        }
    });
  };

  const attendanceRate = history.length > 0 
    ? (history.filter(h => h.status === "PRESENT" || h.status === "LATE").length / history.length * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Attendance</h1>
          <p className="text-muted-foreground">Monitor your presence and mark today&apos;s attendance.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-sm font-medium text-muted-foreground">Overall Rate:</span>
            <span className={`text-lg font-bold ${Number(attendanceRate) >= 80 ? "text-emerald-500" : "text-amber-500"}`}>{attendanceRate}%</span>
        </div>
      </div>

      {availableSession ? (
        <Card className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white border-0 shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">On Session</Badge>
                </div>
                <CardTitle className="text-2xl font-bold">Class is now available</CardTitle>
                <CardDescription className="text-blue-100 flex items-center gap-2">
                    {availableSession.subject.name} • {format(new Date(availableSession.startTime), "p")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button 
                    onClick={handleMarkAttendance} 
                    disabled={isPending}
                    className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 shadow-xl"
                >
                   {isPending ? "Processing..." : "Mark as Present"}
                </Button>
            </CardContent>
        </Card>
      ) : (
          <Card className="bg-slate-100 dark:bg-slate-900/50 border-dashed border-2">
               <CardContent className="py-8 flex flex-col items-center justify-center text-center">
                    <Clock className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="font-bold text-slate-600">No active session</h3>
                    <p className="text-sm text-muted-foreground">You can mark attendance once your next class session starts.</p>
               </CardContent>
          </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attendance History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No attendance records yet.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                        {format(new Date(record.session.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>{record.session.subject.name}</TableCell>
                    <TableCell className="text-sm">{record.session.faculty.user.name}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === "PRESENT" ? "default" : "secondary"} 
                        className={
                            record.status === "PRESENT" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
