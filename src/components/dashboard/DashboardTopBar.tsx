"use client";

import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Bell, Search, Zap, ArrowLeft, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/contexts/user-context";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-jobs";
import { ShareButton } from "@/components/share-button";
import { SaveJobButton } from "@/components/save-job-button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { JobFilters } from "@/components/job-filters";
import { NAV_CONFIG } from "./DashboardSidebar";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/jobs": "Jobs",
  "/jobs/saved": "Saved Jobs",
  "/communities": "Communities",
  "/communities/admin": "Communities Admin",
  "/blog": "Blogs",
  "/applications": "My Applications",
  "/ats-score": "ATS Checker",
  "/resume-builder": "Resume Builder",
  "/jobseeker/credits": "Refer & Earn",
  "/profile": "Profile",
  "/feedback": "Feedback",
  "/settings": "Settings",
  "/settings/support": "Support",
  "/settings/password": "Change Password",
  "/about": "About",

  "/messages": "Messages",
  "/earnings": "Earnings",
  "/jobs/post": "Post a Job",
  "/company/jobs": "My Postings",
  "/notifications": "Notifications",
  "/admin/users": "User Accounts",
  "/admin/deleted-users": "Deleted Accounts",
  "/admin/jobs": "Jobs Moderation",
  "/admin/analytics": "Analytics",
  "/admin/moderation": "Moderation",
  "/admin/dashboard": "Overview",
  "/admin/revenue": "Revenue Dashboard",
  "/admin/crm": "Candidate CRM & AI Emails",
  "/admin/feedback": "Feedback Center",
  "/admin/locations": "Locations Registry",
  "/admin/skills": "Skills Catalog",
  "/admin/coupons": "Coupon Codes",
  "/admin/domains": "Allowed Domains Configuration",
  "/admin/employment-types": "Employment Types",
  "/admin/experience-levels": "Experience Levels",
  "/admin/workplace-types": "Workplace Settings",
  "/admin/plans": "Pricing Plans",
};

function getPageTitle(pathname: string, role?: string): string {
  // 1. Exact match against the current user role's sidebar items
  const targetRole = role || "Job Seeker";
  let sections = NAV_CONFIG[targetRole];
  if (!sections && targetRole.toLowerCase().includes("admin")) {
    sections = NAV_CONFIG["Admin"];
  }
  if (!sections && (targetRole.toLowerCase().includes("recruiter") || targetRole.toLowerCase().includes("company"))) {
    sections = NAV_CONFIG["Recruiter"];
  }
  if (!sections) {
    sections = NAV_CONFIG["Job Seeker"];
  }

  if (sections) {
    for (const section of sections) {
      for (const item of section.items) {
        if (item.subItems) {
          for (const sub of item.subItems) {
            const [subPath] = sub.href.split("?");
            if (pathname === subPath || pathname === sub.href) {
              return sub.label;
            }
          }
        }
        const [itemPath] = item.href.split("?");
        if (pathname === itemPath || pathname === item.href) {
          return item.label;
        }
      }
    }
  }

  // 2. Sub-route prefix checks
  if (pathname === "/jobs") return "Jobs";
  if (pathname.startsWith("/jobs?isReferral=true")) return "Referral Jobs";
  if (pathname.startsWith("/jobs?view=recommended")) return "Recommended Jobs";
  if (pathname.startsWith("/jobs/")) return "Job Details";
  if (pathname.startsWith("/applications/")) return "Application Details";
  if (pathname.startsWith("/blog/")) return "Blog Post";
  if (pathname === "/blog") return "Blogs";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/admin")) return "Admin Panel";

  // 3. Fallback to dictionary
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  return "Dashboard";
}

interface DashboardTopBarProps {
  onMenuOpen: () => void;
  sidebarCollapsed: boolean;
}

export function DashboardTopBar({ onMenuOpen, sidebarCollapsed }: DashboardTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const pageTitle = getPageTitle(pathname, user?.role);

  const isJobsPage = pathname === "/jobs";
  const isJobDetailsPage = pathname.startsWith("/jobs/") && pathname !== "/jobs/saved" && pathname !== "/jobs/post" && !pathname.startsWith("/jobs/edit/") && !pathname.startsWith("/jobs/in/") && pathname !== "/jobs/remote";
  const jobSegments = isJobDetailsPage ? pathname.split("?")[0].replace(/^\/jobs\//, '').split('/').filter(Boolean) : [];
  const currentJobId = jobSegments.length > 0 ? jobSegments[jobSegments.length - 1] : null;
  const showBackArrow = isJobDetailsPage;

  const { notifications } = useNotifications(user?.uuid);

  const notificationCount = useMemo(() => {
    if (!notifications || !user) return 0;
    if (!user.notificationLastViewedAt) return notifications.length;
    
    const lastViewedTime = new Date(user.notificationLastViewedAt).getTime();
    return notifications.filter(n => new Date(n.timestamp).getTime() > lastViewedTime).length;
  }, [notifications, user]);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-[65px] flex items-center justify-between px-4 sm:px-6",
        "bg-white/95 backdrop-blur-xl border-b border-slate-200/70 shadow-sm",
        "transition-all duration-300",
        // Offset left to account for sidebar
        sidebarCollapsed ? "lg:left-[68px]" : "lg:left-64",
        "left-0" // Full width on mobile
      )}
    >
      {/* Left: back arrow (on job detail pages in mobile) OR hamburger + page title */}
      <div className="flex items-center gap-3 min-w-0">
        {showBackArrow ? (
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-colors shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight truncate">
              {pageTitle}
            </h1>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onMenuOpen}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-colors shrink-0"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="lg:hidden flex items-center shrink-0">
              <span className="text-base font-extrabold text-slate-900">
                Jobs<span className="text-indigo-600">Dart</span>
              </span>
            </Link>

            {/* Mobile Breadcrumb Separator */}
            <span className="lg:hidden text-slate-300 font-light select-none">/</span>

            {/* Page Title (active option from sidenavbar) */}
            <h1 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight truncate">
              {pageTitle}
            </h1>
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center">
        {isJobsPage && (
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-indigo-100 text-indigo-700 font-bold transition-colors"
                aria-label="Filter Jobs"
                title="Filter Jobs"
              >
                <SlidersHorizontal className="w-4.5 h-4.5 text-indigo-600" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 overflow-y-auto">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="text-lg font-bold text-slate-800">Filter Jobs</SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <JobFilters isSheet={true} />
              </div>
            </SheetContent>
          </Sheet>
        )}
        {isJobDetailsPage && (
          <>
            <SaveJobButton jobUuid={currentJobId || ""} />
            <ShareButton jobId={currentJobId || ""} />
          </>
        )}
        <Link
          href="/notifications"
          className={cn(
            "relative w-9 h-9 items-center justify-center rounded-xl hover:bg-indigo-50 text-slate-500 hover:text-indigo-700 transition-colors",
            (isJobsPage || isJobDetailsPage) ? "hidden lg:flex" : "flex"
          )}
          title="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white" />
          )}
        </Link>
      </div>
    </header>
  );
}