"use client";

import { useState, useTransition } from "react";
import { createAssignment } from "@/actions/assignments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FilePlus, FileText, Loader2, Users, Calendar, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";

export default function FacultyAssignmentsClientPage({ 
  initialAssignments, 
  batches, 
  subjects 
}: { 
  initialAssignments: any[],
  batches: any[],
  subjects: any[]
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const data = Object.fromEntries(formData);

    startTransition(async () => {
        const res = await createAssignment(data);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Assignment created!");
            setIsOpen(false);
        }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">Create and grade student assessments.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-xl shadow-cyan-500/20">
              <FilePlus className="h-4 w-4 mr-2" /> New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Post New Assignment</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="e.g. Building a REST API" required />
              </div>

               <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Target Batch</Label>
                    <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                        <select name="batchId" required defaultValue="" className="w-full bg-transparent outline-none text-sm">
                            <option value="" disabled>Select Batch</option>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Subject</Label>
                    <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                        <select name="subjectId" required defaultValue="" className="w-full bg-transparent outline-none text-sm">
                            <option value="" disabled>Select Subject</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" name="dueDate" type="date" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="totalPoints">Total Points</Label>
                    <Input id="totalPoints" name="totalPoints" type="number" defaultValue="100" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Task Instructions</Label>
                <Textarea id="description" name="description" placeholder="Describe the assignment expectations..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileUrl">Reference Document Link (Optional)</Label>
                <Input id="fileUrl" name="fileUrl" placeholder="Cloudinary/Drive Link" />
              </div>

              <Button type="submit" disabled={isPending} className="w-full bg-cyan-600 hover:bg-cyan-700">
                 {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                 Post Assignment
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialAssignments.length === 0 ? (
          <div className="col-span-full h-48 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-3xl">
             <FileText className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
             <p className="text-muted-foreground text-sm">No assignments posted yet.</p>
          </div>
        ) : (
          initialAssignments.map((a) => (
            <Card key={a.id} className="hover:shadow-lg transition-all border-slate-200">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <Badge variant="outline" className="mb-2">{a.subject.code}</Badge>
                        <Badge className="bg-amber-100 text-amber-700 border-0">{a._count.submissions} Submissions</Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-1">{a.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                        <Users className="h-3 w-3" /> {a.batch.name}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Due: {format(new Date(a.dueDate), "MMM dd, yyyy")}
                    </div>
                    
                    <Button variant="secondary" className="w-full" asChild>
                        <Link href={`/faculty/assignments/${a.id}`}>
                            View Submissions <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
