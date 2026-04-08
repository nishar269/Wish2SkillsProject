import { getMaterials } from "@/actions/materials";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, Filter } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function StudentResourcesPage() {
  const session = await auth();
  if (!session) return null;

  const student = await db.student.findUnique({
    where: { userId: session.user.id }
  });

  if (!student) return null;

  // For students, we usually only show materials for their specific course
  const materials = await db.material.findMany({
    where: { subject: { courseId: student.courseId } },
    include: {
      subject: true,
      faculty: { include: { user: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resource Center</h1>
          <p className="text-muted-foreground">Access your course handbooks, notes, and study materials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed">
            <FileText className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-lg font-semibold text-slate-500">No materials available yet.</h3>
            <p className="text-sm text-muted-foreground">Check back later for updates from your faculty.</p>
          </div>
        ) : (
          materials.map((m) => (
            <Card key={m.id} className="group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-950/50 rounded-2xl text-cyan-600 group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                    {m.subject.code}
                  </Badge>
                </div>
                <div className="mt-4 space-y-1">
                  <CardTitle className="text-xl group-hover:text-cyan-600 transition-colors line-clamp-1">
                    {m.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {m.subject.name}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                  {m.description || "No description provided for this resource."}
                </p>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-medium text-slate-500">{m.faculty?.user.name || "System Admin"}</span>
                   </div>
                   <span className="text-[10px] text-muted-foreground">
                        {format(new Date(m.createdAt), "MMM d, yyyy")}
                   </span>
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                  <Button asChild className="w-full bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 group">
                    <a href={m.fileUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Access Resource
                    </a>
                  </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
