'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertTriangle, Zap } from 'lucide-react';

interface SubscriptionExpiredModalProps {
  open: boolean;
  onClose: () => void;
  /** If true, show "Subscription Required" (for post-job action) */
  variant?: 'expired' | 'required';
  expiredAt?: string | null;
}

export function SubscriptionExpiredModal({
  open,
  onClose,
  variant = 'expired',
  expiredAt,
}: SubscriptionExpiredModalProps) {
  const isRequired = variant === 'required';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-black text-white mb-1">
            {isRequired ? 'Subscription Required' : 'Subscription Expired'}
          </DialogTitle>
          <DialogDescription className="text-orange-100 text-sm font-medium">
            {isRequired
              ? `Your subscription expired${expiredAt ? ` on ${new Date(expiredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}.`
              : 'Your subscription has expired. Renew your plan to continue using this feature.'}
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="space-y-2 mb-6">
            {[
              'Continue receiving applications',
              'Post and edit unlimited jobs',
              'Access AI hiring tools',
              'Restore archived jobs instantly',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-sm text-slate-700">
                <Zap className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          <DialogFooter className="flex gap-3 sm:flex-row">
            <Link href="/company/payment?upgrade=true" className="flex-1" onClick={onClose}>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl">
                Renew Now
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl font-bold border-slate-200"
            >
              Cancel
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
