import { getAllFeedback } from "@/actions/feedback";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Star, MessageSquareText, TrendingUp, TrendingDown, Minus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FeedbackAnalyticsPage() {
  const feedbacks = await getAllFeedback();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Feedback Analytics</h1>
        <p className="text-muted-foreground">AI-processed sentiment and raw user feedback.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Sentiment Quick Stats - Placeholder for real calculation */}
         <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700">Positive Vibes</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black text-emerald-800">82%</div>
                <p className="text-[10px] text-emerald-600/70 mt-1 uppercase font-bold tracking-tighter">AI Detected Satisfaction</p>
            </CardContent>
         </Card>
         <Card className="bg-red-50 dark:bg-red-950/20 border-red-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-red-700">Critical Alerts</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black text-red-800">08%</div>
                <p className="text-[10px] text-red-600/70 mt-1 uppercase font-bold tracking-tighter">Requires Urgent Attention</p>
            </CardContent>
         </Card>
         <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Neutral Logs</CardTitle>
                <Minus className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black text-slate-800">10%</div>
                <p className="text-[10px] text-slate-600/70 mt-1 uppercase font-bold tracking-tighter">Informational Feedback</p>
            </CardContent>
         </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Type</TableHead>
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
                          <p className="text-sm font-semibold">{f.from.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{f.from.role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge className={`${
                            f.sentiment === 'POSITIVE' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                            f.sentiment === 'NEGATIVE' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                            'bg-slate-100 text-slate-700'
                       } text-[9px] border-0`}>
                           {f.sentiment || "NEUTRAL"}
                       </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                        <div className="flex items-center gap-2 mb-1">
                             <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-3 w-3 ${f.rating > i ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                                ))}
                             </div>
                             {f.target && <span className="text-[10px] bg-cyan-50 text-cyan-600 px-1.5 rounded">To: {f.target.user.name}</span>}
                        </div>
                        <p className="text-xs line-clamp-2">{f.content}</p>
                    </TableCell>
                    <TableCell>
                        <Badge variant="secondary" className="text-[9px]">{f.type}</Badge>
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
