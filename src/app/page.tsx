import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Standard Header */}
      <nav className="h-20 border-b border-gray-100 flex items-center px-8 justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl text-gray-900">Wish2Skill</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600">Sign In</Link>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* 2. Standard Hero Section */}
      <main className="max-w-4xl mx-auto pt-32 pb-20 px-8 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Modern Education <br />
          <span className="text-blue-600 text-6xl">Simplified for Everyone</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
          The all-in-one institute management platform. Simple, pleasant, and built to help students succeed. Manage your courses and track your progress in one place.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
          <Button size="lg" className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-bold" asChild>
            <Link href="/login">
              Explore Platform
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* 3. Simple Feature List (No fancy cards) */}
        <div className="grid md:grid-cols-3 gap-12 text-left pt-20 border-t border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Student Node</h3>
            <p className="text-gray-600 text-sm">Personalized dashboards for students to track attendance and see results instantly.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Academic Hub</h3>
            <p className="text-gray-600 text-sm">Access to course materials, assignments, and schedules with a single click.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Management</h3>
            <p className="text-gray-600 text-sm">Automated institute operations for faculty and administrators without the complexity.</p>
          </div>
        </div>
      </main>

      {/* 4. Simple Footer */}
      <footer className="py-12 border-t border-gray-100 text-center text-gray-400 text-xs">
         <p>© 2026 Wish2Skill Institute. Designed for Clarity.</p>
      </footer>
    </div>
  );
}
