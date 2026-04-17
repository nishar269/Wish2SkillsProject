"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Layers3, Loader2, Mail, Plus, Sparkles, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { getBatches, getCourses } from "@/actions/admin";
import { createStudent, deleteStudent, getStudents } from "@/actions/student-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function StudentClientPage({
  initialStudents,
  courses,
  batches,
}: {
  initialStudents: Awaited<ReturnType<typeof getStudents>>;
  courses: Awaited<ReturnType<typeof getCourses>>;
  batches: Awaited<ReturnType<typeof getBatches>>;
}) {
  const router = useRouter();
  const [students] = useState(initialStudents);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const filteredBatches = batches.filter((batch) => batch.courseId === selectedCourseId);
  const summary = useMemo(() => {
    const activeStudents = students.filter((student) => student.user.status === "ACTIVE").length;
    const uniqueCourses = new Set(students.map((student) => student.course.id)).size;
    const uniqueBatches = new Set(students.map((student) => student.batch.id)).size;

    return [
      {
        label: "Enrolled Students",
        value: students.length,
        detail: "Live records",
        icon: Users,
        iconClass: "bg-[#f4ede2] text-[#8d6a32]",
      },
      {
        label: "Active Accounts",
        value: activeStudents,
        detail: "Ready to access",
        icon: Sparkles,
        iconClass: "bg-[#e7f1ed] text-[#2d6a57]",
      },
      {
        label: "Courses Covered",
        value: uniqueCourses,
        detail: "Across the institution",
        icon: GraduationCap,
        iconClass: "bg-[#e8edf6] text-[#37518c]",
      },
      {
        label: "Batches Live",
        value: uniqueBatches,
        detail: "Student clusters",
        icon: Layers3,
        iconClass: "bg-[#efe7f7] text-[#7550a9]",
      },
    ];
  }, [students]);

  async function handleSubmit(formData: FormData) {
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      phone: formData.get("phone") as string,
      courseId: formData.get("courseId") as string,
      batchId: formData.get("batchId") as string,
      enrollmentNo: formData.get("enrollmentNo") as string,
      parentPhone: formData.get("parentPhone") as string,
      address: formData.get("address") as string,
    };

    startTransition(async () => {
      const res = await createStudent(data);
      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Student enrolled successfully.");
      router.refresh();
      setIsOpen(false);
      setSelectedCourseId("");
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this student?")) {
      return;
    }

    startTransition(async () => {
      const res = await deleteStudent(id);
      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Student record deleted.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8 pb-12">
      <section className="premium-shell px-6 py-6 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="premium-kicker border-[#e0d5c4] bg-white/55 text-[#9d7b43]">
              <Users className="h-3.5 w-3.5" />
              Student Registry
            </div>
            <div>
              <h1 className="premium-title text-5xl text-[#141c2d]">Enrollment command center</h1>
              <p className="pt-2 text-sm leading-relaxed text-[#655742]">
                Manage student onboarding, course placement and account readiness from a single premium workspace.
              </p>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" onClick={() => setIsOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Enroll Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl border-white/70 bg-[#faf6ef] p-0 shadow-[0_28px_80px_rgba(20,28,45,0.18)]">
              <DialogHeader className="border-b border-[#e2d7c8] px-6 py-5">
                <DialogTitle className="premium-title text-4xl text-[#141c2d]">Enroll new student</DialogTitle>
              </DialogHeader>
              <form action={handleSubmit} className="space-y-6 px-6 py-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" placeholder="Rahul Kumar" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" placeholder="rahul@example.com" required />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">Login Password</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" placeholder="+91..." />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Enroll for Course</Label>
                    <div className="premium-select-shell">
                      <select
                        name="courseId"
                        required
                        className="w-full bg-transparent text-sm text-[#141c2d] outline-none"
                        value={selectedCourseId}
                        onChange={(event) => setSelectedCourseId(event.target.value)}
                      >
                        <option value="" disabled>
                          Select Course
                        </option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Assign to Batch</Label>
                    <div className="premium-select-shell">
                      <select
                        name="batchId"
                        required
                        className="w-full bg-transparent text-sm text-[#141c2d] outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        defaultValue=""
                        disabled={!selectedCourseId}
                      >
                        <option value="" disabled>
                          Select Batch
                        </option>
                        {filteredBatches.map((batch) => (
                          <option key={batch.id} value={batch.id}>
                            {batch.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
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

                <div className="flex flex-col gap-3 border-t border-[#e2d7c8] pt-5 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" size="lg" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="lg" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Enroll and Create Account
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-4">
        {summary.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#92754a]">{item.label}</p>
                  <h2 className="pt-3 text-3xl font-bold tracking-tight text-[#141c2d]">{item.value}</h2>
                  <p className="pt-2 text-sm text-[#6b5b45]">{item.detail}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconClass}`}>
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="premium-shell px-4 py-4 md:px-5">
        <div className="mb-4 flex flex-col gap-2 px-1 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="premium-title text-4xl text-[#141c2d]">Student Records</h2>
            <p className="pt-1 text-sm text-[#6b5b45]">
              Batch placement, status visibility and contact access for every enrollment.
            </p>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#92754a]">
            {students.length} total records
          </p>
        </div>

        <div className="premium-table-wrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Enrollment No</TableHead>
                <TableHead>Course and Batch</TableHead>
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
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-[#e8edf6] p-2 text-[#37518c]">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#141c2d]">{student.user.name}</p>
                          <p className="flex items-center gap-1 text-xs text-[#6b5b45]">
                            <Mail className="h-3 w-3" />
                            {student.user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {student.enrollmentNo || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#141c2d]">{student.course.name}</p>
                        <Badge variant="secondary" className="h-4 text-[10px]">
                          {student.batch.name}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.user.status === "ACTIVE" ? "default" : "secondary"}>
                        {student.user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => handleDelete(student.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
