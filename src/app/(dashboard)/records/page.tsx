import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive, Download, FileText, Database } from "lucide-react";

export default async function RecordsDashboardPage() {
  const session = await auth();

  const stats = [
    {
      title: "Total Records",
      value: "45,210",
      detail: "Students, Faculty, Staff",
      icon: Database,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Archives",
      value: "124",
      detail: "Past batches & courses",
      icon: Archive,
      color: "from-slate-500 to-slate-600",
    },
    {
      title: "Generated Reports",
      value: "45",
      detail: "This month",
      icon: FileText,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Pending Exports",
      value: "2",
      detail: "Processing currently",
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
          <CardTitle className="text-lg">Recent Exports (Demo)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">List of generated CSV/PDF reports will be here.</div>
        </CardContent>
      </Card>
    </div>
  );
}
