"use client";

import { useState, useTransition } from "react";
import { createAssignment, deleteAssignment } from "@/actions/faculty-assignment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link2, Plus, Trash2, Loader2, User, BookOpen, Users } from "lucide-react";
import { toast } from "sonner";

export default function AdminAssignmentsClientPage({ 
  initialAssignments, 
  facultyMembers,
  subjects,
  batches
}: { 
  initialAssignments: any[],
  facultyMembers: any[],
  subjects: any[],
  batches: any[]
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const data = {
        facultyId: formData.get("facultyId") as string,
        subjectId: formData.get("subjectId") as string,
        batchId: formData.get("batchId") as string,
    };

    startTransition(async () => {
        const res = await createAssignment(data);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Faculty assignment created!");
            setIsOpen(false);
        }
    });
  }

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure?")) return;
    startTransition(async () => {
        const res = await deleteAssignment(id);
        if (res?.error) toast.error(res.error);
        else toast.success("Assignment removed.");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Faculty Load Mapping</h1>
          <p className="text-muted-foreground">Assign instructors to specific subjects and batches.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-xl shadow-cyan-500/20">
              <Link2 className="h-4 w-4 mr-2" /> Create Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Faculty</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Select Faculty</Label>
                <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                    <select name="facultyId" required defaultValue="" className="w-full bg-transparent outline-none text-sm">
                        <option value="" disabled>Choose Instructor</option>
                        {facultyMembers.map(f => <option key={f.id} value={f.id}>{f.user.name}</option>)}
                    </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Specific Subject</Label>
                <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                    <select name="subjectId" required defaultValue="" className="w-full bg-transparent outline-none text-sm">
                        <option value="" disabled>Choose Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                    </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Batch</Label>
                <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                    <select name="batchId" required defaultValue="" className="w-full bg-transparent outline-none text-sm">
                        <option value="" disabled>Choose Batch</option>
                        {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="w-full bg-cyan-600 hover:bg-cyan-700">
                 {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Link Faculty"}
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
                <TableHead>Faculty Member</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No faculty-subject assignments found.
                  </TableCell>
                </TableRow>
              ) : (
                initialAssignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{a.faculty.user.name}</p>
                          <p className="text-[10px] text-muted-foreground">{a.faculty.specialization || "Expert"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <BookOpen className="h-4 w-4 text-cyan-500" />
                         <span className="text-sm font-medium">{a.subject.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                         <Users className="h-4 w-4 text-slate-400" />
                         <Badge variant="outline">{a.batch.name}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(a.id)}>
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
