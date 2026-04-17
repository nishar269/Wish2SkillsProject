import { getRecordsStats } from "@/actions/records";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Archive, Download, FileText, Database, History } from "lucide-react";

export default async function RecordsDashboardPage() {
  const statsData = await getRecordsStats();

  const stats = [
    {
      title: "Total People",
      value: statsData.totalPeople.toLocaleString(),
      detail: "Students & Faculty",
      icon: Database,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Archives",
      value: statsData.archives.toString(),
      detail: "Completed batches",
      icon: Archive,
      color: "from-slate-500 to-slate-600",
    },
    {
      title: "System Exports",
      value: statsData.generatedReports.toString(),
      detail: "Admin data requests",
      icon: FileText,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "System Performance",
      value: "99.9%",
      detail: "Live environment",
      icon: Download,
      color: "from-amber-500 to-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Records Management 🗄️
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage archives, data exports, and extensive reports.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.detail}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5" /> Recent Exports Output</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Export Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statsData.recentExports?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center italic text-muted-foreground p-8">No data exports performed yet.</TableCell>
                </TableRow>
              ) : statsData.recentExports?.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="font-bold font-mono text-sm">{exp.action}</TableCell>
                  <TableCell className="text-muted-foreground">{exp.details}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(exp.createdAt), "MMM dd, yyyy HH:mm")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
