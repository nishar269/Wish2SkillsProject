"use client";

import { useState, useTransition } from "react";
import { getSessionStudents, markAttendanceBulk } from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Save, Users, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
type Session = {
  id: string;
  date: Date;
  subject: { name: string };
  batch: { name: string };
};
type Student = Awaited<ReturnType<typeof getSessionStudents>>[number] & {
  currentStatus: AttendanceStatus;
};

export default function SessionAttendanceClientPage({
  session,
  initialStudents,
}: {
  session: Session;
  initialStudents: Awaited<ReturnType<typeof getSessionStudents>>;
}) {
  const [students, setStudents] = useState(initialStudents.map(s => ({
    ...s,
    currentStatus: s.attendances[0]?.status || "ABSENT"
  })) as Student[]);
  
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, currentStatus: status } : s
    ));
  };

  const handleSave = async () => {
    const records = students.map(s => ({
        studentId: s.id,
        status: s.currentStatus
    }));

    startTransition(async () => {
        const res = await markAttendanceBulk(session.id, records);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Attendance updated successfully!");
        }
    });
  };

  const presentCount = students.filter(s => s.currentStatus === "PRESENT").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/faculty/attendance"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mark Attendance</h1>
            <p className="text-muted-foreground">{session.subject.name} • {session.batch.name} • {format(new Date(session.date), "PPP")}</p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
          <Save className="h-4 w-4 mr-2" /> 
          {isPending ? "Saving..." : "Save attendance"}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-emerald-600">Present</p>
                        <p className="text-2xl font-bold text-emerald-700">{presentCount}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-emerald-500 opacity-20" />
                </div>
            </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-100">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-red-600">Absent</p>
                        <p className="text-2xl font-bold text-red-700">{students.length - presentCount}</p>
                    </div>
                    <UserX className="h-8 w-8 text-red-500 opacity-20" />
                </div>
            </CardContent>
        </Card>
        <Card className="bg-slate-50 dark:bg-slate-950/20 border-slate-100">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-600">Total Students</p>
                        <p className="text-2xl font-bold text-slate-700">{students.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-slate-500 opacity-20" />
                </div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Enrollment No</TableHead>
                <TableHead className="text-center">Present</TableHead>
                <TableHead className="text-center">Absent</TableHead>
                <TableHead className="text-center">Late</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.user.name}</TableCell>
                  <TableCell className="text-xs font-mono">{student.enrollmentNo || "N/A"}</TableCell>
                  <TableCell className="text-center">
                    <input 
                        type="radio" 
                        name={`status-${student.id}`} 
                        checked={student.currentStatus === "PRESENT"}
                        onChange={() => handleStatusChange(student.id, "PRESENT")}
                        className="h-4 w-4 text-emerald-600 cursor-pointer"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <input 
                        type="radio" 
                        name={`status-${student.id}`} 
                        checked={student.currentStatus === "ABSENT"}
                        onChange={() => handleStatusChange(student.id, "ABSENT")}
                        className="h-4 w-4 text-red-600 cursor-pointer"
                    />
                  </TableCell>
                   <TableCell className="text-center">
                    <input 
                        type="radio" 
                        name={`status-${student.id}`} 
                        checked={student.currentStatus === "LATE"}
                        onChange={() => handleStatusChange(student.id, "LATE")}
                        className="h-4 w-4 text-amber-600 cursor-pointer"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
