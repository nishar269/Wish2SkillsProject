import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  ArrowRight, 
  ShieldCheck, 
  Bot, 
  MapPin, 
  LayoutDashboard,
  Sparkles,
  ChevronRight,
  BookOpenCheck,
  Building2,
  Users
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafcff] font-sans text-slate-900 flex flex-col items-center overflow-x-hidden">
      {/* 1. Transparent Floating Header */}
      <nav className="w-full h-20 flex items-center px-6 md:px-12 justify-between fixed top-0 bg-white/70 backdrop-blur-xl z-50 border-b border-blue-900/5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Wish2Skill</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
          <Link href="#ai" className="hover:text-blue-600 transition-colors">Campus Scout AI</Link>
          <Link href="#features" className="hover:text-blue-600 transition-colors">Platform Modules</Link>
          <Link href="#security" className="hover:text-blue-600 transition-colors">Security Core</Link>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="hidden md:flex text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <Link href="/login">Portal Login</Link>
          </Button>
          <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 rounded-xl shadow-xl shadow-slate-900/10 transition-all hover:scale-105 active:scale-95">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* 2. Hero Section (Dynamic & Premium) */}
      <main className="w-full flex flex-col items-center">
        <section className="relative pt-40 pb-24 px-6 max-w-6xl w-full text-center flex flex-col items-center space-y-10">
          {/* Background Ambient Gradients */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-blue-100 shadow-sm text-blue-600 text-xs font-bold uppercase tracking-widest leading-none">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Powered by Advanced AI</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-extrabold text-slate-900 leading-[1.05] tracking-tighter max-w-4xl">
            The Next-Generation <br />
            <span className="relative">
               <span className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Institute Operating System.</span>
               <span className="absolute bottom-2 left-0 w-full h-8 bg-blue-100/50 -z-10 -rotate-1" />
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
            Wish2Skill CampusOS unifies academic operations, geo-fenced attendance, interactive scheduling, and student insights into one stunning, highly secure platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Button size="lg" className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-bold shadow-xl shadow-blue-600/20 group hover:scale-[1.02] active:scale-[0.98] transition-all" asChild>
              <Link href="/login">
                Access Campus Portal
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 border-slate-200 bg-white text-slate-700 rounded-2xl text-lg font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm" asChild>
              <Link href="#features">Explore Modules</Link>
            </Button>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12 pt-16 border-t border-slate-200/60 mt-8 w-full max-w-4xl mx-auto">
             {[
               { val: "6", label: "Access Roles" },
               { val: "AI", label: "Powered Agent" },
               { val: "GPS", label: "Geo-Attendance" },
               { val: "100%", label: "Data Integrity" },
             ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                    <span className="text-3xl font-black text-slate-900">{stat.val}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</span>
                </div>
             ))}
          </div>
        </section>

        {/* 3. Deep Dive Features */}
        <section id="features" className="w-full py-32 px-6 bg-white border-t border-slate-100 flex flex-col items-center relative overflow-hidden">
          <div className="max-w-7xl w-full">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">Engineered for Academic Excellence</h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg">Every module is custom-built to eliminate administrative friction and elevate the student learning experience.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 w-full">
              {/* Feature 1: AI */}
              <div id="ai" className="bg-slate-50 border border-slate-100 rounded-[2rem] p-10 flex flex-col justify-between hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
                 <div className="space-y-6">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Bot className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Campus Scout AI</h3>
                        <p className="text-slate-500 mt-2 leading-relaxed">
                            A global, role-aware AI assistant integrated directly into the platform. Campus Scout answers structural questions, provides instant academic support, and summarizes learning materials on demand.
                        </p>
                    </div>
                 </div>
                 <div className="mt-8 pt-6 border-t border-slate-200">
                     <span className="text-sm font-bold text-blue-600 flex items-center">Powered by OpenRouter & Gemini Data Models</span>
                 </div>
              </div>

               {/* Feature 2: Attendance */}
               <div id="security" className="bg-slate-900 text-white border border-slate-800 rounded-[2rem] p-10 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-900/20 transition-all group relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                 <div className="space-y-6 relative z-10">
                    <div className="w-16 h-16 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-white/5">
                        <MapPin className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Geo-Fenced Security Protocols</h3>
                        <p className="text-slate-300 mt-2 leading-relaxed">
                            Stop proxy attendance permanently. Our attendance system utilizes browser geolocation and Haversine distance validation to ensure students are physically inside the campus perimeter before granting check-in access.
                        </p>
                    </div>
                 </div>
                 <div className="mt-8 pt-6 border-t border-slate-800 relative z-10">
                     <span className="text-sm font-bold text-emerald-400 flex items-center"><ShieldCheck className="h-4 w-4 mr-2" /> Military-grade location validation</span>
                 </div>
              </div>

               {/* Feature 3: RBAC */}
               <div className="bg-white border border-slate-200 rounded-[2rem] p-10 flex flex-col justify-between hover:shadow-xl transition-all shadow-sm lg:col-span-2">
                 <div className="flex items-center gap-6 mb-8">
                    <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
                        <LayoutDashboard className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Granular Role-Based Access Control (RBAC)</h3>
                 </div>
                 
                 <div className="grid md:grid-cols-4 gap-4">
                     {[
                         { role: "Authority", desc: "Executive analytics & platform oversight", icon: Building2 },
                         { role: "Administrator", desc: "User orchestration & academic mapping", icon: Users },
                         { role: "Faculty", desc: "Workload tracking & active assessment", icon: BookOpenCheck },
                         { role: "Coordination", desc: "Batch integrity & student monitoring", icon: ShieldCheck }
                     ].map((role, idx) => (
                         <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3">
                             <role.icon className="h-5 w-5 text-slate-400 shrink-0" />
                             <div>
                                 <p className="text-sm font-bold text-slate-900 leading-none mb-1">{role.role}</p>
                                 <p className="text-xs text-slate-500 leading-snug">{role.desc}</p>
                             </div>
                         </div>
                     ))}
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CTA Section */}
        <section className="w-full py-24 px-6 bg-blue-600 flex justify-center">
            <div className="max-w-4xl text-center space-y-8">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Ready to map your institution?</h2>
                <p className="text-blue-100 text-lg font-medium max-w-2xl mx-auto">
                    Take advantage of our demo environments. Experience the platform from the perspective of an Admin, Coordinator, Faculty, or Student.
                </p>
                <Button size="lg" className="h-16 px-10 bg-white hover:bg-slate-50 text-blue-600 rounded-2xl text-lg font-bold shadow-2xl hover:scale-105 transition-all" asChild>
                    <Link href="/login">Launch Interactive Demo <ChevronRight className="ml-2 h-5 w-5" /></Link>
                </Button>
            </div>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="w-full py-10 bg-slate-950 flex flex-col items-center">
         <div className="max-w-7xl w-full px-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-8 mb-8">
             <div className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-slate-400" />
                <span className="font-bold text-lg tracking-tight text-slate-300">Wish2Skill</span>
             </div>
             <div className="flex items-center gap-6 text-sm font-semibold text-slate-500">
                 <Link href="/login" className="hover:text-white transition-colors">Admin Portal</Link>
                 <Link href="/login" className="hover:text-white transition-colors">Student Portal</Link>
             </div>
         </div>
         <div className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Wish2Skill CampusOS. Institutional Management Protocol.
         </div>
      </footer>
    </div>
  );
}
