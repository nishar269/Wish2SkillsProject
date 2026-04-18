import { getArchiveInventory } from "@/actions/records";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Archive, Database, History, Layers3 } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function RecordsArchivesPage() {
  const data = await getArchiveInventory();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Archive Vault</h1>
        <p className="text-muted-foreground mt-1">
          Review completed academic batches and the latest system export activity.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Archived Batches</p>
                <p className="text-3xl font-bold tracking-tight">{data.completedBatches.length}</p>
              </div>
              <div className="rounded-xl bg-slate-900 p-3 text-white">
                <Archive className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Stored Students</p>
                <p className="text-3xl font-bold tracking-tight">
                  {data.completedBatches.reduce((total, batch) => total + batch._count.students, 0)}
                </p>
              </div>
              <div className="rounded-xl bg-blue-600 p-3 text-white">
                <Database className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Export Events</p>
                <p className="text-3xl font-bold tracking-tight">{data.exportLogs.length}</p>
              </div>
              <div className="rounded-xl bg-emerald-600 p-3 text-white">
                <History className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Completed Batch Inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.completedBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                    No completed batches are archived yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.completedBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Layers3 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{batch.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{batch.course.name}</TableCell>
                    <TableCell>{batch._count.students}</TableCell>
                    <TableCell>{batch._count.classSessions}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(batch.updatedAt), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Recent Export Ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.exportLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                    No export activity has been logged yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.exportLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant="outline" className="border-none bg-slate-100 text-slate-700">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.user.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm")}
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
