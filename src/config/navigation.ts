import { Role } from "@prisma/client";
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
  Eye,
  Star,
  Building,
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
          { title: "Overview", href: "/student", icon: LayoutDashboard },
          { title: "Attendance", href: "/student/attendance", icon: ClipboardCheck },
          { title: "Timetable", href: "/student/timetable", icon: Calendar },
          { title: "Materials", href: "/student/materials", icon: FolderOpen },
          { title: "Tests & Results", href: "/student/tests", icon: FileText },
          { title: "Performance", href: "/student/performance", icon: BarChart3 },
          { title: "Notifications", href: "/student/notifications", icon: Bell },
          { title: "Feedback", href: "/student/feedback", icon: MessageSquare },
          { title: "Profile", href: "/student/profile", icon: UserCheck },
        ],
      };

    case "FACULTY":
      return {
        label: "Faculty",
        mainNav: [
          { title: "Overview", href: "/faculty", icon: LayoutDashboard },
          { title: "My Classes", href: "/faculty/classes", icon: Calendar },
          { title: "Attendance", href: "/faculty/attendance", icon: ClipboardCheck },
          { title: "Materials", href: "/faculty/materials", icon: FolderOpen },
          { title: "Tests", href: "/faculty/tests", icon: FileText },
          { title: "Students", href: "/faculty/students", icon: Users },
          { title: "Notifications", href: "/faculty/notifications", icon: Bell },
        ],
      };

    case "COORDINATOR":
      return {
        label: "Coordinator",
        mainNav: [
          { title: "Overview", href: "/coordinator", icon: LayoutDashboard },
          { title: "Batches", href: "/coordinator/batches", icon: GraduationCap },
          { title: "Attendance", href: "/coordinator/attendance", icon: ClipboardCheck },
          { title: "Weak Students", href: "/coordinator/students", icon: AlertTriangle },
          { title: "Schedule", href: "/coordinator/schedule", icon: Calendar },
          { title: "Notifications", href: "/coordinator/notifications", icon: Bell },
        ],
      };

    case "ADMIN":
      return {
        label: "Admin",
        mainNav: [
          { title: "Overview", href: "/admin", icon: LayoutDashboard },
          { title: "Students", href: "/admin/students", icon: Users },
          { title: "Faculty", href: "/admin/faculty", icon: GraduationCap },
          { title: "Courses", href: "/admin/courses", icon: BookOpen },
          { title: "Subjects", href: "/admin/subjects", icon: FileText },
          { title: "Batches", href: "/admin/batches", icon: Database },
          { title: "Schedule", href: "/admin/schedule", icon: Calendar },
          { title: "Reports", href: "/admin/reports", icon: BarChart3 },
          { title: "Notifications", href: "/admin/notifications", icon: Bell },
          { title: "Settings", href: "/admin/settings", icon: Settings },
        ],
      };

    case "AUTHORITY":
      return {
        label: "Authority",
        mainNav: [
          { title: "Overview", href: "/authority", icon: LayoutDashboard },
          { title: "Feedback Insights", href: "/authority/feedback", icon: Star },
          { title: "Analytics", href: "/authority/analytics", icon: BarChart3 },
          { title: "Institute Overview", href: "/authority/overview", icon: Building },
        ],
      };

    case "RECORDS":
      return {
        label: "Records",
        mainNav: [
          { title: "Overview", href: "/records", icon: LayoutDashboard },
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
