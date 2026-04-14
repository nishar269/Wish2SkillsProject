import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Shield, Zap, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Dynamic Header */}
      <nav className="h-20 border-b border-slate-100 flex items-center px-6 md:px-12 justify-between sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">Wish2Skill</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
          <Link href="#features" className="hover:text-blue-600 transition-colors">Courses</Link>
          <Link href="#intel" className="hover:text-blue-600 transition-colors">Campus OS</Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="text-sm font-bold text-slate-600">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Centered Hero Section */}
      <main className="relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
        
        <section className="pt-24 pb-32 px-6 max-w-5xl mx-auto text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wider mx-auto">
            <Zap className="h-3 w-3 fill-blue-600" />
            Next-Generation Education Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight">
            Empowering the Future of <br />
            <span className="text-blue-600">Learning & Teaching</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
            Wish2Skill CampusOS is a simple, all-in-one institute management platform. 
            Highly secure, role-based, and designed for modern educational ecosystems.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-bold shadow-xl shadow-blue-200 transition-transform active:scale-95" asChild>
              <Link href="/login">
                Initiate Session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 border-slate-200 text-slate-600 rounded-2xl text-lg font-bold hover:bg-slate-50" asChild>
              <Link href="/login">View Course Mainnet</Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col items-center gap-3 pt-10">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-slate-300" />
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Joined by 2000+ Students Daily</p>
          </div>
        </section>

        {/* Feature Grid - Non-floating, clean, and responsive */}
        <section id="features" className="py-24 px-6 border-t border-slate-100 bg-slate-50/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-10">
              {[
                { 
                  title: "Student Terminal", 
                  desc: "Automated result tracking, attendance sync, and personalized learning paths.",
                  icon: GraduationCap 
                },
                { 
                  title: "Institutional Security", 
                  desc: "Role-based access control with location-verified attendance protocols.",
                  icon: Shield 
                },
                { 
                  title: "Dynamic Resource Sync", 
                  desc: "Real-time access to course materials, assignments, and schedule updates.",
                  icon: Zap 
                }
              ].map((f, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-slate-100 text-center">
        <p className="text-sm font-bold text-slate-400">© 2026 Wish2Skill Institute. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
