"use client";

import { useState, useTransition } from "react";
import {
  createJobPost,
  deleteJobPost,
  getJobApplications,
  getJobPosts,
  updateApplicationStatus,
} from "@/actions/career";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Users, MapPin, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type JobPost = Awaited<ReturnType<typeof getJobPosts>>[number];
type JobApplication = Awaited<ReturnType<typeof getJobApplications>>[number];

export default function CareerClientPage({ initialJobs }: { initialJobs: JobPost[] }) {
  const [jobs] = useState(initialJobs);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  async function handleAddJob(formData: FormData) {
    const data = {
      title: formData.get("title") as string,
      company: formData.get("company") as string,
      location: formData.get("location") as string,
      type: formData.get("type") as string,
      salaryRange: formData.get("salaryRange") as string,
      description: formData.get("description") as string,
      requirements: formData.get("requirements") as string,
    };

    startTransition(async () => {
      const res = await createJobPost(data);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Job post published!");
        setIsAddOpen(false);
      }
    });
  }

  async function handleViewApplications(job: JobPost) {
      setSelectedJob(job);
      const apps = await getJobApplications(job.id);
      setApplications(apps);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Career & Placements</h1>
          <p className="text-muted-foreground">Manage job openings and track student applications.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4 mr-2" /> Add Job Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Post New Opportunity</DialogTitle>
            </DialogHeader>
            <form action={handleAddJob} className="grid grid-cols-2 gap-4 mt-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input id="title" name="title" placeholder="e.g. Software Engineer Intern" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" placeholder="e.g. Google" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="e.g. Remote / Bangalore" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Employment Type</Label>
                <select name="type" className="w-full border rounded-md p-2 text-sm bg-slate-50">
                    <option value="FULL_TIME">Full Time</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="CONTRACT">Contract</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryRange">Salary Range (Optional)</Label>
                <Input id="salaryRange" name="salaryRange" placeholder="e.g. 5-8 LPA" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea id="description" name="description" rows={3} required />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="requirements">Key Requirements</Label>
                <Textarea id="requirements" name="requirements" rows={3} required />
              </div>
              <Button type="submit" disabled={isPending} className="col-span-2 bg-cyan-600 hover:bg-cyan-700">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Publish Opening
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Active Openings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Role & Company</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Applications</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground italic">
                                    No job posts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-bold">{job.title}</p>
                                            <p className="text-xs text-muted-foreground">{job.company}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                            {job.location}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="text-[10px]">{job.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                                            <Users className="h-3 w-3 text-cyan-600" />
                                            {job._count.applications} applied
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handleViewApplications(job)}>
                                            View Apps
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => deleteJobPost(job.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        {selectedJob && (
            <Card className="border-cyan-200 bg-cyan-50/10 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Applications for {selectedJob.title}</CardTitle>
                        <CardDescription>{selectedJob.company} • {applications.length} Students</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)}>Close</Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Applied On</TableHead>
                                <TableHead>Resume</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Manage</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground italic">
                                        No applications yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                applications.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell>
                                            <div className="font-medium text-sm">{app.student.user.name}</div>
                                            <div className="text-[10px] text-muted-foreground">{app.student.user.email}</div>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {format(new Date(app.createdAt), "MMM dd, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            {app.resumeUrl ? (
                                                <a href={app.resumeUrl} target="_blank" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                                    Open <ExternalLink className="h-3 w-3" />
                                                </a>
                                            ) : "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                app.status === 'SELECTED' ? 'default' :
                                                app.status === 'REJECTED' ? 'destructive' : 'outline'
                                            } className="text-[10px]">
                                                {app.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <select 
                                                className="text-[10px] border rounded p-1 bg-white"
                                                defaultValue={app.status}
                                                onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="REVIEWING">Reviewing</option>
                                                <option value="SELECTED">Selected</option>
                                                <option value="REJECTED">Rejected</option>
                                            </select>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
