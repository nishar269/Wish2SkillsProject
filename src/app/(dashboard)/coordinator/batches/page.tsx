import { getBatches } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers3, Users, CalendarDays } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function CoordinatorBatchesPage() {
  const batches = await getBatches();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Batch Control Center</h1>
        <p className="text-muted-foreground mt-1">
          Review batch capacity, status, and academic timelines across the institute.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Batches</p>
                <p className="text-3xl font-bold tracking-tight">{batches.length}</p>
              </div>
              <div className="rounded-xl bg-blue-600 p-3 text-white">
                <Layers3 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Active Batches</p>
                <p className="text-3xl font-bold tracking-tight">
                  {batches.filter((batch) => batch.status === "ACTIVE").length}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-600 p-3 text-white">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Enrolled Students</p>
                <p className="text-3xl font-bold tracking-tight">
                  {batches.reduce((total, batch) => total + batch._count.students, 0)}
                </p>
              </div>
              <div className="rounded-xl bg-amber-600 p-3 text-white">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Batch Registry</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                    No batches are configured yet.
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((batch) => {
                  const capacityRatio = batch.capacity > 0
                    ? Math.min((batch._count.students / batch.capacity) * 100, 100)
                    : 0;

                  return (
                    <TableRow key={batch.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold">{batch.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {batch._count.students} students enrolled
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{batch.course.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(batch.startDate), "MMM dd, yyyy")}
                        {batch.endDate ? ` to ${format(new Date(batch.endDate), "MMM dd, yyyy")}` : " onward"}
                      </TableCell>
                      <TableCell className="min-w-44">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">{batch._count.students}/{batch.capacity}</span>
                            <span className="text-muted-foreground">{Math.round(capacityRatio)}%</span>
                          </div>
                          <Progress value={capacityRatio} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-none bg-slate-100 text-slate-700">
                          {batch.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
