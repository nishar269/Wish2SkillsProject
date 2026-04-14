"use client";

import { useState, useTransition } from "react";
import { processLeaveRequest } from "@/actions/leave";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Loader2, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminLeaveClientPage({ initialLeaves }: { initialLeaves: any[] }) {
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  async function handleProcess(status: "APPROVED" | "REJECTED", remarks: string) {
    if (!selectedLeave) return;

    startTransition(async () => {
        const res = await processLeaveRequest(selectedLeave.id, status, remarks);
        if (res?.error) toast.error(res.error);
        else {
            toast.success(`Request ${status.toLowerCase()} successfully.`);
            setSelectedLeave(null);
        }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pending Leave Requests</h1>
        <p className="text-muted-foreground">Adjudicate student and faculty absence applications.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialLeaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No pending leave requests at the moment.
                  </TableCell>
                </TableRow>
              ) : (
                initialLeaves.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                           <User className="h-3.5 w-3.5 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{l.user.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{l.user.role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{l.type}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                       {format(new Date(l.startDate), "MMM dd")} - {format(new Date(l.endDate), "MMM dd")}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                       {format(new Date(l.createdAt), "MMM dd, p")}
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm" onClick={() => setSelectedLeave(l)}>
                           Review Request
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLeave} onOpenChange={() => setSelectedLeave(null)}>
          <DialogContent className="max-w-lg">
             <DialogHeader>
                <DialogTitle>Leave Application: {selectedLeave?.user.name}</DialogTitle>
             </DialogHeader>
             <div className="space-y-6 mt-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <Label className="text-[10px] text-muted-foreground uppercase font-black mb-1 block">Applicant Reason</Label>
                    <p className="text-sm leading-relaxed">&ldquo;{selectedLeave?.reason}&rdquo;</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" /> Start: {selectedLeave && format(new Date(selectedLeave.startDate), "PPP")}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" /> End: {selectedLeave && format(new Date(selectedLeave.endDate), "PPP")}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="remarks">Decision Remarks (Optional)</Label>
                    <Input id="remarks" placeholder="Optional internal feedback..." className="bg-white dark:bg-slate-950" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button 
                        onClick={() => handleProcess("REJECTED", (document.getElementById("remarks") as HTMLInputElement).value)} 
                        disabled={isPending}
                        variant="outline" 
                        className="text-red-600 hover:bg-red-50 border-red-100"
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                        Reject
                    </Button>
                    <Button 
                        onClick={() => handleProcess("APPROVED", (document.getElementById("remarks") as HTMLInputElement).value)} 
                        disabled={isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                        Approve Leave
                    </Button>
                </div>
             </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}
