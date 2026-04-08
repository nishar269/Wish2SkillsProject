import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, ShieldCheck, Sparkles, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Wish2Skill</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link href="#features" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Features</Link>
            <Link href="#courses" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Courses</Link>
            <Link href="#about" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">About Us</Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-md shadow-cyan-500/20 text-white">
              <Link href="/login">Explore Platform</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-16">
        <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950">
          {/* Background decoration */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 text-sm font-medium mb-8 border border-cyan-200 dark:border-cyan-800/50">
                <Sparkles className="h-4 w-4" />
                <span>Next Generation Education Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                Empowering the future of <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                  learning and teaching
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl leading-relaxed">
                A highly secure, role-based, AI-powered institute management platform built for modern educational ecosystems. Join us to experience seamless academic operations.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-xl shadow-cyan-500/25 transition-all hover:scale-105" asChild>
                  <Link href="/login">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base border-2 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all" asChild>
                  <Link href="#features">Explore Features</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div id="features" className="py-24 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything an institute needs</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Comprehensive tools to manage attendance, track performance, and unify communication for students, faculty, and admins.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: ShieldCheck,
                  title: "Role-Based Security",
                  desc: "Granular access control tailored for Admins, Faculty, Students, Coordinators, and Records Managers.",
                  color: "text-blue-500",
                  bg: "bg-blue-500/10"
                },
                {
                  icon: Sparkles,
                  title: "AI-Powered Assistance",
                  desc: "Leverage Google Gemini AI for instant support, queries, and predictive student success analytics.",
                  color: "text-cyan-500",
                  bg: "bg-cyan-500/10"
                },
                {
                  icon: BookOpen,
                  title: "Unified Academics",
                  desc: "One place to manage schedules, attendance, assignments, and grades without switching tools.",
                  color: "text-indigo-500",
                  bg: "bg-indigo-500/10"
                }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group">
                  <div className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-80">
            <GraduationCap className="h-5 w-5" />
            <span className="font-semibold">Wish2Skill CampusOS</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Wish2Skill. built for excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}
