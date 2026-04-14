"use client";

import { useState, useTransition } from "react";
import { summarizeMaterial } from "@/actions/materials";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, ExternalLink, Sparkles, Loader2, BrainCircuit } from "lucide-react";
import { toast } from "sonner";

export default function StudentResourcesClientPage({ initialMaterials }: { initialMaterials: any[] }) {
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [activeSummary, setActiveSummary] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSummarize = (id: string) => {
    setSummarizingId(id);
    startTransition(async () => {
        const res = await summarizeMaterial(id);
        if (res?.error) {
            toast.error(res.error);
        } else {
            setActiveSummary(res.summary);
        }
        setSummarizingId(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resource Center</h1>
          <p className="text-muted-foreground">Access your course handbooks, notes, and study materials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialMaterials.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed">
            <FileText className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-lg font-semibold text-slate-500">No materials available yet.</h3>
          </div>
        ) : (
          initialMaterials.map((m) => (
            <Card key={m.id} className="group hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-950/50 rounded-2xl text-cyan-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase">{m.subject.code}</Badge>
                </div>
                <div className="mt-4 space-y-1">
                  <CardTitle className="text-xl group-hover:text-cyan-600 transition-colors line-clamp-1">{m.title}</CardTitle>
                  <CardDescription className="text-xs">{m.subject.name}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                  {m.description || "No description provided."}
                </p>
              </CardContent>
              <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <a href={m.fileUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-3 w-3" /> View PDF
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSummarize(m.id)}
                    disabled={summarizingId === m.id}
                    className="text-xs border-cyan-200 text-cyan-700 bg-cyan-50/50 hover:bg-cyan-100"
                  >
                    {summarizingId === m.id ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                    Smart Info
                  </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!activeSummary} onOpenChange={() => setActiveSummary(null)}>
        <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-cyan-600" />
                    AI Intelligence Summary
                </DialogTitle>
            </DialogHeader>
            <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{activeSummary}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground italic">
                        <Sparkles className="h-3 w-3" /> Powered by Gemini
                    </div>
                </div>
            </div>
            <Button className="w-full bg-slate-900 text-white mt-4" onClick={() => setActiveSummary(null)}>Close Insight</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
