import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, CheckCircle2, Users, BookOpen, Star, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 nav-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Wish2Skill</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Courses</Link>
            <Link href="#about" className="hover:text-blue-600 transition-colors">About Us</Link>
            <Link href="#contact" className="hover:text-blue-600 transition-colors">Contact</Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-sm font-medium">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Empowering 2000+ Students Daily
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-[1.1]">
              The Smarter Way to <br/>
              <span className="text-blue-600">Master Your Future</span>
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
              Wish2Skill CampusOS is a simple, all-in-one platform designed for modern students and institutions. Manage your courses, track your progress, and build your career.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200" asChild>
                <Link href="/login">
                  Start Learning Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <div className="flex items-center gap-4 px-4 py-2">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-500">Joined by 2k+ peers</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
              {[
                { label: "Placement Rate", val: "94%" },
                { label: "Expert Mentors", val: "50+" },
                { label: "Live Courses", val: "12" },
              ].map((s, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-2xl font-bold text-slate-900">{s.val}</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative lg:block hidden">
             <div className="absolute -inset-4 bg-blue-100/50 rounded-[2rem] blur-3xl -z-10" />
             <div className="rounded-[2rem] border border-slate-200 overflow-hidden shadow-2xl bg-white p-4">
                <div className="aspect-[4/3] rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                   {/* Clean hero graphic placeholder */}
                   <div className="flex flex-col items-center gap-4 text-slate-300">
                      <BookOpen className="h-20 w-20" />
                      <p className="text-sm font-medium">Interactive Learning Environment</p>
                   </div>
                </div>
             </div>
             
             {/* Floating Info Cards */}
             <div className="absolute -bottom-6 -left-6 pleasant-card p-4 flex items-center gap-4 max-w-[200px] animate-bounce-slow">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                   <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Attendance Sync</p>
                  <p className="text-[10px] text-slate-500">Verified Location</p>
                </div>
             </div>

             <div className="absolute -top-4 -right-4 pleasant-card p-4 flex items-center gap-4 max-w-[200px]">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                   <Star className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Top Rated</p>
                  <p className="text-[10px] text-slate-500">4.9/5 Student Rating</p>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to succeed</h2>
            <p className="text-slate-600">Powerful features disguised in a simple interface, designed to help you focus on what matters: learning.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Student Dashboard",
                desc: "A dedicated space for students to view schedules, check results, and track their growth journey.",
                color: "bg-blue-50 text-blue-600"
              },
              {
                icon: BookOpen,
                title: "Learning Assets",
                desc: "Instant access to course materials, assignments, and recorded sessions in one organized library.",
                color: "bg-indigo-50 text-indigo-600"
              },
              {
                icon: ShieldCheck,
                title: "Secure Verification",
                desc: "Biometric and location-based security protocols ensuring institutional academic integrity.",
                color: "bg-emerald-50 text-emerald-600"
              }
            ].map((f, i) => (
              <div key={i} className="pleasant-card p-8 space-y-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900">{f.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Wish2Skill</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Wish2Skill Institute. All rights reserved.</p>
          <div className="flex gap-6 text-slate-400 text-sm">
            <a href="#" className="hover:text-blue-600">Privacy</a>
            <a href="#" className="hover:text-blue-600">Terms</a>
            <a href="#" className="hover:text-blue-600">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
