import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart3, Star, TrendingUp } from "lucide-react";

export default async function AuthorityDashboardPage() {
  const session = await auth();

  const stats = [
    {
      title: "Overall Rating",
      value: "4.8/5.0",
      detail: "From 1.2k feedbacks",
      icon: Star,
      color: "from-amber-400 to-orange-500",
    },
    {
      title: "Placement Rate",
      value: "92%",
      detail: "+4% from last year",
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Institute Ranking",
      value: "#1",
      detail: "Regional tech institutes",
      icon: BarChart3,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Active Enrollments",
      value: "1,450",
      detail: "Increasing trend",
      icon: LineChart,
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Executive Dashboard 📈
        </h1>
        <p className="text-muted-foreground mt-1">
          High-level overview and insights for {session?.user?.name}.
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
      
      {/* Adding a placeholder for analytics charts */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Institute Analytics (Demo)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Comprehensive charts and performance analytics will appear here.</div>
        </CardContent>
      </Card>
    </div>
  );
}
