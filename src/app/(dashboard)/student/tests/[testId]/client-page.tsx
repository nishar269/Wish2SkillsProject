"use client";

import { useState, useTransition } from "react";
import { submitTestResult } from "@/actions/tests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Timer, ArrowRight, ArrowLeft, Send, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TakeTestClientPage({ test }: { test: any }) {
  const router = useRouter();
  const questions = test.questions as any [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [isPending, startTransition] = useTransition();

  const handleSelect = (optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (answers.includes(-1)) {
        if (!confirm("You haven't answered all questions. Submit anyway?")) return;
    }

    startTransition(async () => {
        const res = await submitTestResult(test.id, answers);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success(`Assessment Submitted! You scored ${res.score}/${test.totalMarks}`);
            router.push("/student/tests");
        }
    });
  };

  const progress = ((currentIdx + 1) / questions.length) * 100;
  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
           <Badge variant="outline" className="mb-2">{test.subject.name}</Badge>
           <h1 className="text-3xl font-bold tracking-tight">{test.title}</h1>
        </div>
        <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100">
            <Timer className="h-5 w-5 text-blue-600" />
            <span className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono">30:00</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                <span>Progress</span>
                <span>Question {currentIdx + 1} of {questions.length}</span>
            </div>
            <Progress value={progress} className="h-3 rounded-full bg-slate-100" />
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
            <CardHeader className="p-8">
                <CardTitle className="text-2xl leading-relaxed text-slate-800 dark:text-slate-100">
                    {currentQ.question}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-4">
                <div className="grid gap-3">
                    {currentQ.options.map((opt: string, idx: number) => (
                        <button
                            key={idx}
                            onClick={() => handleSelect(idx)}
                            className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all border-2 ${
                                answers[currentIdx] === idx 
                                ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/30 scale-[1.02]" 
                                : "bg-slate-50 dark:bg-slate-900 border-transparent hover:border-blue-100 dark:hover:border-blue-900 text-slate-700 dark:text-slate-300"
                            }`}
                        >
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                                answers[currentIdx] === idx ? "bg-white/20" : "bg-white dark:bg-slate-800 shadow-sm"
                            }`}>
                                {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="font-medium">{opt}</span>
                            {answers[currentIdx] === idx && <CheckCircle2 className="ml-auto h-5 w-5 text-white" />}
                        </button>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="p-8 border-t bg-slate-50/50 dark:bg-slate-900/50 flex justify-between">
                <Button 
                    variant="ghost" 
                    onClick={() => setCurrentIdx(p => Math.max(0, p-1))}
                    disabled={currentIdx === 0}
                    className="px-6"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                
                {currentIdx < questions.length - 1 ? (
                    <Button 
                        onClick={() => setCurrentIdx(p => p+1)}
                        className="bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-8"
                    >
                        Next Question <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button 
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 px-8"
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                        Final Submission
                    </Button>
                )}
            </CardFooter>
        </Card>

        <div className="flex flex-wrap gap-2 justify-center">
            {questions.map((_: any, i: number) => (
                <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold transition-all border-2 ${
                        currentIdx === i ? "border-blue-600 bg-blue-50 text-blue-600 scale-110 shadow-md" :
                        answers[i] !== -1 ? "bg-emerald-100 border-emerald-100 text-emerald-700" :
                        "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400"
                    }`}
                >
                    {i+1}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
}
