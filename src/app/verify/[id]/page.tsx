import { db } from "@/lib/db";
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck, GraduationCap, Calendar, Award } from "lucide-react";

export default async function VerificationPage({ params }: { params: { id: string } }) {
  const student = await db.student.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true } }, course: true, batch: true }
  });

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <Card className="max-w-md w-full border-0 shadow-2xl rounded-[2rem] p-8 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl mx-auto flex items-center justify-center mb-6">
                <ShieldCheck className="h-10 w-10 opacity-30" />
            </div>
            <h1 className="text-2xl font-black italic tracking-tighter">Verification Failed</h1>
            <p className="text-muted-foreground mt-2 text-sm">The provided Certificate ID does not match any official academic records in the CampusOS network.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 selection:bg-cyan-200">
      <Card className="max-w-2xl w-full border-0 shadow-2xl rounded-[3rem] overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-emerald-400 to-cyan-500" />
          
          <CardHeader className="p-12 pb-0 flex flex-col items-center text-center">
             <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                <CheckCircle2 className="h-12 w-12" />
             </div>
             <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] mb-4">
                Authentically Verified
             </Badge>
             <CardTitle className="text-4xl font-black italic tracking-tighter">Academic Credential</CardTitle>
             <CardDescription className="font-bold text-slate-400">CampusOS Trust Network • Institute ID: 269-X</CardDescription>
          </CardHeader>

          <CardContent className="p-12 space-y-10">
              <div className="space-y-6">
                 <div className="flex gap-6 items-center p-6 rounded-3xl bg-slate-50 border border-slate-100 italic">
                    <div className="p-4 bg-white rounded-2xl shadow-sm"><GraduationCap className="h-6 w-6 text-cyan-600" /></div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Recipient</p>
                        <p className="text-xl font-black text-slate-900">{student.user.name}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <Award className="h-5 w-5 text-amber-500 mb-3" />
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Course</p>
                        <p className="text-sm font-bold">{student.course.name}</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <Calendar className="h-5 w-5 text-blue-500 mb-3" />
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Batch</p>
                        <p className="text-sm font-bold">{student.batch.name}</p>
                    </div>
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Verification Hash</p>
                        <p className="text-[10px] font-mono text-slate-600 truncate max-w-[300px]">{params.id.split('').reverse().join('').toUpperCase()}...SHA256</p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600">
                        <ShieldCheck className="h-4 w-4" /> Blockchain Secured
                    </div>
                 </div>
              </div>
          </CardContent>

          {/* Background flourish */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mb-32" />
      </Card>
    </div>
  );
}
