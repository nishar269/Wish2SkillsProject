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
  Users,
  CalendarClock,
  Waypoints,
  ShieldEllipsis,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent font-sans text-slate-900">
      <nav className="fixed top-0 z-50 flex h-22 w-full items-center justify-between border-b border-white/40 bg-[#faf5ed]/84 px-6 backdrop-blur-xl md:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#d5b482,#b78c46)] text-[#131b2c] shadow-[0_12px_30px_rgba(183,140,70,0.3)]">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="premium-title text-[1.65rem] leading-none text-[#151d2d]">Wish2Skill</p>
            <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9d7b43]">CampusOS</p>
          </div>
        </div>

        <div className="hidden items-center gap-8 text-sm font-semibold text-[#655742] md:flex">
          <Link href="#ai" className="transition-colors hover:text-[#151d2d]">
            Campus Scout AI
          </Link>
          <Link href="#features" className="transition-colors hover:text-[#151d2d]">
            Platform Modules
          </Link>
          <Link href="#security" className="transition-colors hover:text-[#151d2d]">
            Security Core
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="hidden text-sm font-semibold text-[#5f523d] hover:text-[#151d2d] md:flex">
            <Link href="/login">Portal Login</Link>
          </Button>
          <Button asChild size="lg" className="px-6">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </nav>

      <main className="flex w-full flex-col items-center">
        <section className="relative w-full overflow-hidden px-6 pb-20 pt-36 md:px-10 md:pb-28 md:pt-40">
          <div className="absolute inset-x-0 top-0 h-[78%] bg-[radial-gradient(circle_at_top_left,rgba(214,182,123,0.34),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_26%),radial-gradient(circle_at_center_top,rgba(74,140,120,0.1),transparent_32%)]" />
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
            <div className="space-y-8">
              <div className="premium-kicker border-[#d6c5aa] bg-white/70 text-[#9d7b43]">
                <Sparkles className="h-3.5 w-3.5 text-[#b78c46]" />
                Premium Academic Command Layer
              </div>

              <div className="space-y-5">
                <h1 className="premium-title max-w-4xl text-6xl leading-[0.94] text-[#141c2d] md:text-7xl xl:text-[5.8rem]">
                  An institute operating system that looks as expensive as it feels.
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-[#5f523d] md:text-xl">
                  Wish2Skill CampusOS brings admissions, scheduling, geo-attendance, analytics, community and AI assistance into one refined environment designed for institutions that care about trust, clarity and presence.
                </p>
              </div>

              <div className="flex flex-col items-start gap-4 sm:flex-row">
                <Button size="lg" className="min-w-52" asChild>
                  <Link href="/login">
                    Enter Campus Portal
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="min-w-48" asChild>
                  <Link href="#features">Explore the System</Link>
                </Button>
              </div>

              <div className="grid gap-4 pt-3 sm:grid-cols-3">
                {[
                  { value: "6", label: "governed roles" },
                  { value: "GPS", label: "verified attendance" },
                  { value: "AI", label: "role-aware assistance" },
                ].map((stat) => (
                  <div key={stat.label} className="premium-panel px-5 py-4">
                    <div className="premium-title text-3xl text-[#141c2d]">{stat.value}</div>
                    <div className="pt-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#92754a]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="premium-dark-panel premium-grid relative overflow-hidden px-6 py-7 md:px-8 md:py-8">
              <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-[#d7b67b]/24 blur-3xl" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e0c38e]">
                      Executive Snapshot
                    </div>
                    <div className="premium-title pt-2 text-4xl text-white">Live Institute Pulse</div>
                  </div>
                  <div className="rounded-full border border-white/14 bg-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f0e2c7]">
                    secure sync
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      icon: CalendarClock,
                      title: "Schedule Control",
                      desc: "Timetables, faculty mapping and change notifications with one workflow.",
                    },
                    {
                      icon: Waypoints,
                      title: "Geo Attendance",
                      desc: "Verify presence with location-aware flows and batch-level visibility.",
                    },
                    {
                      icon: ShieldEllipsis,
                      title: "Audit-Ready",
                      desc: "Administrative actions can be traced and reviewed without confusion.",
                    },
                    {
                      icon: Bot,
                      title: "Campus Scout AI",
                      desc: "Role-aware guidance embedded directly inside the workspace.",
                    },
                  ].map((feature) => (
                    <div key={feature.title} className="rounded-[22px] border border-white/12 bg-white/10 p-5">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/14 text-[#f3d9a8]">
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <div className="text-base font-semibold text-white">{feature.title}</div>
                      <p className="pt-2 text-sm leading-relaxed text-[#d6c5aa]">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full px-6 py-24 md:px-10">
          <div className="mx-auto max-w-7xl space-y-14">
            <div className="text-center">
              <div className="premium-kicker border-[#d6c5aa] bg-white/65 text-[#9d7b43]">System Modules</div>
              <h2 className="premium-title pt-5 text-5xl text-[#141c2d] md:text-6xl">
                Built for institutions with standards.
              </h2>
              <p className="mx-auto max-w-3xl pt-4 text-lg leading-relaxed text-[#655742]">
                Every module is designed to feel structured, calm and authoritative. The product should read like a premium control room, not a generic admin panel.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div id="ai" className="premium-panel p-10">
                <div className="mb-8 flex h-15 w-15 items-center justify-center rounded-[22px] bg-[#172033] text-[#e0bf8a] shadow-[0_18px_40px_rgba(20,28,45,0.18)]">
                  <Bot className="h-7 w-7" />
                </div>
                <h3 className="premium-title text-4xl text-[#141c2d]">Campus Scout AI</h3>
                <p className="pt-4 text-base leading-relaxed text-[#655742]">
                  Ask operational, academic and navigation questions in plain language. The assistant understands user role, context and the structure of the platform.
                </p>
                <div className="mt-8 rounded-[22px] border border-[#e0d5c4] bg-[#faf5ed] px-5 py-4 text-sm font-medium text-[#7a6240]">
                  Summaries, guidance and contextual support inside the same workflow.
                </div>
              </div>

              <div id="security" className="premium-dark-panel p-10">
                <div className="mb-8 flex h-15 w-15 items-center justify-center rounded-[22px] bg-white/10 text-[#e0bf8a]">
                  <MapPin className="h-7 w-7" />
                </div>
                <h3 className="premium-title text-4xl text-white">Geo-Fenced Attendance</h3>
                <p className="pt-4 text-base leading-relaxed text-[#d8ccb7]">
                  Presence is verified through browser location and distance validation so attendance feels trustworthy, not symbolic.
                </p>
                <div className="mt-8 flex items-center gap-3 text-sm font-medium text-[#f0d6a5]">
                  <ShieldCheck className="h-4 w-4" />
                  Institution-grade location validation
                </div>
              </div>

              <div className="premium-panel p-10 lg:col-span-2">
                <div className="mb-8 flex items-center gap-5">
                  <div className="flex h-15 w-15 items-center justify-center rounded-[22px] bg-[#efe2cd] text-[#8f6c35]">
                    <LayoutDashboard className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="premium-title text-4xl text-[#141c2d]">Role-calibrated control planes</h3>
                    <p className="pt-2 text-base text-[#655742]">
                      Every dashboard is tuned for the person using it, not just filtered by access.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  {[
                    {
                      role: "Authority",
                      desc: "Institution metrics, strategic visibility and high-level trends.",
                      icon: Building2,
                    },
                    {
                      role: "Administrator",
                      desc: "User orchestration, scheduling and academic structure.",
                      icon: Users,
                    },
                    {
                      role: "Faculty",
                      desc: "Assignments, classes, tests and day-to-day learning operations.",
                      icon: BookOpenCheck,
                    },
                    {
                      role: "Coordinator",
                      desc: "Batch health, interventions and operational continuity.",
                      icon: ShieldCheck,
                    },
                  ].map((role) => (
                    <div key={role.role} className="rounded-[22px] border border-[#e2d7c8] bg-white/70 p-5">
                      <role.icon className="mb-4 h-5 w-5 text-[#a27a3d]" />
                      <div className="text-base font-semibold text-[#141c2d]">{role.role}</div>
                      <p className="pt-2 text-sm leading-relaxed text-[#6a5a43]">{role.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full px-6 pb-24 md:px-10">
          <div className="premium-dark-panel mx-auto max-w-7xl px-8 py-14 text-center md:px-14">
            <h2 className="premium-title text-5xl text-white md:text-6xl">
              Ready to show the institution a better standard?
            </h2>
            <p className="mx-auto max-w-3xl pt-5 text-lg leading-relaxed text-[#d8ccb7]">
              Use the live portal to experience the platform from the viewpoint of administrators, faculty, students and coordinators.
            </p>
            <div className="pt-8">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/login">
                  Launch Interactive Demo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e2d7c8] bg-[#efe8dc]/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row md:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#d5b482,#b78c46)] text-[#141c2d]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="premium-title text-2xl leading-none text-[#141c2d]">Wish2Skill</div>
              <div className="pt-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8f6c35]">
                CampusOS
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm font-medium text-[#6a5a43]">
            <Link href="/login" className="transition-colors hover:text-[#141c2d]">
              Admin Portal
            </Link>
            <Link href="/login" className="transition-colors hover:text-[#141c2d]">
              Student Portal
            </Link>
          </div>

          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#92754a]">
            (c) {new Date().getFullYear()} Wish2Skill CampusOS
          </div>
        </div>
      </footer>
    </div>
  );
}
