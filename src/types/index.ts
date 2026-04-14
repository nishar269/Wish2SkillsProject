import { Role } from "@/lib/permissions";

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    name: string;
    email: string;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      name: string;
      email: string;
      image?: string | null;
    };
  }
}



// API Response types
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Dashboard stat card
export type StatCard = {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: string;
};

// Navigation items
export type NavItem = {
  title: string;
  href: string;
  icon: string;
  badge?: string | number;
  children?: NavItem[];
};

// Role-based navigation config
export type RoleNavConfig = Record<Role, NavItem[]>;
