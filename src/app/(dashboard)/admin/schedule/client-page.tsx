"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Clock, Loader2, MapPin, Pencil, Plus, Trash2, Video } from "lucide-react";
import { toast } from "sonner";

import { getBatches } from "@/actions/admin";
import { getFaculty } from "@/actions/faculty-admin";
import {
  createClassSession,
  deleteClassSession,
  getClassSessions,
  updateClassSession,
} from "@/actions/schedule-admin";
import { getSubjects } from "@/actions/subject";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Session = Awaited<ReturnType<typeof getClassSessions>>;
type SessionItem = Session[number];
type Batch = Awaited<ReturnType<typeof getBatches>>;
type Subject = Awaited<ReturnType<typeof getSubjects>>;
type FacultyMember = Awaited<ReturnType<typeof getFaculty>>;

export default function ScheduleClientPage({
  initialSessions,
  batches,
  subjects,
  facultyMembers,
}: {
  initialSessions: Session;
  batches: Batch;
  subjects: Subject;
  facultyMembers: FacultyMember;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const sessions = initialSessions;
  const isEditing = selectedSession !== null;
  const onlineSessions = sessions.filter((session) => Boolean(session.meetLink)).length;
  const todaysSessions = sessions.filter(
    (session) => format(new Date(session.date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  ).length;
  const activeFaculty = new Set(sessions.map((session) => session.facultyId)).size;
  const highlights = [
    {
      label: "Scheduled Sessions",
      value: sessions.length,
      detail: "Across all active batches",
      icon: Clock,
      iconClass: "bg-[#f4ede2] text-[#8d6a32]",
    },
    {
      label: "Today",
      value: todaysSessions,
      detail: "Classes on today's calendar",
      icon: Plus,
      iconClass: "bg-[#e8edf6] text-[#37518c]",
    },
    {
      label: "Faculty Engaged",
      value: activeFaculty,
      detail: "Teaching across sessions",
      icon: Pencil,
      iconClass: "bg-[#efe7f7] text-[#7550a9]",
    },
    {
      label: "Online Enabled",
      value: onlineSessions,
      detail: "Include virtual access links",
      icon: Video,
      iconClass: "bg-[#e7f1ed] text-[#2d6a57]",
    },
  ];

  async function handleSubmit(formData: FormData) {
    const data = {
      batchId: formData.get("batchId") as string,
      subjectId: formData.get("subjectId") as string,
      facultyId: formData.get("facultyId") as string,
      date: formData.get("date") as string,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      room: formData.get("room") as string,
      meetLink: formData.get("meetLink") as string,
      topic: formData.get("topic") as string,
    };

    startTransition(async () => {
      const res = selectedSession
        ? await updateClassSession(selectedSession.id, data)
        : await createClassSession(data);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success(selectedSession ? "Class session updated." : "Class session scheduled.");
      router.refresh();
      setIsOpen(false);
      setSelectedSession(null);
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this scheduled class?")) {
      return;
    }

    startTransition(async () => {
      const res = await deleteClassSession(id);
      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Class session removed.");
      router.refresh();
    });
  }

  function openCreateDialog() {
    setSelectedSession(null);
    setIsOpen(true);
  }

  function openEditDialog(session: SessionItem) {
    setSelectedSession(session);
    setIsOpen(true);
  }

  return (
    <div className="space-y-8 pb-12">
      <section className="premium-shell px-6 py-6 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="premium-kicker border-[#e0d5c4] bg-white/55 text-[#9d7b43]">
              <Clock className="h-3.5 w-3.5" />
              Academic Scheduling
            </div>
            <div>
              <h1 className="premium-title text-5xl text-[#141c2d]">Class session planner</h1>
              <p className="pt-2 text-sm leading-relaxed text-[#655742]">
                Build the institutional timetable with premium visibility across faculty, rooms and online delivery.
              </p>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl border-white/70 bg-[#faf6ef] p-0 shadow-[0_28px_80px_rgba(20,28,45,0.18)]">
              <DialogHeader className="border-b border-[#e2d7c8] px-6 py-5">
                <DialogTitle className="premium-title text-4xl text-[#141c2d]">
                  {isEditing ? "Edit class session" : "Schedule new class session"}
                </DialogTitle>
              </DialogHeader>
              <form key={selectedSession?.id ?? "new"} action={handleSubmit} className="space-y-6 px-6 py-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Batch</Label>
                    <div className="premium-select-shell">
                      <select
                        name="batchId"
                        required
                        defaultValue={selectedSession?.batchId ?? ""}
                        className="w-full bg-transparent text-sm text-[#141c2d] outline-none"
                      >
                        <option value="" disabled>
                          Select Batch
                        </option>
                        {batches.map((batch) => (
                          <option key={batch.id} value={batch.id}>
                            {batch.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <div className="premium-select-shell">
                      <select
                        name="subjectId"
                        required
                        defaultValue={selectedSession?.subjectId ?? ""}
                        className="w-full bg-transparent text-sm text-[#141c2d] outline-none"
                      >
                        <option value="" disabled>
                          Select Subject
                        </option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Faculty Member</Label>
                  <div className="premium-select-shell">
                    <select
                      name="facultyId"
                      required
                      defaultValue={selectedSession?.facultyId ?? ""}
                      className="w-full bg-transparent text-sm text-[#141c2d] outline-none"
                    >
                      <option value="" disabled>
                        Assign Faculty
                      </option>
                      {facultyMembers.map((faculty) => (
                        <option key={faculty.id} value={faculty.id}>
                          {faculty.user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      required
                      defaultValue={selectedSession ? format(new Date(selectedSession.date), "yyyy-MM-dd") : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      required
                      defaultValue={selectedSession ? format(new Date(selectedSession.startTime), "HH:mm") : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      required
                      defaultValue={selectedSession ? format(new Date(selectedSession.endTime), "HH:mm") : ""}
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="room">Room / Location</Label>
                    <Input id="room" name="room" placeholder="Lab 101" defaultValue={selectedSession?.room ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meetLink">Online Link (Optional)</Label>
                    <Input
                      id="meetLink"
                      name="meetLink"
                      placeholder="Zoom or Meet link"
                      defaultValue={selectedSession?.meetLink ?? ""}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic / Agenda</Label>
                  <Input id="topic" name="topic" placeholder="Introduction to React" defaultValue={selectedSession?.topic ?? ""} />
                </div>

                <div className="flex flex-col gap-3 border-t border-[#e2d7c8] pt-5 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" size="lg" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="lg" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isEditing ? "Save Schedule Changes" : "Confirm Schedule"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-4">
        {highlights.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#92754a]">{item.label}</p>
                  <h2 className="pt-3 text-3xl font-bold tracking-tight text-[#141c2d]">{item.value}</h2>
                  <p className="pt-2 text-sm text-[#6b5b45]">{item.detail}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconClass}`}>
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="premium-shell px-4 py-4 md:px-5">
        <div className="mb-4 flex flex-col gap-2 px-1 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="premium-title text-4xl text-[#141c2d]">Scheduled Sessions</h2>
            <p className="pt-1 text-sm text-[#6b5b45]">
              Track timing, faculty ownership, room allocation and virtual access from one table.
            </p>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#92754a]">
            {sessions.length} classes in calendar
          </p>
        </div>

        <div className="premium-table-wrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time and Date</TableHead>
                <TableHead>Subject and Faculty</TableHead>
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
                sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Clock className="h-3.5 w-3.5 text-[#8d6a32]" />
                          {format(new Date(session.startTime), "p")} - {format(new Date(session.endTime), "p")}
                        </div>
                        <div className="ml-5 text-xs text-[#6b5b45]">
                          {format(new Date(session.date), "MMM dd, yyyy")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#141c2d]">{session.subject.name}</p>
                        <p className="text-xs text-[#6b5b45]">{session.faculty.user.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{session.batch.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {session.room && (
                          <div className="flex items-center gap-2 text-xs text-[#6b5b45]">
                            <MapPin className="h-3 w-3 text-[#9a8565]" />
                            {session.room}
                          </div>
                        )}
                        {session.meetLink && (
                          <div className="flex items-center gap-2 text-xs text-[#37518c]">
                            <Video className="h-3 w-3" />
                            Online
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={session.status === "SCHEDULED" ? "default" : "secondary"}>
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-600 hover:bg-slate-100"
                        onClick={() => openEditDialog(session)}
                        disabled={isPending}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => handleDelete(session.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
