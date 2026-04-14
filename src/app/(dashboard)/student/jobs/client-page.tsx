"use client";

import { useState, useTransition } from "react";
import { applyToJob } from "@/actions/student-jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { MapPin, DollarSign, Send, CheckCircle2, Clock, Globe, ArrowUpRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function StudentJobsClientPage({ jobs, studentApplications }: { jobs: any[], studentApplications: any[] }) {
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const handleApply = (formData: FormData) => {
    const resumeUrl = formData.get("resumeUrl") as string;
    if (!selectedJob) return;

    startTransition(async () => {
        const res = await applyToJob(selectedJob.id, resumeUrl);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Application sent successfully!");
            setSelectedJob(null);
        }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">Career Opportunities</h1>
        <p className="text-muted-foreground mt-1 font-medium">Launch your professional journey with top-tier hiring partners.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {jobs.length === 0 ? (
          <p className="text-muted-foreground italic col-span-full">New opportunities are processing. Check back soon!</p>
        ) : (
          jobs.map((job) => {
            const application = studentApplications.find(a => a.jobId === job.id);
            const isApplied = !!application;

            return (
              <Card key={job.id} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2rem] bg-white dark:bg-slate-950">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors" />
                
                <CardHeader className="p-8 pb-4">
                   <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">
                            🏢
                        </div>
                        {isApplied ? (
                             <Badge className="bg-emerald-100 text-emerald-700 border-0 flex items-center gap-1.5 px-3 py-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Applied
                             </Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0 px-3 py-1">New</Badge>
                        )}
                   </div>
                   <CardTitle className="text-2xl font-black tracking-tighter group-hover:text-cyan-600 transition-colors">
                        {job.title}
                   </CardTitle>
                   <CardDescription className="text-lg font-bold text-slate-400">{job.company}</CardDescription>
                </CardHeader>

                <CardContent className="p-8 pt-0 space-y-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                            <MapPin className="h-4 w-4 text-cyan-500" /> {job.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                            <Clock className="h-4 w-4 text-cyan-500" /> {job.type}
                        </div>
                        {job.salaryRange && (
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                                <DollarSign className="h-4 w-4 text-cyan-500" /> {job.salaryRange}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Requirements</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{job.requirements}</p>
                        </div>
                    </div>

                    {isApplied ? (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                    <Clock className="h-4 w-4 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Status</p>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{application.status}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-cyan-600 font-bold">Withdraw</Button>
                        </div>
                    ) : (
                        <Dialog open={selectedJob?.id === job.id} onOpenChange={(open) => setSelectedJob(open ? job : null)}>
                            <DialogTrigger asChild>
                                <Button className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    Quick Apply <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-[2rem] border-0 shadow-2xl p-8 max-w-lg">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black italic tracking-tighter">Submit Application</DialogTitle>
                                    <DialogDescription className="font-medium text-slate-500">
                                        Applying for **{job.title}** at **{job.company}**.
                                    </DialogDescription>
                                </DialogHeader>
                                <form action={handleApply} className="space-y-6 mt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="resumeUrl" className="text-sm font-black uppercase tracking-widest px-1">Resume Link (Google Drive/Dropbox)</Label>
                                        <div className="relative">
                                            <Input 
                                                id="resumeUrl" 
                                                name="resumeUrl" 
                                                placeholder="https://..." 
                                                className="h-14 rounded-2xl border-2 border-slate-100 focus:border-cyan-500/50 pr-12 transition-all"
                                                required 
                                            />
                                            <Globe className="absolute right-4 top-4 h-6 w-6 text-slate-300" />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic px-1">Make sure the link is set to "Anyone with link" access.</p>
                                    </div>

                                    <Button type="submit" disabled={isPending} className="w-full h-14 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl font-black text-lg shadow-2xl shadow-cyan-600/20 transition-all">
                                        {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                                        Submit to {job.company}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
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
