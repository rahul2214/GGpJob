"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/hooks/use-toast';

function TrackerContent() {
  const searchParams = useSearchParams();
  const { user, refreshUser } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    // 1. Capture referral code from URL if present
    const refCode = searchParams.get('ref') || searchParams.get('referrer');
    if (refCode) {
      localStorage.setItem('jobsdart_referral_code', refCode.trim());
      console.log('[ReferralTracker] Saved referral code:', refCode.trim());
    }
  }, [searchParams]);

  useEffect(() => {
    // 2. Claim referral code if user is logged in, is a Job Seeker, and has a stored code
    const storedCode = localStorage.getItem('jobsdart_referral_code');
    
    if (user && user.role === 'Job Seeker' && storedCode) {
      // Check if user has already claimed a referral
      if (user.referredBy) {
        localStorage.removeItem('jobsdart_referral_code');
        return;
      }

      // Check if user is relatively new or onboarding is not completed
      const isNewAccount = !user.referredBy;
      
      if (isNewAccount) {
        const claimReferral = async () => {
          try {
            console.log('[ReferralTracker] Attempting to claim referral:', storedCode);
            
            // Immediately remove the code to prevent double-firing in strict mode
            localStorage.removeItem('jobsdart_referral_code');

            const response = await fetch('/api/referral/claim', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                referralCode: storedCode,
                userUuid: user.uuid,
              }),
            });

            const data = await response.json();

            if (response.ok) {
              console.log('[ReferralTracker] Claim successful!');
              toast({
                title: "Referral Claimed!",
                description: "You joined via referral link. Welcome to JobsDart!",
                className: "bg-emerald-50 border-emerald-200 text-emerald-800",
              });
              // Sync credits and user state immediately
              await refreshUser();
            } else {
              console.warn('[ReferralTracker] Claim failed:', data.error);
              // If it failed because they haven't verified their email yet, or it's a server/network error,
              // restore the code to localStorage so they can claim it after verification.
              const isUnverified = response.status === 400 && data.error?.toLowerCase().includes('confirm');
              const isTransient = response.status >= 500;
              
              if (isUnverified || isTransient) {
                localStorage.setItem('jobsdart_referral_code', storedCode);
                console.log('[ReferralTracker] Restored referral code to localStorage for retry.');
              }
            }
          } catch (err) {
            console.error('[ReferralTracker] Claim request failed:', err);
            // Restore on network failure/exception
            localStorage.setItem('jobsdart_referral_code', storedCode);
          }
        };

        claimReferral();
      } else {
        // Clear code if account is not eligible
        localStorage.removeItem('jobsdart_referral_code');
      }
    }
  }, [user, toast, refreshUser]);

  return null;
}

export default function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerContent />
    </Suspense>
  );
}
