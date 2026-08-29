"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopBar } from "./DashboardTopBar";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { PublicNavbar } from "@/components/home/PublicNavbar";
import { cn } from "@/lib/utils";

// Routes where the OLD public header+footer should show (unauthenticated pages)
const PUBLIC_ROUTES = [
  "/",
  "/jobs",
  "/ats-score",
  "/resume-builder",
  "/login",
  "/signup",
  "/company/login",
  "/company/signup",
  "/terms",
  "/privacy",
  "/refund",
  "/contact",
];

function isPublicRoute(pathname: string): boolean {
  // Exact match on public routes
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  // Job detail pages are public
  if (/^\/jobs\/[^/]+$/.test(pathname)) return true;
  // Auth pages
  if (pathname.startsWith("/verify") || pathname.startsWith("/reset")) return true;
  return false;
}

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { user, loading: userLoading } = useUser();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydration guard
  useEffect(() => {
    setMounted(true);
    // Restore collapsed state from localStorage
    const saved = localStorage.getItem("jd_sidebar_collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  // Save collapse state
  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("jd_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Determine if this should be a dashboard (sidebar) layout
  const isAuthenticated = mounted && !userLoading && !!user;
  
  // Pages that should NEVER show the sidebar dashboard layout (onboarding, checkout, auth)
  const EXCLUDED_ROUTES = [
    "/onboarding",
    "/company/payment",
    "/jobseeker/plans",
    "/login",
    "/signup",
    "/company/login",
    "/company/signup",
  ];

  const isExcluded = EXCLUDED_ROUTES.includes(pathname) || 
                     pathname.startsWith("/verify") || 
                     pathname.startsWith("/reset");

  // Show dashboard shell if user is authenticated AND page is not explicitly excluded
  const showDashboard = isAuthenticated && !isExcluded;


  // During SSR or loading, render loading shell
  if (!mounted || userLoading) {
    if (pathname === "/") {
      return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950">
          <main className="min-h-screen">{children}</main>
        </div>
      );
    }
    return (
      <div className="flex flex-col min-h-screen">
        <div className="h-16 border-b bg-white/80 animate-pulse" />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // ── Dashboard (Sidebar) Layout ──────────────────────────────────────────
  if (showDashboard) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* Sidebar */}
        <DashboardSidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Main area — offset by sidebar width */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300",
            collapsed ? "lg:ml-[68px]" : "lg:ml-64"
          )}
        >
          {/* Sticky top bar */}
          <DashboardTopBar
            onMenuOpen={() => setMobileOpen(true)}
            sidebarCollapsed={collapsed}
          />

          {/* Page content with top offset for the topbar */}
          <main className="flex-1 pt-[65px] h-full overflow-y-auto">
            <div className="max-w-screen-2xl mx-auto pb-12">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Public Layout (Header + Footer) ────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen">
      {user ? <Header /> : <PublicNavbar />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
