import type { SVGProps } from "react";
import { getStudentDashboardData } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, ShieldCheck, Share2, Medal, AlertCircle } from "lucide-react";

export default async function CertificatesPage() {
  const { student, attendancePercentage } = await getStudentDashboardData();
  const isEligible = attendancePercentage >= 75;

  if (!student) return <div className="p-10 text-center italic">Institutional records not found.</div>;

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Academic Honors</h1>
        <p className="text-muted-foreground italic">Your verified certifications and merit achievements.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Certificate Card */}
        <Card className="lg:col-span-2 border-0 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-blue-700/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-7">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-black italic tracking-tighter">Batch Completion</CardTitle>
                    <CardDescription className="font-bold text-xs uppercase text-cyan-600 tracking-widest">Official Verified Certificate</CardDescription>
                </div>
                <div className="p-3 bg-cyan-100 rounded-2xl text-cyan-600">
                    <Award className="h-8 w-8" />
                </div>
            </CardHeader>
            <CardContent className="relative z-10 space-y-6">
                <div className="p-6 rounded-3xl border-2 border-dotted border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-center gap-6">
	                    <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-cyan-500/20">
	                        <CertificateMedal className="h-10 w-10 text-cyan-600" />
                    </div>
                    <div className="text-center md:text-left space-y-1">
                        <h3 className="text-xl font-bold">{student.course.name}</h3>
                        <p className="text-sm text-muted-foreground uppercase font-black tracking-widest">{student.batch.name} • Completed</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                    {isEligible ? (
                        <>
                            <Button className="rounded-2xl h-12 px-8 bg-cyan-600 hover:bg-cyan-700 gap-2 font-bold shadow-lg shadow-cyan-600/20">
                                <Download className="h-4 w-4" /> Download PDF
                            </Button>
                            <Button variant="outline" className="rounded-2xl h-12 px-6 gap-2 font-bold border-2">
                                <Share2 className="h-4 w-4" /> Share on LinkedIn
                            </Button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex-1">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="text-xs font-bold leading-tight uppercase tracking-tighter">
                                Ineligible: Minimum 75% attendance required (Current: {attendancePercentage}%)
                            </p>
                        </div>
                    )}
                    <div className="flex-1" />
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" /> Verified by CampusOS Node
                    </div>
                </div>
            </CardContent>
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
        </Card>

        {/* Milestone Sidebar */}
        <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 pl-1">Merit Badges</h3>
            <div className="space-y-4">
                {[
                  { label: "Top Performer", icon: "⭐", desc: "Top 5% in Java Assessment" },
                  { label: "Perfect Attendance", icon: "📅", desc: "100% presence in January" },
                  { label: "Early Adopter", icon: "🚀", desc: "First 10 to complete Project Alpha" },
                ].map((m, i) => (
                  <Card key={i} className="border-0 shadow-md">
                     <CardContent className="p-4 flex items-center gap-4">
                        <div className="text-3xl">{m.icon}</div>
                        <div>
                            <p className="text-sm font-bold">{m.label}</p>
                            <p className="text-[10px] text-muted-foreground italic font-medium">{m.desc}</p>
                        </div>
                     </CardContent>
                  </Card>
                ))}
            </div>

            <Card className="bg-slate-900 text-white border-0 shadow-lg p-6 rounded-3xl relative overflow-hidden">
                <div className="relative z-10">
                    <Medal className="h-8 w-8 text-amber-400 mb-2" />
                    <h3 className="text-lg font-bold">Gold Standard Merit</h3>
                    <p className="text-[11px] opacity-70 italic mt-1">Granted for exceptional academic integrity and performance.</p>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl -mr-16 -mb-16" />
            </Card>
        </div>
      </div>
    </div>
  );
}

function CertificateMedal(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
          {...props}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8a2 2 0 0 1 2.24-.4l4.83 2.15" />
          <path d="M16.79 15 21.34 7.14a2 2 0 0 0-.13-2.2L19.6 2.8a2 2 0 0 0-2.24-.4l-4.83 2.15" />
          <path d="m12 12 3.04 5.32" />
          <path d="m12 12-3.04 5.32" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        </svg>
      )
}
