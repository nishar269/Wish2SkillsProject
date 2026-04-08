"use client";

import { useState, useTransition } from "react";
import { createBatch, deleteBatch } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Database, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function BatchesPage({ initialBatches, courses }: { initialBatches: any[], courses: any[] }) {
  const [batches, setBatches] = useState(initialBatches);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const data = {
      name: formData.get("name"),
      courseId: formData.get("courseId"),
      capacity: formData.get("capacity"),
      startDate: formData.get("startDate"),
    };

    startTransition(async () => {
      const res = await createBatch(data);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Batch created successfully!");
        setIsOpen(false);
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this batch?")) return;
    
    const res = await deleteBatch(id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Batch deleted successfully!");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Batches</h1>
          <p className="text-muted-foreground">Manage student batches and class groupings.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Batch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Batch</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Batch Identifier</Label>
                <Input id="name" name="name" placeholder="e.g. JFS-B12" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="courseId">Associated Course</Label>
                <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                  <select 
                    id="courseId" 
                    name="courseId" 
                    required 
                    className="w-full bg-transparent outline-none text-sm"
                  >
                    <option value="" disabled selected>Select a course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" name="capacity" type="number" defaultValue="30" min="1" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" required />
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="w-full bg-cyan-600 hover:bg-cyan-700">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Batch
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
                <TableHead>Batch</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No batches found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg text-purple-600">
                          <Database className="h-4 w-4" />
                        </div>
                        <p className="font-semibold">{batch.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{batch.course.name}</p>
                      <p className="text-xs text-muted-foreground">{batch.course.code}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(batch.startDate), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {batch._count.students} / {batch.capacity}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        batch.status === "ACTIVE" ? "default" : 
                        batch.status === "UPCOMING" ? "outline" : "secondary"
                      }>
                        {batch.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(batch.id)}>
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
