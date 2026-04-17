"use client";

import { useState, useTransition } from "react";
import { createFee, deleteFee, getAllFees, getStudentsForFees } from "@/actions/fees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Loader2, Filter } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type FeeRecord = Awaited<ReturnType<typeof getAllFees>>;
type FeeStudent = Awaited<ReturnType<typeof getStudentsForFees>>;

export default function AdminFeesClientPage({
  initialFees,
  students,
}: {
  initialFees: FeeRecord;
  students: FeeStudent;
}) {
  const [fees] = useState(initialFees);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleAddFee(formData: FormData) {
    const data = {
      studentId: formData.get("studentId") as string,
      title: formData.get("title") as string,
      amount: parseFloat(formData.get("amount") as string),
      dueDate: formData.get("dueDate") as string,
    };

    startTransition(async () => {
      const res = await createFee(data);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Fee issued successfully!");
        setIsAddOpen(false);
      }
    });
  }

  const handleDeletRecord = async (id: string) => {
      if(!confirm("Are you sure?")) return;
      const res = await deleteFee(id);
      if(res?.error) toast.error(res.error);
      else toast.success("Record deleted.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finance Management 🏦</h1>
          <p className="text-muted-foreground">Issue invoices, track payments, and manage student accounts.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" /> Issue New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Fee Record</DialogTitle>
            </DialogHeader>
            <form action={handleAddFee} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Select Student</Label>
                <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900">
                    <select name="studentId" required defaultValue="" className="w-full bg-transparent outline-none text-sm">
                        <option value="" disabled>Search student...</option>
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>{s.user.name}</option>
                        ))}
                    </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Charge Description</Label>
                <Input id="title" name="title" placeholder="e.g. Semester 2 Tuition Fee" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input id="amount" name="amount" type="number" placeholder="0.00" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" name="dueDate" type="date" required />
                </div>
              </div>
              <Button type="submit" disabled={isPending} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Generate Invoice
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <div className="flex items-center gap-4">
             <div className="flex-1 max-w-sm relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Filter by student or title..." />
             </div>
        </div>

        <Card className="border-0 shadow-md">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Charge Title</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground italic">
                                    No financial records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            fees.map((fee) => (
                                <TableRow key={fee.id}>
                                    <TableCell>
                                        <div className="font-bold flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">
                                                {fee.student.user.name.charAt(0)}
                                            </div>
                                            {fee.student.user.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">{fee.title}</TableCell>
                                    <TableCell className="font-black">₹{fee.amount.toLocaleString()}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {format(new Date(fee.dueDate), "MMM dd, yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={fee.status === 'PAID' ? 'default' : 'destructive'} className="text-[10px] uppercase font-black tracking-tight">
                                            {fee.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDeletRecord(fee.id)}>
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
    </div>
  );
}
