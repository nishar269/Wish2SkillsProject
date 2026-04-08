"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { 
  TrendingUp, Users, GraduationCap, Award, 
  ArrowUpRight, ArrowDownRight, Target, ShieldCheck 
} from "lucide-react";

export default function AuthorityDashboardClient({ stats }: { stats: any }) {
  // Mock data for charts
  const enrollmentData = [
    { name: "Jan", count: 400 },
    { name: "Feb", count: 300 },
    { name: "Mar", count: 600 },
    { name: "Apr", count: 800 },
    { name: "May", count: 500 },
    { name: "Jun", count: 900 },
  ];

  const attendanceRate = [
    { name: "Mon", rate: 85 },
    { name: "Tue", rate: 82 },
    { name: "Wed", rate: 78 },
    { name: "Thu", rate: 90 },
    { name: "Fri", rate: 88 },
  ];

  const COLORS = ["#0ea5e9", "#6366f1", "#a855f7", "#ec4899"];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Executive Control</h1>
          <p className="text-muted-foreground">Institute-wide metrics and strategic intelligence.</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-100 pr-4">
            <div className="p-2 bg-emerald-500 rounded-full text-white">
                <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-emerald-700">All Systems Operational</span>
        </div>
      </div>

      {/* High-Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: "Total Revenue", value: "$4.1M", up: true, trend: "12%", icon: TrendingUp, color: "blue" },
            { label: "Total Students", value: "1,450", up: true, trend: "8%", icon: Users, color: "indigo" },
            { label: "Active Faculty", value: "84", up: false, trend: "2%", icon: GraduationCap, color: "purple" },
            { label: "Placement Rate", value: "94%", up: true, trend: "4%", icon: Award, color: "cyan" },
        ].map((kpi, i) => (
            <Card key={i} className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden group">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                         <div className={`p-3 rounded-2xl bg-${kpi.color}-50 dark:bg-${kpi.color}-950/50 text-${kpi.color}-600`}>
                            <kpi.icon className="h-6 w-6" />
                         </div>
                         <div className={`flex items-center gap-1 text-xs font-bold ${kpi.up ? "text-emerald-500" : "text-red-500"}`}>
                            {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {kpi.trend}
                         </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-muted-foreground font-medium">{kpi.label}</p>
                        <h3 className="text-3xl font-black mt-1">{kpi.value}</h3>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enrollment Trend */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Enrollment Velocity</CardTitle>
            <CardDescription>New student registrations over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                />
                <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Course Popularity</CardTitle>
            <CardDescription>Current student major distribution.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={[
                            { name: 'Java Full Stack', value: 400 },
                            { name: 'Data Science', value: 300 },
                            { name: 'Cloud Computing', value: 300 },
                            { name: 'UI/UX Design', value: 200 },
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {enrollmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Stats */}
      <Card className="border-0 shadow-lg">
         <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Attendance Integrity</CardTitle>
                    <CardDescription>Daily institute-wide engagement levels.</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-xs font-medium">Present</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                        <span className="text-xs font-medium">Target (90%)</span>
                     </div>
                </div>
            </div>
         </CardHeader>
         <CardContent className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={attendanceRate}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Bar dataKey="rate" fill="#0ea5e9" radius={[10, 10, 0, 0]} barSize={40} />
               </BarChart>
            </ResponsiveContainer>
         </CardContent>
      </Card>
    </div>
  );
}
