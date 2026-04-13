import { getPublicPortfolio } from "@/actions/portfolio";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mail, GraduationCap, Briefcase, Award, TrendingUp, Globe, Link as LinkIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublicPortfolioPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const data = await getPublicPortfolio(studentId);

  if (!data) return <div className="min-h-screen flex items-center justify-center italic text-muted-foreground">Profile not found or is currently private.</div>;

  const { student, avgPerformance } = data;

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-cyan-200">
      {/* Header Banner */}
      <div className="h-64 bg-slate-900 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/30 to-blue-700/30" />
         <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-32 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Bio Section */}
          <div className="space-y-6">
            <Card className="border-0 shadow-2xl rounded-[2rem] overflow-hidden">
              <CardContent className="p-8 text-center pt-12">
                <div className="w-40 h-40 rounded-3xl bg-slate-100 mx-auto mb-6 flex items-center justify-center border-4 border-white shadow-xl rotate-3 transition-transform hover:rotate-0 duration-500 overflow-hidden">
                    {student.user.image ? (
                        <img src={student.user.image} alt={student.user.name} className="w-full h-full object-cover" />
                    ) : (
                        <GraduationCap className="h-16 w-16 text-slate-300" />
                    )}
                </div>
                <h1 className="text-3xl font-black italic tracking-tighter text-slate-900">{student.user.name}</h1>
                <p className="text-cyan-600 font-bold uppercase tracking-widest text-[10px] mt-2 italic">{student.course.name} Scholar</p>
                
                <div className="flex justify-center gap-3 mt-8">
                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-cyan-600 transition-colors"><Globe className="h-5 w-5" /></div>
                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-cyan-600 transition-colors"><LinkIcon className="h-5 w-5" /></div>
                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-cyan-600 transition-colors"><Globe className="h-5 w-5" /></div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Mail className="h-4 w-4 text-cyan-500" /> {student.user.email}
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-cyan-600 text-white p-8 rounded-[2rem]">
                <TrendingUp className="h-8 w-8 mb-4 opacity-50" />
                <h3 className="text-sm font-black uppercase tracking-widest mb-1">Academic Pulse</h3>
                <div className="text-5xl font-black italic tracking-tighter mb-4">{avgPerformance}%</div>
                <Progress value={avgPerformance} className="h-2 bg-white/20" />
                <p className="text-[10px] opacity-70 mt-4 leading-relaxed italic">Verified aggregate competency across all technical assessments and institute workshops.</p>
            </Card>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-lg rounded-[2rem] p-8">
                <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
                        <Award className="h-6 w-6 text-cyan-600" /> Mastery Profile
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-8">
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Competency Streams</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {student.results.slice(0, 4).map((r, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold">{r.test.title}</p>
                                        <p className="text-[10px] text-slate-400">{formatDate(r.createdAt)}</p>
                                    </div>
                                    <Badge className="bg-white text-cyan-600 shadow-sm border-0">{Math.round((r.marksObtained/r.test.totalMarks)*100)}%</Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Professional Trajectory</h4>
                        <div className="space-y-4">
                            {student.applications.length === 0 ? (
                                <p className="text-sm italic text-slate-400">Charting the career roadmap...</p>
                            ) : (
                                student.applications.map((a, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                            <Briefcase className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{a.jobPost.title} • {a.jobPost.company}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">{a.status}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-between p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 rounded-2xl">
                        <medal className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">CampusOS Certified Portfolio</p>
                        <p className="text-[10px] text-slate-400">Transaction ID: {student.id.slice(0, 12).toUpperCase()}</p>
                    </div>
                 </div>
                 <LinkIcon className="h-5 w-5 text-slate-300" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function medal(props: any) {
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
          <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
          <path d="M12 7V3" />
          <path d="M12 21v-4" />
          <path d="m17 12 4 2" />
          <path d="m3 10 4 2" />
          <path d="m7 7-2-2" />
          <path d="m19 19-2-2" />
          <path d="m17 7 2-2" />
          <path d="m5 19 2-2" />
        </svg>
      )
}
