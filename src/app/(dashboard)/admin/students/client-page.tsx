"use client";

import { useState, useTransition } from "react";
import { createStudent, deleteStudent } from "@/actions/student-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Users, Mail, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export default function StudentClientPage({ 
  initialStudents, 
  courses, 
  batches 
}: { 
  initialStudents: any[],
  courses: any[],
  batches: any[]
}) {
  const [students, setStudents] = useState(initialStudents);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // For controlled course/batch selection
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const filteredBatches = batches.filter(b => b.courseId === selectedCourseId);

  async function handleSubmit(formData: FormData) {
    const data = Object.fromEntries(formData);

    startTransition(async () => {
      const res = await createStudent(data);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Student enrolled successfully!");
        setIsOpen(false);
        setSelectedCourseId("");
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this student?")) return;
    
    startTransition(async () => {
        const res = await deleteStudent(id);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("Student record deleted.");
        }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">Enroll and manage student records.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Enroll Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Enroll New Student</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" placeholder="Rahul Kumar" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" placeholder="rahul@example.com" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Login Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" placeholder="+91..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Enroll for Course</Label>
                  <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                    <select 
                        name="courseId" 
                        required 
                        className="w-full bg-transparent outline-none text-sm"
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                    >
                        <option value="" disabled>Select Course</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Assign to Batch</Label>
                   <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                    <select 
                        name="batchId" 
                        required 
                        className="w-full bg-transparent outline-none text-sm"
                        disabled={!selectedCourseId}
                    >
                        <option value="" disabled selected>Select Batch</option>
                        {filteredBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="enrollmentNo">Enrollment No. (Optional)</Label>
                  <Input id="enrollmentNo" name="enrollmentNo" placeholder="ENR-2024-001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Parent&apos;s Phone</Label>
                  <Input id="parentPhone" name="parentPhone" placeholder="+91..." />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input id="address" name="address" placeholder="123, Street Name, City" />
              </div>

              <Button type="submit" disabled={isPending} className="w-full bg-cyan-600 hover:bg-cyan-700">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Enroll & Create Account
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Enrollment No</TableHead>
                <TableHead>Course & Batch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No students currently enrolled.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{s.user.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {s.user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {s.enrollmentNo || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{s.course.name}</p>
                        <Badge variant="secondary" className="text-[10px] h-4">
                           {s.batch.name}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.user.status === "ACTIVE" ? "default" : "secondary"}>
                        {s.user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(s.id)} disabled={isPending}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
