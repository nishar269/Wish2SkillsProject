"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { 
  TrendingUp, Users, GraduationCap, Award, 
  ArrowUpRight, ShieldCheck 
} from "lucide-react";

export default function AuthorityDashboardClient({ stats }: { stats: { summary: Record<string, number>, enrollmentByCourse: {name: string, count: number}[] } }) {
  // Map real enrollment data for the charts
  const enrollmentData = stats.enrollmentByCourse.length > 0 
    ? stats.enrollmentByCourse 
    : [{ name: "No Data", count: 1 }];

  const attendanceRate = [
    { name: "Mon", rate: 85 },
    { name: "Tue", rate: 82 },
    { name: "Wed", rate: 78 },
    { name: "Thu", rate: 90 },
    { name: "Fri", rate: 88 },
  ];

  const COLORS = ["#b78c46", "#22314f", "#3a6a58", "#875d39"];
  const kpis = [
    { label: "Total Students", value: stats.summary.students.toLocaleString(), trend: "Active", icon: Users, iconClass: "bg-[#f2eadf] text-[#a07a3d]" },
    { label: "Faculty Strength", value: stats.summary.faculty.toLocaleString(), trend: "Active", icon: GraduationCap, iconClass: "bg-[#e8edf6] text-[#374b7d]" },
    { label: "Total Courses", value: stats.summary.courses.toLocaleString(), trend: "Offered", icon: Award, iconClass: "bg-[#f0e7f6] text-[#7b4fa1]" },
    { label: "Total Batches", value: stats.summary.batches.toLocaleString(), trend: "Running", icon: TrendingUp, iconClass: "bg-[#e7f1ed] text-[#2d6a57]" },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="premium-shell flex flex-col gap-4 px-6 py-6 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <div className="premium-kicker border-[#e0d5c4] bg-white/55 text-[#9d7b43]">Executive Control</div>
          <h1 className="premium-title pt-4 text-5xl text-[#141c2d]">Institution-wide intelligence.</h1>
          <p className="pt-2 text-sm leading-relaxed text-[#655742]">Enrollment, attendance and strategic indicators, tuned for executive review.</p>
        </div>
        <div className="premium-panel flex items-center gap-3 px-4 py-3">
            <div className="rounded-full bg-[#2d6a57] p-2 text-white">
                <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2d6a57]">All Systems Operational</span>
        </div>
      </div>

      {/* High-Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
            <Card key={i} className="border-0 overflow-hidden group">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                         <div className={`p-3 rounded-2xl ${kpi.iconClass}`}>
                            <kpi.icon className="h-6 w-6" />
                         </div>
                         <div className="flex items-center gap-1 text-xs font-semibold text-[#2d6a57]">
                            <ArrowUpRight className="h-3 w-3" />
                            {kpi.trend}
                         </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#92754a]">{kpi.label}</p>
                        <h3 className="pt-3 text-3xl font-bold tracking-tight text-[#141c2d]">{kpi.value}</h3>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enrollment Trend */}
        <Card className="lg:col-span-2 border-0">
          <CardHeader>
            <CardTitle>Enrollment Velocity</CardTitle>
            <CardDescription>New student registrations over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b78c46" stopOpacity={0.32}/>
                    <stop offset="95%" stopColor="#b78c46" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2d7c8" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                />
                <Area type="monotone" dataKey="count" stroke="#b78c46" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Distribution */}
        <Card className="border-0">
          <CardHeader>
            <CardTitle>Course Popularity</CardTitle>
            <CardDescription>Current student major distribution.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={enrollmentData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                    >
                        {enrollmentData.map((entry: {name: string, count: number}, index: number) => (
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
      <Card className="border-0">
         <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Attendance Integrity</CardTitle>
                    <CardDescription>Daily institute-wide engagement levels.</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#b78c46]" />
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2d7c8" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Bar dataKey="rate" fill="#22314f" radius={[10, 10, 0, 0]} barSize={40} />
               </BarChart>
            </ResponsiveContainer>
         </CardContent>
      </Card>
    </div>
  );
}
