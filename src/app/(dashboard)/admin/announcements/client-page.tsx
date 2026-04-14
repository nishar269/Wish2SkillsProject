"use client";

import { useState, useTransition } from "react";
import { createAnnouncement, deleteAnnouncement } from "@/actions/announcements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Megaphone, Trash2, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminAnnouncementsClientPage({ initialAnnouncements }: { initialAnnouncements: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const data = {
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        type: formData.get("type") as string,
    };

    startTransition(async () => {
        const res = await createAnnouncement(data);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Announcement broadcasted!");
            setIsOpen(false);
        }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Global Announcements</h1>
          <p className="text-muted-foreground">Broadcast updates to Students and Faculty.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Megaphone className="h-4 w-4 mr-2" /> Post Announcement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Broadcast New Message</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="e.g. Campus Closed for Holiday" required />
              </div>
               <div className="space-y-2">
                <Label>Announcement Tone</Label>
                <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                    <select name="type" required className="w-full bg-transparent outline-none text-sm">
                        <option value="GENERAL">General Information</option>
                        <option value="ACADEMIC">Academic Update</option>
                        <option value="URGENT">Urgent Alert</option>
                    </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Message Content</Label>
                <Textarea id="content" name="content" placeholder="Type your message here..." rows={4} required />
              </div>

              <Button type="submit" disabled={isPending} className="w-full bg-cyan-600 hover:bg-cyan-700">
                 {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                 Post Now
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {initialAnnouncements.length === 0 ? (
          <p className="text-muted-foreground italic">No past announcements.</p>
        ) : (
          initialAnnouncements.map((a) => (
            <Card key={a.id} className={`border-l-4 ${
                a.type === 'URGENT' ? 'border-l-red-500' : 'border-l-cyan-500'
            }`}>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <Badge variant={a.type === 'URGENT' ? 'destructive' : 'secondary'} className="text-[10px] uppercase">
                                {a.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {format(new Date(a.createdAt), "PPP")}
                            </span>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => deleteAnnouncement(a.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <CardTitle className="text-lg">{a.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{a.content}</p>
                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 text-[10px] text-muted-foreground italic">
                        Posted by {a.author.name}
                    </div>
                </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
