"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  LayoutDashboard,
  Search,
  Users,
  Star,
  LayoutGrid,
  ScanSearch,
  FileText,
  Coins,
  User,
  MessageSquareQuote,
  LogOut,
  PlusCircle,
  Briefcase,
  Mail,
  Trophy,
  MessageSquare,
  Wallet,
  Bell,
  ChevronLeft,
  ChevronRight,
  X,
  Settings,
  Shield,
  UserCog,
  Database,
  BarChart2,
  FlagTriangleRight,
  Bookmark,
} from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

// ── Nav configs per role ──────────────────────────────────────────────────
const NAV_CONFIG: Record<string, NavSection[]> = {
  "Job Seeker": [
    {
      label: "Discover",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/" },
        { icon: Search, label: "Jobs", href: "/jobs" },
        { icon: MessageSquare, label: "Communities", href: "/communities" },
      ],
    },
    {
      label: "My Space",
      items: [
        { icon: LayoutGrid, label: "My Applications", href: "/applications" },
        { icon: Bookmark, label: "Saved Jobs", href: "/jobs/saved" },
        { icon: ScanSearch, label: "ATS Checker", href: "/ats-score", badge: "Free" },
        { icon: FileText, label: "Resume Builder", href: "/resume-builder", badge: "Free" },
        { icon: Coins, label: "Credits", href: "/jobseeker/credits" },
      ],
    },
    {
      label: "Account",
      items: [
        { icon: User, label: "Profile", href: "/profile" },
        { icon: MessageSquareQuote, label: "Feedback", href: "/feedback" },
      ],
    },
  ],
  Recruiter: [
    {
      label: "Hiring",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/" },
        { icon: PlusCircle, label: "Post a Job", href: "/jobs/post" },
        { icon: Briefcase, label: "My Postings", href: "/company/jobs" },
      ],
    },
    {
      label: "Account",
      items: [
        { icon: User, label: "Profile", href: "/profile" },
        { icon: MessageSquareQuote, label: "Feedback", href: "/feedback" },
      ],
    },
  ],
  Admin: [
    {
      label: "Admin Panel",
      items: [
        { icon: LayoutDashboard, label: "Overview", href: "/admin/dashboard" },
        { icon: Coins, label: "Revenue Dashboard", href: "/admin/revenue" },
        { icon: Mail, label: "Candidate CRM & AI Emails", href: "/admin/crm" },
        { icon: Users, label: "User Accounts", href: "/admin/users" },
        { icon: UserCog, label: "Deleted Accounts", href: "/admin/deleted-users" },
        { icon: MessageSquareQuote, label: "Feedback Center", href: "/admin/feedback" },
        { icon: MessageSquare, label: "Communities Admin", href: "/communities/admin" },
      ],
    },
    {
      label: "Operations Log",
      items: [
        { icon: Briefcase, label: "Jobs Moderation", href: "/admin/jobs" },
        { icon: FlagTriangleRight, label: "Refund Disputes", href: "/admin/disputes" },
      ],
    },
    {
      label: "System Settings",
      items: [
        { icon: Coins, label: "Pricing Plans", href: "/admin/plans" },
        { icon: UserCog, label: "Locations Registry", href: "/admin/locations" },
        { icon: Database, label: "Skills Catalog", href: "/admin/skills" },
        { icon: PlusCircle, label: "Coupon Codes", href: "/admin/coupons" },
        { icon: LayoutGrid, label: "Employment Types", href: "/admin/employment-types" },
        { icon: BarChart2, label: "Experience Levels", href: "/admin/experience-levels" },
        { icon: Settings, label: "Workplace Settings", href: "/admin/workplace-types" },
      ],
    },
  ],
};


type NavItem = {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
  exact?: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

// ── Sidebar Inner Content ─────────────────────────────────────────────────
function SidebarContent({
  collapsed,
  onClose,
}: {
  collapsed: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const role = user?.role || "Job Seeker";
  let sections = NAV_CONFIG[role];
  if (!sections && (role === "Admin" || role === "Super Admin" || role.toLowerCase() === "admin" || role.toLowerCase() === "super admin" || role.toLowerCase().includes("admin"))) {
    sections = NAV_CONFIG["Admin"];
  }
  if (!sections) {
    sections = NAV_CONFIG["Job Seeker"];
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    // Handle query params
    const [path] = href.split("?");
    return pathname === path || pathname.startsWith(path + "/");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex flex-col h-full select-none">
      {/* Logo */}
      <div className={cn("flex items-center px-4 h-[65px] border-b border-slate-800/70 shrink-0", collapsed ? "justify-center" : "gap-3")}>
        <Link href="/" className="flex items-center gap-2.5 group" onClick={onClose}>
          
          {!collapsed && (
            <span className="text-lg font-extrabold text-white tracking-tight">
              Jobs<span className="text-indigo-400">Dart</span>
            </span>
          )}
        </Link>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-5 mt-2 no-scrollbar">
        {sections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.12em] px-3 mb-1.5">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center rounded-xl transition-all duration-150 group relative",
                        collapsed ? "justify-center p-2.5 mx-1" : "gap-3 px-3 py-2.5",
                        active
                          ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
                      )}
                    >
                      {/* Left accent bar */}
                      {active && !collapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-500 rounded-full" />
                      )}
                      <Icon className={cn("shrink-0 transition-colors", collapsed ? "w-5 h-5" : "w-4 h-4", active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
                      {!collapsed && (
                        <>
                          <span className="text-sm font-semibold leading-none">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-[9px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}

                      {/* Tooltip for collapsed mode */}
                      {collapsed && (
                        <div className="absolute left-full ml-3 z-50 hidden group-hover:flex items-center whitespace-nowrap bg-slate-800 text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-slate-700">
                          {item.label}
                          {item.badge && (
                            <span className="ml-1.5 text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">{item.badge}</span>
                          )}
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="shrink-0 border-t border-slate-800/70 p-2">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "w-full flex items-center rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150 group border border-transparent hover:border-rose-500/20",
            collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0 transition-colors group-hover:text-rose-400" />
          {!collapsed && <span className="text-sm font-semibold">Logout</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 z-50 hidden group-hover:flex items-center whitespace-nowrap bg-slate-800 text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-slate-700">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Exported DashboardSidebar ─────────────────────────────────────────
interface DashboardSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function DashboardSidebar({ mobileOpen, onMobileClose, collapsed, onToggleCollapse }: DashboardSidebarProps) {
  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-40",
          "bg-black",
          "border-r border-slate-800/60",
          "transition-all duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        <SidebarContent collapsed={collapsed} />

        {/* Collapse toggle button */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3.5 top-[74px] w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:border-indigo-500/50 hover:bg-slate-700 transition-all shadow-lg z-50"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-900/70 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />
            {/* Mobile Panel */}
            <motion.aside
              key="mobile-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 40 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-64 bg-black border-r border-slate-800/60 lg:hidden shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={onMobileClose}
                className="absolute right-3 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/80 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-all z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent collapsed={false} onClose={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
