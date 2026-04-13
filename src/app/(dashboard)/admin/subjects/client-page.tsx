"use client";

import { useState, useTransition } from "react";
import { createSubject, deleteSubject } from "@/actions/subject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, FileText, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function SubjectsPage({ initialSubjects, courses }: { initialSubjects: any[], courses: any[] }) {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const data = {
      name: formData.get("name"),
      code: formData.get("code"),
      courseId: formData.get("courseId"),
      credits: formData.get("credits"),
    };

    startTransition(async () => {
      const res = await createSubject(data);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Subject created successfully!");
        setIsOpen(false);
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    
    const res = await deleteSubject(id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Subject deleted successfully!");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground">Manage subjects and modules across courses.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Subject</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Subject Name</Label>
                  <Input id="name" name="name" placeholder="e.g. Adv. Data Structures" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Subject Code</Label>
                  <Input id="code" name="code" placeholder="e.g. CS401" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseId">Associated Course</Label>
                <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                   <select 
                    id="courseId" 
                    name="courseId" 
                    required 
                    defaultValue=""
                    className="w-full bg-transparent outline-none text-sm"
                  >
                    <option value="" disabled>Select a course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">Credit Points</Label>
                <Input id="credits" name="credits" type="number" defaultValue="3" min="1" max="10" required />
              </div>

              <Button type="submit" disabled={isPending} className="w-full bg-cyan-600 hover:bg-cyan-700">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Subject
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
                <TableHead>Subject</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No subjects found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 dark:bg-orange-950/50 rounded-lg text-orange-600">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{subject.name}</p>
                          <p className="text-xs text-muted-foreground">{subject.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-cyan-500" />
                        {subject.course.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{subject.credits} Credits</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {subject._count.materials} Notes • {subject._count.classSessions} Classes
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(subject.id)}>
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
