"use client";

import { useState, useTransition } from "react";
import { gradeSubmission } from "@/actions/assignments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ExternalLink, Loader2, Award } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

export default function AssignmentGradingClientPage({ assignment, submissions }: { assignment: any, submissions: any[] }) {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  async function handleGradeSubmit(formData: FormData) {
    if (!selectedSubmission) return;

    const data = {
        grade: parseFloat(formData.get("grade") as string),
        feedback: formData.get("feedback") as string
    };

    startTransition(async () => {
        const res = await gradeSubmission(selectedSubmission.id, data);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Submission graded successfully!");
            setSelectedSubmission(null);
        }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/faculty/assignments"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Grade Submissions</h1>
            <p className="text-muted-foreground">{assignment.title} • {assignment.batch.name}</p>
          </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No submissions received yet.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.student.user.name}</TableCell>
                    <TableCell className="text-sm">
                        {format(new Date(s.submittedAt), "MMM dd, p")}
                    </TableCell>
                    <TableCell>
                        <Badge variant={s.status === "GRADED" ? "default" : "secondary"}>
                            {s.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="font-bold">
                        {s.grade ? `${s.grade}/${assignment.totalPoints}` : "-"}
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                         <Button variant="ghost" size="icon" asChild className="text-cyan-600">
                            <a href={s.fileUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                         </Button>
                         <Button variant="outline" size="sm" onClick={() => setSelectedSubmission(s)}>
                             {s.status === "GRADED" ? "Edit Grade" : "Grade"}
                         </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Grading: {selectedSubmission?.student.user.name}</DialogTitle>
              </DialogHeader>
              <form action={handleGradeSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                       <Label htmlFor="grade">Score (Out of {assignment.totalPoints})</Label>
                       <Input 
                        id="grade" 
                        name="grade" 
                        type="number" 
                        step="0.5" 
                        max={assignment.totalPoints} 
                        defaultValue={selectedSubmission?.grade || ""} 
                        required 
                       />
                  </div>
                  <div className="space-y-2">
                       <Label htmlFor="feedback">Feedback (Optional)</Label>
                       <Textarea 
                        id="feedback" 
                        name="feedback" 
                        placeholder="Great work on the implementation..." 
                        defaultValue={selectedSubmission?.feedback || ""}
                       />
                  </div>
                  <Button type="submit" disabled={isPending} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Award className="h-4 w-4 mr-2" />}
                      Save Grade
                  </Button>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  );
}
