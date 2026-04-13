"use client";

import { useState, useTransition } from "react";
import { createClassSession, deleteClassSession } from "@/actions/schedule-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Trash2, Video } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ScheduleClientPage({ 
  initialSessions,
  batches,
  subjects,
  facultyMembers
}: { 
  initialSessions: any[],
  batches: any[],
  subjects: any[],
  facultyMembers: any[]
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const data = Object.fromEntries(formData);

    startTransition(async () => {
      const res = await createClassSession(data);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Class session scheduled!");
        setIsOpen(false);
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this scheduled class?")) return;
    
    startTransition(async () => {
        const res = await deleteClassSession(id);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("Class session removed.");
        }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Class Scheduling</h1>
          <p className="text-muted-foreground">Manage the institute&apos;s weekly academic calendar.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Schedule Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Class Session</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Batch</Label>
                  <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                    <select name="batchId" required defaultValue="" className="w-full bg-transparent outline-none text-sm">
                        <option value="" disabled>Select Batch</option>
                        {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                    <select name="subjectId" required defaultValue="" className="w-full bg-transparent outline-none text-sm">
                        <option value="" disabled>Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Faculty Member</Label>
                <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                    <select name="facultyId" required defaultValue="" className="w-full bg-transparent outline-none text-sm">
                        <option value="" disabled>Assign Faculty</option>
                        {facultyMembers.map(f => <option key={f.id} value={f.id}>{f.user.name}</option>)}
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" name="startTime" type="time" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" name="endTime" type="time" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="room">Room / Location</Label>
                  <Input id="room" name="room" placeholder="Lab 101" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetLink">Online Link (Optional)</Label>
                  <Input id="meetLink" name="meetLink" placeholder="Zoom/Meet Link" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic / Agenda</Label>
                <Input id="topic" name="topic" placeholder="e.g. Introduction to React" />
              </div>

              <Button type="submit" disabled={isPending} className="w-full bg-cyan-600 hover:bg-cyan-700">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirm Schedule
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
                <TableHead>Time & Date</TableHead>
                <TableHead>Subject & Faculty</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No classes scheduled.
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Clock className="h-3.5 w-3.5 text-cyan-500" />
                          {format(new Date(s.startTime), "p")} - {format(new Date(s.endTime), "p")}
                        </div>
                        <div className="text-xs text-muted-foreground ml-5">
                          {format(new Date(s.date), "MMM dd, yyyy")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{s.subject.name}</p>
                        <p className="text-xs text-muted-foreground">{s.faculty.user.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.batch.name}</Badge>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-1">
                        {s.room && (
                          <div className="flex items-center gap-2 text-xs">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {s.room}
                          </div>
                        )}
                        {s.meetLink && (
                          <div className="flex items-center gap-2 text-xs text-blue-600">
                            <Video className="h-3 w-3" />
                            Online
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === "SCHEDULED" ? "default" : "secondary"}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(s.id)} disabled={isPending}>
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
    </div>
  );
}
