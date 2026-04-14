import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, ShieldCheck, Sparkles, BookOpen, Zap, Globe, Cpu } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-white font-sans selection:bg-cyan-500/30 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/20 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white/5 rounded-2xl border border-white/10 shadow-2xl subtle-glow">
              <GraduationCap className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl italic tracking-tighter uppercase leading-none">Wish2Skill</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 mt-1">CampusOS Node</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Link href="#features" className="hover:text-cyan-400 transition-colors">Architecture</Link>
            <Link href="#intel" className="hover:text-cyan-400 transition-colors">AI Intelligence</Link>
            <Link href="#nodes" className="hover:text-cyan-400 transition-colors">Global Nodes</Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-xl">
              <Link href="/login">Auth Access</Link>
            </Button>
            <Button asChild className="h-11 px-6 bg-white text-slate-950 hover:bg-cyan-400 rounded-xl font-black italic uppercase tracking-widest text-xs transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <Link href="/login">Initiate Session</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative z-10">
        <section className="pt-40 pb-20 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="flex flex-col items-start space-y-10">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Protocol 2.4 Active</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85]">
                Smart Institute<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-indigo-400">
                  Management
                </span>
              </h1>
              
              <p className="text-slate-400 text-lg font-bold italic tracking-wide max-w-xl border-l-2 border-cyan-500/30 pl-8">
                Establish total operational control with next-generation AI institutional intelligence. Designed for the futuristic educational ecosystem.
              </p>
              
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <Button size="lg" className="h-16 px-10 bg-white text-slate-950 hover:bg-cyan-400 rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-[0_0_40px_rgba(6,182,212,0.2)] transition-all group" asChild>
                  <Link href="/login">
                    Deploy Platform
                    <Zap className="ml-3 h-5 w-5 group-hover:scale-125 transition-transform" />
                  </Link>
                </Button>
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900" />
                        </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-[#020617] bg-cyan-500/20 backdrop-blur-md flex items-center justify-center text-[10px] font-black">
                        +2k
                    </div>
                </div>
              </div>
            </div>

            <div className="relative group lg:block hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-[3.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative aspect-square bg-slate-950 rounded-[3.5rem] border border-white/10 overflow-hidden shadow-2xl p-2 bg-grid-white/[0.02]">
                <div className="w-full h-full rounded-[3rem] overflow-hidden relative">
                   <img 
                    src="/modern_ai_campus_hero_1776106757648.png" 
                    alt="CampusOS Visualization" 
                    className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700 scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                  
                  {/* Overlay Data */}
                  <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                      <div className="space-y-4">
                          <div className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl inline-block">
                              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400">Node Location</p>
                              <p className="text-xs font-bold uppercase italic">Global Mainnet</p>
                          </div>
                          <div className="h-1 w-32 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full w-2/3 bg-cyan-500 animate-shimmer" />
                          </div>
                      </div>
                      <div className="p-4 bg-cyan-500 text-slate-950 rounded-2xl rotate-3 shadow-2xl">
                          <Globe className="h-8 w-8" />
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-24 space-y-4">
               <div className="w-12 h-1 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,1)]" />
               <h2 className="text-4xl font-black italic tracking-tighter uppercase">Protocol Architecture</h2>
               <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Engineered for Institutional Supremacy</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  icon: Cpu,
                  title: "Neural Governance",
                  desc: "Advanced RBAC engine managing Admin, Faculty, and Student sub-nodes with 100% security parity.",
                  accent: "border-cyan-500/50"
                },
                {
                  icon: Sparkles,
                  title: "Gemini Intelligence",
                  desc: "Localized AI agents for each role. Automated feedback sentiment and dynamic resource insights.",
                  accent: "border-indigo-500/50"
                },
                {
                  icon: Globe,
                  title: "Geo-Fenced Sync",
                  desc: "Precision location-verified attendance protocol preventing institutional proxy breaches.",
                  accent: "border-purple-500/50"
                }
              ].map((feature, i) => (
                <div key={i} className={`p-10 rounded-[2.5rem] bg-white/[0.02] border-t-2 ${feature.accent} backdrop-blur-sm hover:bg-white/[0.05] transition-all group cursor-pointer relative overflow-hidden`}>
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-2xl">
                    <feature.icon className="h-8 w-8 text-white group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <h3 className="text-xl font-black italic uppercase tracking-tight mb-4">{feature.title}</h3>
                  <p className="text-slate-500 text-sm font-bold leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-6 border-t border-white/5 bg-slate-950/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4">
             <GraduationCap className="h-6 w-6 text-cyan-400" />
             <span className="font-black italic uppercase tracking-tighter text-lg">Wish2Skill</span>
          </div>
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span className="text-cyan-500">Node Status: Operational</span>
              <span>Sync Rate: 99.9%</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">© 2026 Node System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
