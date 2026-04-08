import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { FileQuestion, CheckCircle2, PlayCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentTestsPage() {
  const session = await auth();
  if (!session) return null;

  const student = await db.student.findUnique({
    where: { userId: session.user.id }
  });

  if (!student) return null;

  const tests = await db.test.findMany({
    where: { batchId: student.batchId },
    include: {
        subject: true,
        results: {
            where: { studentId: student.id }
        }
    },
    orderBy: { date: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assessments & Quizzes</h1>
        <p className="text-muted-foreground">Test your knowledge and track your scores.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.length === 0 ? (
          <p className="text-muted-foreground italic col-span-full">No tests scheduled for your batch.</p>
        ) : (
          tests.map((t) => {
            const hasAttempted = t.results.length > 0;
            const score = hasAttempted ? t.results[0].marksObtained : null;

            return (
              <Card key={t.id} className="group hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{t.subject.name}</Badge>
                    {hasAttempted ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0">Completed</Badge>
                    ) : (
                        <Badge className="bg-blue-100 text-blue-700 border-0">Live</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl group-hover:text-cyan-600 transition-colors">{t.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground pb-4 border-b">
                    <span>{format(new Date(t.date), "MMM dd, yyyy")}</span>
                    <span>{(t.questions as any[]).length} Questions</span>
                  </div>

                  {hasAttempted ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2">
                       <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Score</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{score}/{t.totalMarks}</span>
                       </div>
                       <p className="text-[10px] text-center text-muted-foreground">Well done! Check your dashboard for rank updates soon.</p>
                    </div>
                  ) : (
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                        <Link href={`/student/tests/${t.id}`}>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Start Assessment
                        </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
