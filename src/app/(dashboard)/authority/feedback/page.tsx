"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { getAuthorityFeedbackData } from "@/actions/feedback";

export const dynamic = "force-dynamic";

export default async function AuthorityFeedbackPage() {
    const data = await getAuthorityFeedbackData();
    if ("error" in data) return <div className="p-8 text-rose-500">{data.error}</div>;

    const { sentimentDistribution, averageRating, recentFeedbacks } = data;

    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">Feedback Pulse</h1>
                <p className="text-slate-500 font-medium italic">Aggregate sentiment analysis and qualitative institutional feedback.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Stats */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-2xl rounded-[3rem] bg-indigo-600 text-white p-10 relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <Star className="h-10 w-10 text-indigo-200 fill-indigo-200" />
                            <h2 className="text-xl font-black italic tracking-tighter uppercase">Satisfaction Rate</h2>
                            <p className="text-6xl font-black italic tracking-tighter">{averageRating}</p>
                            <p className="text-xs font-black uppercase tracking-widest opacity-70">Out of 5.0 (Global Avg)</p>
                            <div className="pt-4">
                                <span className="px-2 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest">Top 1% Institue</span>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    </Card>

                    <Card className="border-0 shadow-lg rounded-[2.5rem] bg-white dark:bg-slate-950 p-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Sentiment Spectrum</h3>
                        <div className="space-y-6">
                            {[
                                { label: "Positive", val: sentimentDistribution.positive, color: "bg-emerald-500" },
                                { label: "Neutral", val: sentimentDistribution.neutral, color: "bg-blue-500" },
                                { label: "Needs Attention", val: sentimentDistribution.negative, color: "bg-rose-500" },
                            ].map((s, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span>{s.label}</span>
                                        <span>{s.val}%</span>
                                    </div>
                                    <Progress value={s.val} className={cn("h-1.5", s.color)} />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-indigo-600" /> Voice of the Campus
                        </h3>
                        <div className="flex gap-2">
                             <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest border border-slate-100 rounded-lg">Filter</Button>
                             <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest border border-slate-100 rounded-lg">Export</Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {recentFeedbacks.length === 0 ? (
                            <p className="text-slate-400 italic">No feedback submitted yet.</p>
                        ) : recentFeedbacks.map((f) => (
                            <Card key={f.id} className="border-0 shadow-lg rounded-[2.5rem] bg-white dark:bg-slate-950 overflow-hidden">
                                <CardContent className="p-8 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-slate-50 border-slate-200">
                                                {f.subject}
                                            </Badge>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, star) => (
                                                    <Star key={star} className={cn("h-3 w-3", star < f.rating ? "text-amber-400 fill-amber-400" : "text-slate-200")} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "w-3 h-3 rounded-full shadow-[0_0_8px]",
                                            f.sentiment === 'POSITIVE' ? "bg-emerald-500 shadow-emerald-500/50" :
                                            f.sentiment === 'NEGATIVE' ? "bg-rose-500 shadow-rose-500/50" : "bg-blue-500 shadow-blue-500/50"
                                        )} title={f.sentiment || "NEUTRAL"} />
                                    </div>
                                    <p className="text-lg font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                        &ldquo;{f.message}&rdquo;
                                    </p>
                                    <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {f.studentName}
                                        </span>
                                        <div className="flex gap-3">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:text-emerald-500"><ThumbsUp className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:text-rose-500"><ThumbsDown className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="pt-4 flex justify-center">
                         <Button variant="outline" className="h-14 px-10 rounded-[1.5rem] font-black uppercase tracking-widest text-xs border-2">
                            Request Feedback Campaign
                         </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
