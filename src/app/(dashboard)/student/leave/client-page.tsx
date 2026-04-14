"use client";

import { useState, useTransition } from "react";
import { applyForLeave } from "@/actions/leave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, Plus, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function StudentLeaveClientPage({ initialLeaves }: { initialLeaves: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const data = {
        type: formData.get("type") as string,
        reason: formData.get("reason") as string,
        start: formData.get("start") as string,
        end: formData.get("end") as string,
    };

    startTransition(async () => {
        const res = await applyForLeave(data);
        if (res?.error) toast.error(res.error);
        else {
            toast.success("Leave request submitted for approval.");
            setIsOpen(false);
        }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">Apply for absence and track approval status.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/20">
              <Plus className="h-4 w-4 mr-2" /> Request Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Leave Application</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                    <select name="type" required className="w-full bg-transparent outline-none text-sm">
                        <option value="SICK">Sick Leave</option>
                        <option value="CASUAL">Casual Leave</option>
                        <option value="EMERGENCY">Emergency Leave</option>
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start">From Date</Label>
                    <Input id="start" name="start" type="date" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end">To Date</Label>
                    <Input id="end" name="end" type="date" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leave</Label>
                <Textarea id="reason" name="reason" placeholder="Detailed explanation..." required />
              </div>

              <Button type="submit" disabled={isPending} className="w-full bg-cyan-600 hover:bg-cyan-700">
                 {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Submit Application"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialLeaves.length === 0 ? (
          <p className="text-muted-foreground italic col-span-full">No leave requests found.</p>
        ) : (
          initialLeaves.map((l) => (
            <Card key={l.id} className="border-slate-100 hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <Badge variant="outline" className="mb-2 uppercase text-[10px] tracking-widest">{l.type}</Badge>
                        <Badge 
                            variant={l.status === 'APPROVED' ? 'default' : l.status === 'REJECTED' ? 'destructive' : 'secondary'}
                            className={`${l.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : ''} border-0`}
                        >
                            {l.status}
                        </Badge>
                    </div>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-cyan-500" />
                        {format(new Date(l.startDate), "MMM dd")} - {format(new Date(l.endDate), "MMM dd")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 italic">
                        &ldquo;{l.reason}&rdquo;
                    </p>
                    
                    {l.remarks && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs">
                             <span className="font-bold block mb-1">Approver Remarks:</span>
                             <span className="text-muted-foreground">{l.remarks}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-2">
                        <Clock className="h-3 w-3" /> Requested on {format(new Date(l.createdAt), "PPP")}
                    </div>
                </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
