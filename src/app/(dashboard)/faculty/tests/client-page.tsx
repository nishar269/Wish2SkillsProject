"use client";

import { useState, useTransition } from "react";
import { createTest } from "@/actions/tests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileQuestion, Plus, Trash2, Loader2, Calendar, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";

export default function FacultyTestsClientPage({ 
  initialTests, 
  batches, 
  subjects 
}: { 
  initialTests: any[],
  batches: any[],
  subjects: any[]
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // For dynamic questions
  const [questions, setQuestions] = useState([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);

  const addQuestion = () => setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  
  const handleQuestionChange = (idx: number, field: string, value: any) => {
    const newQs = [...questions];
    if (field === 'question') newQs[idx].question = value;
    if (field === 'correctAnswer') newQs[idx].correctAnswer = value;
    setQuestions(newQs);
  };

  const handleOptionChange = (qIdx: number, oIdx: number, value: string) => {
    const newQs = [...questions];
    newQs[qIdx].options[oIdx] = value;
    setQuestions(newQs);
  };

  async function handleSubmit(formData: FormData) {
    const data = {
        title: formData.get("title") as string,
        batchId: formData.get("batchId") as string,
        subjectId: formData.get("subjectId") as string,
        date: formData.get("date") as string,
        totalMarks: parseInt(formData.get("totalMarks") as string),
        questions: questions
    };

    startTransition(async () => {
        const res = await createTest(data);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Quiz/Test published successfully!");
            setIsOpen(false);
            setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
        }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assessments (Quizzes)</h1>
          <p className="text-muted-foreground">Conduct automated MCQ tests and track performance.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Create MCQ Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New MCQ Assessment</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-6 mt-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Test Title</Label>
                    <Input id="title" name="title" placeholder="e.g. Unit 1: JavaScript Fundamentals" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date">Scheduled Date</Label>
                    <Input id="date" name="date" type="date" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <Label>Assign Batch</Label>
                    <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                      <select name="batchId" required className="w-full bg-transparent outline-none text-sm">
                          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Subject</Label>
                    <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                      <select name="subjectId" required className="w-full bg-transparent outline-none text-sm">
                          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="totalMarks">Total Marks</Label>
                    <Input id="totalMarks" name="totalMarks" type="number" defaultValue="20" required />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                 <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-700">Questions ({questions.length})</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                        <Plus className="h-3 w-3 mr-1" /> Add Question
                    </Button>
                 </div>
                 
                 {questions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-3 relative">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded">Q{qIdx+1}</span>
                            <Input 
                                placeholder="Enter Question Statement" 
                                value={q.question}
                                onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                                className="bg-white dark:bg-slate-950"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3 pl-8">
                            {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-2">
                                     <input 
                                        type="radio" 
                                        name={`correct-${qIdx}`} 
                                        checked={q.correctAnswer === oIdx}
                                        onChange={() => handleQuestionChange(qIdx, 'correctAnswer', oIdx)}
                                        className="accent-cyan-600"
                                     />
                                     <Input 
                                        placeholder={`Option ${oIdx + 1}`}
                                        value={opt}
                                        onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                                        className="h-8 text-xs bg-white dark:bg-slate-950"
                                        required
                                     />
                                </div>
                            ))}
                        </div>
                    </div>
                 ))}
              </div>

              <Button type="submit" disabled={isPending} className="w-full bg-cyan-600 hover:bg-cyan-700 h-12 shadow-lg shadow-cyan-500/20">
                 {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ClipboardCheck className="h-4 w-4 mr-2" />}
                 Publish Assessment
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
                <TableHead>Test Details</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialTests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No assessments scheduled yet.
                  </TableCell>
                </TableRow>
              ) : (
                initialTests.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-50 dark:bg-cyan-950/50 rounded-lg text-cyan-600 font-bold">
                          <FileQuestion className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{t.title}</p>
                          <p className="text-xs text-muted-foreground">{t.subject.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                        {format(new Date(t.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline">{t.batch.name}</Badge>
                    </TableCell>
                    <TableCell>
                        <span className="text-xs font-medium">{(t.questions as any[]).length} MCQs</span>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/faculty/tests/${t.id}/results`}>View Results</Link>
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
