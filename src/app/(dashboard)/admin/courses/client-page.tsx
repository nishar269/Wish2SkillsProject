"use client";

import { useState, useTransition } from "react";
import { createCourse, deleteCourse } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function CoursesPage({ initialCourses }: { initialCourses: any[] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await createCourse(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Course created successfully!");
        setIsOpen(false);
        // Page will refresh via revalidatePath
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this course?")) return;
    
    const res = await deleteCourse(id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Course deleted successfully!");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Manage all education programs and courses.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name</Label>
                  <Input id="name" name="name" placeholder="e.g. Java Full Stack" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Course Code</Label>
                  <Input id="code" name="code" placeholder="e.g. JFS" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationMonths">Duration (Months)</Label>
                <Input id="durationMonths" name="durationMonths" type="number" min="1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea id="description" name="description" placeholder="Brief course description..." />
              </div>
              <Button type="submit" disabled={isPending} className="w-full bg-cyan-600 hover:bg-cyan-700">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Course
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
                <TableHead>Course</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Batches</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No courses found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{course.name}</p>
                          <p className="text-xs text-muted-foreground">{course.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{course.durationMonths} Months</TableCell>
                    <TableCell>{course._count.batches}</TableCell>
                    <TableCell>{course._count.students}</TableCell>
                    <TableCell>
                      <Badge variant={course.status === "ACTIVE" ? "default" : "secondary"}>
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(course.id)}>
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
