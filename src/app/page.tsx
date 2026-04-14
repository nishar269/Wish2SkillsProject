import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Shield, Zap, Layout } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center">
      {/* 1. Header */}
      <nav className="w-full h-20 border-b border-slate-100 flex items-center px-6 md:px-12 justify-between sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">Wish2Skill</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-400">
          <Link href="#features" className="hover:text-blue-600">Platform</Link>
          <Link href="#intel" className="hover:text-blue-600">Resources</Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="text-sm font-bold text-slate-500">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* 2. Centered Hero Section */}
      <main className="w-full flex flex-col items-center">
        <section className="pt-32 pb-24 px-6 max-w-4xl w-full text-center flex flex-col items-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-widest leading-none">
            <Zap className="h-3 w-3 fill-blue-600" />
            Institutional Management Protocol
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
            Education Made <br />
            <span className="text-blue-600">Beautifully Simple.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
            Join 2000+ students on the most reliable institute management platform. 
            Unified operations, secure attendance, and real-time result synchronization.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
            <Button size="lg" className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-bold shadow-xl shadow-blue-100 group" asChild>
              <Link href="/login">
                Initiate Session
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 border-slate-200 text-slate-500 rounded-2xl text-lg font-bold hover:bg-slate-50" asChild>
              <Link href="/login">Learn More</Link>
            </Button>
          </div>
        </section>

        {/* 3. Features Section */}
        <section id="features" className="w-full py-24 px-6 bg-slate-50/50 border-t border-slate-100 flex justify-center">
          <div className="max-w-7xl w-full grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "Unified Hub", 
                desc: "Every student resource, from schedules to results, in one center-aligned terminal.",
                icon: Layout 
              },
              { 
                title: "Strict Security", 
                desc: "Location-verified protocols ensuring total institutional integrity and safety.",
                icon: Shield 
              },
              { 
                title: "Smart Sync", 
                desc: "Instant synchronization between faculty data and student dashboards.",
                icon: Zap 
              }
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 4. Footer */}
      <footer className="w-full py-12 border-t border-slate-100 flex justify-center">
         <div className="max-w-7xl w-full text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
            © 2026 Wish2Skill Institute Terminal
         </div>
      </footer>
    </div>
  );
}
