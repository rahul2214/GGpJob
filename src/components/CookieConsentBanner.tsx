'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, X } from 'lucide-react';

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('jd_cookie_consent');
      if (!consent) {
        // Slight delay to avoid layout shift before initial page paint
        const timer = setTimeout(() => setShowBanner(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage unavailable (e.g. strict incognito)
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('jd_cookie_consent', 'accepted');
    } catch {}
    setShowBanner(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem('jd_cookie_consent', 'essential');
    } catch {}
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      role="region"
      aria-label="Cookie Consent Banner"
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-slate-950/95 dark:bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-2xl border border-white/10 shadow-2xl relative">
        <button
          onClick={handleEssentialOnly}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Your Privacy &amp; Cookies</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              We use cookies to maintain your login session, analyze traffic, and display relevant career opportunities and advertisements via Google AdSense.
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 mb-4 leading-normal">
          Learn more in our{' '}
          <Link href="/cookies" className="text-violet-400 hover:underline">
            Cookie Policy
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-violet-400 hover:underline">
            Privacy Policy
          </Link>
          .
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAcceptAll}
            className="flex-1 py-2 px-3.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm text-center"
          >
            Accept All
          </button>
          <button
            onClick={handleEssentialOnly}
            className="flex-1 py-2 px-3.5 bg-white/10 hover:bg-white/15 active:bg-white/20 text-slate-300 rounded-xl text-xs font-semibold transition-colors text-center border border-white/10"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
