import { auth } from "@/lib/auth";
import { getCoordinatorDashboardData } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  GraduationCap,
  Calendar,
  AlertTriangle,
  Users
} from "lucide-react";

export default async function CoordinatorDashboardPage() {
  const session = await auth();
  const data = await getCoordinatorDashboardData();

  const stats = [
    {
      title: "Active Batches",
      value: data.activeBatches.toString(),
      detail: "Currently running",
      icon: GraduationCap,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Students",
      value: data.totalStudents.toString(),
      detail: "Across active batches",
      icon: Users,
      color: "from-amber-500 to-amber-600",
    },
    {
      title: "Classes Today",
      value: data.classesToday.toString(),
      detail: "Scheduled sessions",
      icon: Calendar,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Attention Needed",
      value: "0", // Fallback for gamification logic not fully built
      detail: "Students at risk",
      icon: AlertTriangle,
      color: "from-red-500 to-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {session?.user?.name?.split(" ")[0]}! 📋
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor your batches and oversee academic operations.
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

      {/* Real batch monitoring section */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Active Batches</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.batchesList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center italic text-muted-foreground">No active batches found.</TableCell>
                </TableRow>
              ) : data.batchesList.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-bold">{batch.name}</TableCell>
                  <TableCell>{batch.course.code}</TableCell>
                  <TableCell>{batch._count.students} / {batch.capacity}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none">{batch.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
