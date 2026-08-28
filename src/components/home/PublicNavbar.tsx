"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, Menu, FileText, Briefcase, ScanSearch, Zap, Users, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { ShareButton } from '@/components/share-button';
import { SaveJobButton } from '@/components/save-job-button';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { JobFilters } from '@/components/job-filters';

const navLinks = [
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/communities', label: 'Communities', icon: Users },
  { href: '/ats-score', label: 'ATS Checker', icon: ScanSearch },
  { href: '/resume-builder', label: 'Resume Builder', icon: FileText },
];

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isJobsPage = pathname === "/jobs";
  const isJobDetailsPage = pathname.startsWith("/jobs/") && pathname !== "/jobs/saved" && pathname !== "/jobs/post" && !pathname.startsWith("/jobs/edit/");
  const currentJobId = isJobDetailsPage ? pathname.split("/jobs/")[1]?.split("?")[0] : null;
  const showBackArrow = isJobsPage || isJobDetailsPage;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 w-full ${
      (scrolled || pathname !== '/') 
        ? 'bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-white/10 shadow-sm dark:shadow-black/50 backdrop-blur-md' 
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 ">
          {/* Logo & Mobile Back Button */}
          <div className="flex items-center gap-2">
            {showBackArrow && (
              <button
                onClick={() => router.back()}
                className="md:hidden p-2 rounded-xl text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <Link href="/" className={`items-center gap-2.5 group ${isJobDetailsPage ? 'hidden md:flex' : 'flex'}`}>
              <img src="/logo.png" alt="JobsDart Logo" className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center">
                Jobs<span className="text-gradient-primary">Dart</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 py-2 text-sm font-semibold transition-colors hover:text-slate-900 dark:hover:text-white ${
                    isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                 
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-500 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-650 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white transition-colors"
            >
              Candidate Login
            </Link>
            <Link
              href="/company/login"
              className="btn-primary flex items-center gap-1.5 text-sm py-2.5 px-5"
            >
              <span>For Recruiter</span>
            </Link>
          </div>

          {/* Mobile actions (Filter / Share + hamburger) */}
          <div className="flex items-center gap-2 md:hidden">
            {isJobsPage && (
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    className="md:hidden p-2 rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 hover:bg-violet-100 transition-colors font-bold"
                    aria-label="Filter Jobs"
                    title="Filter Jobs"
                  >
                    <SlidersHorizontal className="w-4.5 h-4.5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 overflow-y-auto">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="text-lg font-bold text-slate-800 dark:text-slate-200">Filter Jobs</SheetTitle>
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
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-semibold' 
                          : 'text-slate-650 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                        <span className="font-medium text-sm">{link.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="h-px bg-slate-200 dark:bg-white/5" />
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  className="flex items-center justify-center p-3 rounded-xl text-slate-650 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-semibold transition-all"
                >
                  Candidate Login
                </Link>
                <Link
                  href="/company/login"
                  className="btn-primary flex items-center justify-center gap-1.5 p-3 text-sm font-semibold"
                >
                  <span>For Recruiter</span>
                  
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
