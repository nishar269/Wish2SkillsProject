import { getAllFeedback } from "@/actions/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Star, MessageSquareText, TrendingUp, TrendingDown, Minus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FeedbackAnalyticsPage() {
  const feedbacks = await getAllFeedback();
  const positiveCount = feedbacks.filter((feedback) => (feedback.rating ?? 0) >= 4).length;
  const criticalCount = feedbacks.filter((feedback) => (feedback.rating ?? 0) <= 2).length;
  const neutralCount = feedbacks.filter((feedback) => feedback.rating === 3).length;
  const totalFeedbacks = feedbacks.length || 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Feedback Analytics</h1>
        <p className="text-muted-foreground">Student feedback records grouped by rating and target.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Sentiment Quick Stats - Placeholder for real calculation */}
         <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700">Positive Vibes</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black text-emerald-800">{Math.round((positiveCount / totalFeedbacks) * 100)}%</div>
                <p className="text-[10px] text-emerald-600/70 mt-1 uppercase font-bold tracking-tighter">Ratings Of 4 Or 5</p>
            </CardContent>
         </Card>
         <Card className="bg-red-50 dark:bg-red-950/20 border-red-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-red-700">Critical Alerts</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black text-red-800">{Math.round((criticalCount / totalFeedbacks) * 100)}%</div>
                <p className="text-[10px] text-red-600/70 mt-1 uppercase font-bold tracking-tighter">Ratings Of 1 Or 2</p>
            </CardContent>
         </Card>
         <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Neutral Logs</CardTitle>
                <Minus className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black text-slate-800">{Math.round((neutralCount / totalFeedbacks) * 100)}%</div>
                <p className="text-[10px] text-slate-600/70 mt-1 uppercase font-bold tracking-tighter">Ratings Of 3</p>
            </CardContent>
         </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Applied On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No feedback received yet.
                  </TableCell>
                </TableRow>
              ) : (
                feedbacks.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                             <MessageSquareText className="h-3.5 w-3.5 text-slate-500" />
                          </div>
                          <div>
                          <p className="text-sm font-semibold">
                            {f.isAnonymous ? "Anonymous Student" : f.student.user.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase">{f.student.user.role}</p>
                         </div>
                       </div>
                     </TableCell>
                     <TableCell>
                       {f.faculty ? (
                         <Badge className="bg-cyan-50 text-cyan-700 hover:bg-cyan-50 text-[9px] border-0">
                           Faculty: {f.faculty.user.name}
                         </Badge>
                       ) : f.subject ? (
                         <Badge className="bg-violet-50 text-violet-700 hover:bg-violet-50 text-[9px] border-0">
                           Subject: {f.subject.code}
                         </Badge>
                       ) : (
                         <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 text-[9px] border-0">
                           General
                         </Badge>
                       )}
                     </TableCell>
                     <TableCell className="max-w-md">
                        <div className="flex items-center gap-2 mb-1">
                             <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-3 w-3 ${(f.rating ?? 0) > i ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                                ))}
                             </div>
                             {f.isAnonymous && <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded">Anonymous</span>}
                        </div>
                        <p className="text-xs line-clamp-2">{f.message}</p>
                     </TableCell>
                     <TableCell>
                        <Badge variant="secondary" className="text-[9px]">{f.rating ?? "NA"} / 5</Badge>
                     </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                       {format(new Date(f.createdAt), "MMM dd, yyyy")}
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
