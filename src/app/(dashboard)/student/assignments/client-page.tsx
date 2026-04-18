"use client";

import { useState, useTransition } from "react";
import { getStudentAssignments, submitAssignment } from "@/actions/student-assignments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Calendar, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format, isAfter } from "date-fns";

type StudentAssignment = Awaited<ReturnType<typeof getStudentAssignments>>[number];

export default function StudentAssignmentsClientPage({
  initialAssignments,
}: {
  initialAssignments: StudentAssignment[];
}) {
  const [selectedAssignment, setSelectedAssignment] = useState<StudentAssignment | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedSubmission = selectedAssignment?.submissions[0];

  async function handleSubmission(formData: FormData) {
    if (!selectedAssignment) return;
    const fileUrl = formData.get("fileUrl") as string;

    startTransition(async () => {
        const res = await submitAssignment(selectedAssignment.id, fileUrl);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Assignment submitted successfully!");
            setSelectedAssignment(null);
        }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Assignments</h1>
        <p className="text-muted-foreground">Stay on top of your coursework and submissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {initialAssignments.length === 0 ? (
          <p className="text-muted-foreground italic col-span-full">No assignments found for your batch.</p>
        ) : (
          initialAssignments.map((a) => {
            const submission = a.submissions[0];
            const isOverdue = isAfter(new Date(), new Date(a.dueDate)) && !submission;

            return (
              <Card key={a.id} className={`border-l-4 transition-all hover:scale-[1.01] ${
                submission?.status === "GRADED" ? "border-l-emerald-500" : 
                submission ? "border-l-blue-500" : 
                isOverdue ? "border-l-red-500" : "border-l-amber-500"
              }`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <Badge variant="secondary">{a.subject.name}</Badge>
                      <CardTitle className="text-xl">{a.title}</CardTitle>
                    </div>
                    {submission ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-0 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> 
                        {submission.status === "GRADED" ? "Graded" : "Submitted"}
                      </Badge>
                    ) : isOverdue ? (
                      <Badge variant="destructive">Overdue</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {a.description || "Refer to the attached document for details."}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 py-3 border-y border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs">
                       <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                       <span className="font-medium">Due: {format(new Date(a.dueDate), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                       <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                       <span className="font-medium">Points: {a.totalPoints}</span>
                    </div>
                  </div>

                  {submission?.status === "GRADED" && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Your Score</span>
                            <span className="text-lg font-black text-emerald-700">{submission.grade}/{a.totalPoints}</span>
                        </div>
                        {submission.feedback && (
                            <p className="text-xs italic text-emerald-600 border-t border-emerald-100 dark:border-emerald-800 pt-2">
                                &ldquo;{submission.feedback}&rdquo;
                            </p>
                        )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    {a.fileUrl && (
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                            <a href={a.fileUrl} target="_blank" rel="noopener noreferrer">View Brief</a>
                        </Button>
                    )}
                    
                    {!submission || submission.status !== "GRADED" ? (
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => setSelectedAssignment(a)}>
                        {submission ? "Update Work" : "Submit Work"}
                      </Button>
                    ) : (
                        <Button variant="secondary" size="sm" className="flex-1" disabled>
                            Submitted
                        </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={Boolean(selectedAssignment)} onOpenChange={(open) => !open && setSelectedAssignment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit: {selectedAssignment?.title}</DialogTitle>
          </DialogHeader>
          {selectedAssignment ? (
            <form key={selectedAssignment.id} action={handleSubmission} className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg flex gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                Please provide a link to your hosted project or document (Google Drive, GitHub, etc.)
              </p>
              <div className="space-y-2">
                <Label htmlFor="fileUrl">Submission Link</Label>
                <Input
                  id="fileUrl"
                  name="fileUrl"
                  placeholder="https://..."
                  defaultValue={selectedSubmission?.contentUrl || ""}
                  required
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Confirm Submission
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
