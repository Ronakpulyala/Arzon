import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  Clock,
  CalendarDays,
  Wallet,
  TrendingUp,
  Users,
  FileBarChart
} from "lucide-react";

export type NavBadgeKey = "pendingLeaves" | "pendingPayments";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Array<"ADMIN" | "HR" | "EMPLOYEE">;
  /** Key into the badges map passed to the sidebar — shows a live count pill when > 0. */
  badgeKey?: NavBadgeKey;
};

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
    roles: ["ADMIN", "HR", "EMPLOYEE"]
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: Clock,
    roles: ["ADMIN", "HR", "EMPLOYEE"]
  },
  {
    label: "Leaves",
    href: "/leaves",
    icon: CalendarDays,
    roles: ["ADMIN", "HR", "EMPLOYEE"],
    badgeKey: "pendingLeaves"
  },
  {
    label: "Salary",
    href: "/salary",
    icon: Wallet,
    roles: ["ADMIN", "HR", "EMPLOYEE"]
  },
  {
    label: "Sales Reports",
    href: "/sales-reports",
    icon: TrendingUp,
    roles: ["ADMIN", "HR", "EMPLOYEE"],
    badgeKey: "pendingPayments"
  },
  {
    label: "Employees",
    href: "/employees",
    icon: Users,
    roles: ["ADMIN"]
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileBarChart,
    roles: ["ADMIN", "HR"]
  }
];
