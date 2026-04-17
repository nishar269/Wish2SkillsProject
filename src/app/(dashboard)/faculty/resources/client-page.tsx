"use client";

import { useState, useTransition } from "react";
import { createMaterial, deleteMaterial, getMaterials } from "@/actions/materials";
import { getSubjects } from "@/actions/subject";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FilePlus, FileText, Loader2, Trash2, ExternalLink } from "lucide-react";
import type { MaterialType } from "@prisma/client";
import { toast } from "sonner";
import { format } from "date-fns";

type Material = Awaited<ReturnType<typeof getMaterials>>;
type Subject = Awaited<ReturnType<typeof getSubjects>>;

export default function FacultyResourcesClientPage({
  initialMaterials,
  subjects,
}: {
  initialMaterials: Material;
  subjects: Subject;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const data = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        subjectId: formData.get("subjectId") as string,
        fileUrl: formData.get("fileUrl") as string,
        fileType: (formData.get("fileType") || "PDF") as MaterialType,
    };

    startTransition(async () => {
        const res = await createMaterial(data);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Material added successfully!");
            setIsOpen(false);
        }
    });
  }

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure?")) return;
    startTransition(async () => {
        const res = await deleteMaterial(id);
        if (res?.error) toast.error(res.error);
        else toast.success("Material deleted.");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Study Materials</h1>
          <p className="text-muted-foreground">Upload and manage shared learning resources.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <FilePlus className="h-4 w-4 mr-2" /> Upload Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Resource Material</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Resource Title</Label>
                <Input id="title" name="title" placeholder="e.g. React Basics Handbook" required />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                    <select name="subjectId" required defaultValue="" className="w-full bg-transparent outline-none text-sm">
                        <option value="" disabled>Select Subject</option>
                        {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileUrl">Document Link (e.g. Google Drive/Cloudinary)</Label>
                <div className="flex gap-2">
                   <div className="border rounded-md px-3 bg-slate-50 dark:bg-slate-900 border-slate-200">
                      <select name="fileType" className="h-9 bg-transparent outline-none text-sm w-20">
                          <option value="PDF">PDF</option>
                          <option value="VIDEO">Video</option>
                          <option value="LINK">Link</option>
                          <option value="IMAGE">Image</option>
                          <option value="DOC">Doc</option>
                      </select>
                   </div>
                   <Input id="fileUrl" name="fileUrl" placeholder="https://..." className="flex-1" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Input id="description" name="description" placeholder="What is this about?" />
              </div>

              <Button type="submit" disabled={isPending} className="w-full bg-cyan-600 hover:bg-cyan-700">
                 {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                 Submit Resource
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
                <TableHead>Resource</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialMaterials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No materials uploaded yet.
                  </TableCell>
                </TableRow>
              ) : (
                initialMaterials.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{m.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{m.description || "No description"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.subject.name}</Badge>
                      <Badge variant="secondary" className="ml-2 text-[10px]">{m.fileType}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(m.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild className="text-cyan-600">
                        <a href={m.fileUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(m.id)}>
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
