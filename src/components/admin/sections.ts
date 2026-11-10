import {
  BarChart3,
  BookOpen,
  CreditCard,
  Gift,
  LayoutDashboard,
  Settings,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminSection = {
  /** "" is the overview at /admin. */
  slug: string;
  label: string;
  icon: LucideIcon;
  /** What the section will do, shown on its Coming Soon page. */
  description: string;
  ready: boolean;
};

/** The admin menu. Sections are switched on here as each one is built (Step 12B onwards). */
export const adminSections: AdminSection[] = [
  { slug: "", label: "Overview", icon: LayoutDashboard, description: "A summary of the whole platform.", ready: true },
  { slug: "users", label: "Users", icon: Users, description: "Manage students, instructors and administrators.", ready: true },
  { slug: "courses", label: "Courses", icon: BookOpen, description: "Review, approve and manage courses.", ready: true },
  { slug: "enrolments", label: "Enrolments", icon: UserCheck, description: "See and manage course enrolments.", ready: true },
  { slug: "payments", label: "Payments", icon: CreditCard, description: "Check payments, refunds and purchase records.", ready: true },
  { slug: "affiliates", label: "Affiliates & Referrals", icon: Gift, description: "Review affiliates, commissions and referral rewards.", ready: true },
  { slug: "reports", label: "Reports & Analytics", icon: BarChart3, description: "Simple reports on learning and sales.", ready: true },
  { slug: "settings", label: "Settings", icon: Settings, description: "Platform-wide settings.", ready: false },
];

export function adminHref(section: AdminSection): string {
  return section.slug ? `/admin/${section.slug}` : "/admin";
}

/** The section for a path such as "/admin/users". */
export function sectionForPath(pathname: string): AdminSection {
  const slug = pathname.replace(/^\/admin\/?/, "").split("/")[0];
  return adminSections.find((section) => section.slug === slug) ?? adminSections[0];
}
