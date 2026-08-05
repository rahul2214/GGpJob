'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, X, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubscriptionInfo } from '@/lib/subscription';
import { cn } from '@/lib/utils';

interface SubscriptionExpiryBannerProps {
  subInfo: SubscriptionInfo;
  className?: string;
}

export function SubscriptionExpiryBanner({ subInfo, className }: SubscriptionExpiryBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Warning banner: subscription expiring soon (≤7 days)
  if (!subInfo.isExpired && subInfo.daysUntilExpiry <= 7) {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm font-semibold">
            Your subscription expires in <strong>{subInfo.daysUntilExpiry} days</strong>.{' '}
            <Link href="/company/payment?upgrade=true" className="underline underline-offset-2 hover:text-amber-700">
              Renew now
            </Link>{' '}
            to avoid interruption.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-800 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Full expired banner
  if (!subInfo.isExpired) return null;

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-red-600 via-orange-600 to-red-700 rounded-2xl overflow-hidden shadow-lg',
        className
      )}
    >
      <div className="p-6 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Left: Info */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-black">Your subscription has expired.</h3>
                {subInfo.isInGracePeriod && (
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-[10px] font-bold uppercase tracking-wider">
                    Grace Period — {subInfo.graceDaysRemaining}d left
                  </Badge>
                )}
              </div>
              <p className="text-red-100 text-sm font-medium mb-3">
                {subInfo.isInGracePeriod
                  ? `Your jobs are still visible. They will be archived in ${subInfo.graceDaysRemaining} day${subInfo.graceDaysRemaining !== 1 ? 's' : ''} unless you renew.`
                  : 'Renew your plan to continue hiring without interruption.'}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                {[
                  'Continue receiving applications',
                  'Post unlimited jobs',
                  'Access premium hiring tools',
                  'Restore archived jobs instantly',
                ].map((b) => (
                  <span key={b} className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                    <Zap className="w-3.5 h-3.5 text-yellow-300" />
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
            <Link href="/company/payment?upgrade=true" className="flex-1 md:flex-none">
              <Button className="w-full bg-white text-red-700 hover:bg-red-50 font-black rounded-xl text-sm shadow-lg gap-2">
                Renew Plan <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/company/payment" className="flex-1 md:flex-none">
              <Button
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10 font-bold rounded-xl text-sm bg-transparent"
              >
                View Plans
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
