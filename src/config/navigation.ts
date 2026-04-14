import { Role } from "@/lib/permissions";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  BarChart3,
  Bell,
  MessageSquare,
  Settings,
  FolderOpen,
  UserCheck,
  AlertTriangle,
  Database,
  Download,
  Archive,
  Star,
  Building,
  Briefcase,
  Banknote,
  Home,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SidebarNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  items?: SidebarNavItem[];
};

export type SidebarNavConfig = {
  mainNav: SidebarNavItem[];
  label: string;
};

export function getNavConfig(role: Role): SidebarNavConfig {
  switch (role) {
    case "STUDENT":
      return {
        label: "Student",
        mainNav: [
          { title: "Home", href: "/student", icon: Home },
          { title: "Attendance", href: "/student/attendance", icon: ClipboardCheck },
          { title: "Timetable", href: "/student/timetable", icon: Calendar },
          { title: "Materials", href: "/student/resources", icon: FolderOpen },
          { title: "Jobs", href: "/student/jobs", icon: Briefcase },
          { title: "Tests", href: "/student/tests", icon: FileText },
          { title: "Assignments", href: "/student/assignments", icon: FileText },
          { title: "Performance", href: "/student/performance", icon: BarChart3 },
          { title: "Notifications", href: "/student/notifications", icon: Bell },
          { title: "Community", href: "/community", icon: MessageSquare },
          { title: "Profile", href: "/student/profile", icon: UserCheck },
        ],
      };

    case "FACULTY":
      return {
        label: "Faculty",
        mainNav: [
          { title: "Home", href: "/faculty", icon: Home },
          { title: "My Classes", href: "/faculty/classes", icon: Calendar },
          { title: "Attendance", href: "/faculty/attendance", icon: ClipboardCheck },
          { title: "Materials", href: "/faculty/resources", icon: FolderOpen },
          { title: "Tests", href: "/faculty/tests", icon: FileText },
          { title: "Assignments", href: "/faculty/assignments", icon: FileText },
          { title: "Students", href: "/faculty/students", icon: Users },
          { title: "Community", href: "/community", icon: MessageSquare },
        ],
      };

    case "COORDINATOR":
      return {
        label: "Coordinator",
        mainNav: [
          { title: "Home", href: "/coordinator", icon: Home },
          { title: "Batches", href: "/coordinator/batches", icon: GraduationCap },
          { title: "Career", href: "/admin/career", icon: Briefcase },
          { title: "Attendance", href: "/coordinator/attendance", icon: ClipboardCheck },
          { title: "Weak Students", href: "/coordinator/students", icon: AlertTriangle },
          { title: "Schedule", href: "/coordinator/schedule", icon: Calendar },
          { title: "Notifications", href: "/coordinator/notifications", icon: Bell },
          { title: "Community", href: "/community", icon: MessageSquare },
        ],
      };

    case "ADMIN":
      return {
        label: "Admin",
        mainNav: [
          { title: "Home", href: "/admin", icon: Home },
          { title: "Students", href: "/admin/students", icon: Users },
          { title: "Faculty", href: "/admin/faculty", icon: GraduationCap },
          { title: "Courses", href: "/admin/courses", icon: BookOpen },
          { title: "Career", href: "/admin/career", icon: Briefcase },
          { title: "Subjects", href: "/admin/subjects", icon: FileText },
          { title: "Batches", href: "/admin/batches", icon: Database },
          { title: "Schedule", href: "/admin/schedule", icon: Calendar },
          { title: "Reports", href: "/admin/reports", icon: BarChart3 },
          { title: "Notifications", href: "/admin/notifications", icon: Bell },
          { title: "Community", href: "/community", icon: MessageSquare },
          { title: "Finances", href: "/admin/fees", icon: Banknote },
          { title: "Settings", href: "/admin/settings", icon: Settings },
        ],
      };

    case "AUTHORITY":
      return {
        label: "Authority",
        mainNav: [
          { title: "Home", href: "/authority", icon: Home },
          { title: "Feedback Insights", href: "/authority/feedback", icon: Star },
          { title: "Analytics", href: "/authority/analytics", icon: BarChart3 },
          { title: "Institute Overview", href: "/authority/overview", icon: Building },
        ],
      };

    case "RECORDS":
      return {
        label: "Records",
        mainNav: [
          { title: "Home", href: "/records", icon: Home },
          { title: "Export Data", href: "/records/export", icon: Download },
          { title: "Reports", href: "/records/reports", icon: BarChart3 },
          { title: "Archives", href: "/records/archives", icon: Archive },
        ],
      };

    default:
      return {
        label: "Dashboard",
        mainNav: [
          { title: "Overview", href: "/student", icon: LayoutDashboard },
        ],
      };
  }
}

export function getRoleDashboardPath(role: Role): string {
  const paths: Record<Role, string> = {
    STUDENT: "/student",
    FACULTY: "/faculty",
    COORDINATOR: "/coordinator",
    ADMIN: "/admin",
    AUTHORITY: "/authority",
    RECORDS: "/records",
  };
  return paths[role] || "/student";
}
