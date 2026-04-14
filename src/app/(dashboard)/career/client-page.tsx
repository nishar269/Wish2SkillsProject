"use client";

import { useTransition } from "react";
import { applyForJob } from "@/actions/jobs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Building2, MapPin, DollarSign, Send, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CareerPortalClientPage({ initialJobs, myApplications }: { initialJobs: any[], myApplications: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleApply = (jobId: string) => {
    startTransition(async () => {
        const res = await applyForJob(jobId);
        if (res?.error) toast.error(res.error);
        else toast.success("Application submitted! Good luck.");
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Career Hub</h1>
        <p className="text-muted-foreground">Premium placement opportunities curated for Wish2Skill students.</p>
      </div>

      <Tabs defaultValue="explore" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 h-14">
            <TabsTrigger value="explore" className="rounded-xl px-8 h-12 text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Explore Openings</TabsTrigger>
            <TabsTrigger value="applications" className="rounded-xl px-8 h-12 text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">My Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialJobs.length === 0 ? (
                <p className="text-muted-foreground italic col-span-full py-10 text-center">No active job listings at the moment.</p>
            ) : (
                initialJobs.map((job) => {
                    const hasApplied = myApplications.some(app => app.jobId === job.id);
                    return (
                        <Card key={job.id} className="group border-0 shadow-xl shadow-slate-200/50 dark:shadow-none hover:scale-[1.01] transition-all">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-3 bg-cyan-50 dark:bg-cyan-950/50 rounded-2xl text-cyan-600">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-0">{job.type}</Badge>
                                </div>
                                <CardTitle className="text-xl group-hover:text-cyan-600 transition-colors">{job.title}</CardTitle>
                                <CardDescription className="font-bold text-slate-700 dark:text-slate-300">{job.company}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {job.location}
                                    </div>
                                    {job.salaryRange && (
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" /> {job.salaryRange}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm line-clamp-2 text-slate-600 dark:text-slate-400">
                                    {job.description}
                                </p>
                            </CardContent>
                            <CardFooter>
                                {hasApplied ? (
                                    <Button disabled className="w-full bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30">
                                        <CheckCircle2 className="h-4 w-4 mr-2" /> Application Sent
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={() => handleApply(job.id)}
                                        disabled={isPending}
                                        className="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 border-0 shadow-lg shadow-slate-900/10"
                                    >
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                        Apply Now
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })
            )}
        </TabsContent>

        <TabsContent value="applications">
            <Card className="border-0 shadow-lg">
                <CardContent className="p-0">
                    <div className="divide-y">
                        {myApplications.length === 0 ? (
                            <div className="p-10 text-center text-muted-foreground">You haven&apos;t applied to any jobs yet.</div>
                        ) : (
                            myApplications.map((app) => (
                                <div key={app.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <Briefcase className="h-6 w-6 text-slate-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold">{app.job.title}</h4>
                                            <p className="text-xs text-muted-foreground">{app.job.company} • {format(new Date(app.createdAt), "PPP")}</p>
                                        </div>
                                    </div>
                                    <Badge className={`${
                                        app.status === 'SELECTED' ? 'bg-emerald-100 text-emerald-700' :
                                        app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                        'bg-blue-100 text-blue-700'
                                    } border-0`}>
                                        {app.status}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
