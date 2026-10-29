"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Lock, Coins, Tag, ArrowLeft, Wallet, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CurrencySelector } from "@/components/currency-selector";
import { formatPrice, convertPrice, BILLING_CURRENCY_CODES } from "@/utils/currency";
import { useBillingCurrency } from "@/hooks/use-billing-currency";
import { PayPalPaymentButton } from "@/components/paypal-payment-button";
import { ReferAndEarnCard } from "@/components/refer-and-earn";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface CreditPack {
  id: string;
  name: string;
  price: number;
  credits: number;
  perCredit: number;
  description: string;
  color: string;
  popular?: boolean;
}

const PACK_STYLE_PRESETS: Record<string, { color: string; description: string; popular?: boolean }> = {
  mini: {
    color: 'sky',
    description: 'Perfect for quick applications and referral boosts.',
  },
  popular_pack: {
    color: 'amber',
    popular: true,
    description: 'Our best value pack for active job applicants.',
  },
  pro_pack: {
    color: 'indigo',
    description: 'Maximum credits for aggressive job hunting.',
  },
};

const COLOR_VARIANTS = ['sky', 'amber', 'indigo', 'emerald', 'purple'];

export default function CreditsPage() {
  const { user, loading, fetchUserProfile, setUser } = useUser();
  // Checkout runs on two currencies only: INR (Razorpay) or USD (PayPal).
  const { billingCurrency: currency, setBillingCurrency, gateway, exchangeRates } = useBillingCurrency();
  const router = useRouter();
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [loadingPacks, setLoadingPacks] = useState(true);
  const [referralCredits, setReferralCredits] = useState<number>(2);
  const [selectedPack, setSelectedPack] = useState<CreditPack | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/payments/prices')
      .then(res => res.json())
      .then(data => {
        if (data?.referralCredits && typeof data.referralCredits === 'number') {
          setReferralCredits(data.referralCredits);
        }
        if (data?.creditPacks && Array.isArray(data.creditPacks) && data.creditPacks.length > 0) {
          const dbPacks: CreditPack[] = data.creditPacks.map((item: any, idx: number) => {
            const style = PACK_STYLE_PRESETS[item.id] || {};
            const credits = Number(item.credits) || 0;
            const price = Number(item.price) || 0;
            const perCredit = credits > 0 ? (price / credits) : 0;
            return {
              id: item.id,
              name: item.name || item.id,
              credits,
              price,
              perCredit,
              description: style.description || `${credits} credits pack for applications and referrals.`,
              color: style.color || COLOR_VARIANTS[idx % COLOR_VARIANTS.length],
              popular: style.popular ?? (item.id === 'popular_pack' || idx === 1),
            };
          });
          setPacks(dbPacks);
        } else {
          setPacks([]);
        }
      })
      .catch(err => {
        console.warn('Failed to fetch pack prices from database:', err);
        setPacks([]);
      })
      .finally(() => setLoadingPacks(false));
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Job Seeker')) {
        router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  const handlePackSelect = (pack: CreditPack) => {
     setSelectedPack(pack);
     setAppliedCoupon(null);
     setCouponCode("");
     setIsModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentDetails: any) => {
    setIsModalOpen(false);
    if (!selectedPack || !user) return;
    setProcessing(selectedPack.id);

    try {
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentDetails,
          userId: user.uuid,
          planId: selectedPack.id,
          couponCode: appliedCoupon?.code,
          currency,
          type: 'credit_topup'
        }),
      });

      if (verifyRes.ok) {
        toast({ title: "Purchase Successful!", description: `Successfully added ${selectedPack.credits} credits.` });
        const updatedProfile = await fetchUserProfile(user.uuid);
        setUser(updatedProfile);
        router.push("/profile");
      } else {
        const errData = await verifyRes.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || "Verification failed.");
      }
    } catch (err: any) {
      toast({ title: "Verification Failed", description: err.message || "Something went wrong. Please contact support.", variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const confirmActivation = async () => {
    if (!user || !selectedPack) return;
    
    const rawPriceUSD = selectedPack.price;
    const finalPriceUSD = appliedCoupon ? Math.max(0, rawPriceUSD * (1 - appliedCoupon.discount / 100)) : rawPriceUSD;
    const finalPriceConverted = convertPrice(finalPriceUSD, currency, exchangeRates);
    const roundedPrice = Math.round(finalPriceConverted * 100) / 100;
    
    setIsModalOpen(false);
    setProcessing(selectedPack.id);

    try {
        const orderRes = await fetch("/api/payments/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                userId: user.uuid, 
                planId: selectedPack.id,
                amount: roundedPrice,
                couponCode: appliedCoupon?.code,
                currency,
                type: 'credit_topup'
            }),
        });

        if (!orderRes.ok) {
          const errData = await orderRes.json();
          throw new Error(errData.error || "Failed to create payment order.");
        }
        const order = await orderRes.json();

        // Handle Free Activation (100% discount)
        if (order.isFree) {
            await handlePaymentSuccess({
              razorpay_order_id: order.id,
              razorpay_payment_id: `free_pay_${Date.now()}`,
              razorpay_signature: "free_sig",
              isFree: true
            });
            return;
        }

        // Razorpay Checkout (Only for INR)
        if (order.gateway === 'razorpay') {
            if (!scriptLoaded) throw new Error("Payment SDK not loaded yet.");
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || order.key_id || 'rzp_test_placeholder',
                amount: order.amount,
                currency: order.currency,
                name: "Jobs Dart Careers",
                description: `${selectedPack.name} - ${selectedPack.credits} Credits`,
                order_id: order.id,
                handler: async (response: any) => {
                  await handlePaymentSuccess(response);
                },
                prefill: {
                  name: user.name,
                  email: user.email,
                  contact: user.phone || "",
                },
                theme: { color: "#4f46e5" },
                modal: { ondismiss: () => setProcessing(null) }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        }
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setProcessing(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoaderCircle className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Refer &amp; Earn</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Invite friends to earn free credits, or top up your balance any time.
          </p>
        </header>

        <ReferAndEarnCard creditsPerReferral={referralCredits} />

        {/* Balance */}
        <section aria-labelledby="balance-heading" className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                <Wallet className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="balance-heading" className="text-xs font-semibold text-slate-600 dark:text-slate-300">Available balance</h2>
                <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                  {(user.subscriptionCredits || 0) + (user.purchasedCredits || 0)}
                  <span className="ml-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">credits</span>
                </p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950/50 px-4 py-3">
                <dt className="text-xs text-slate-500 dark:text-slate-400">Monthly plan</dt>
                <dd className="text-lg font-semibold tabular-nums text-slate-900 dark:text-white">{user.subscriptionCredits || 0}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950/50 px-4 py-3">
                <dt className="text-xs text-slate-500 dark:text-slate-400">Purchased &amp; rewards</dt>
                <dd className="text-lg font-semibold tabular-nums text-slate-900 dark:text-white">{user.purchasedCredits || 0}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Credit Packs Section */}
        <section aria-labelledby="packs-heading" className="space-y-4 pt-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="packs-heading" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Need more credits?
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Top-ups are added instantly after a secure checkout.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Currency</span>
              <CurrencySelector
                options={BILLING_CURRENCY_CODES}
                value={currency}
                onChange={setBillingCurrency}
              />
            </div>
          </div>

          {loadingPacks ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 animate-pulse p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
                  </div>
                  <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
              ))}
            </div>
          ) : packs.length === 0 ? (
            <div className="text-center rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
              <Coins className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No credit packs available right now</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please check back later or contact support.</p>
            </div>
          ) : (
            <div className={cn(
              "grid gap-4 sm:gap-5",
              packs.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : packs.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto" : "grid-cols-1 md:grid-cols-3"
            )}>
              {packs.map((pack) => {
                const convertedPrice = convertPrice(pack.price, currency, exchangeRates);
                const formattedPrice = formatPrice(convertedPrice, currency);

                return (
                  <Card
                    key={pack.id}
                    className={cn(
                      "relative flex w-full flex-col justify-between rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-colors",
                      pack.popular
                        ? "border-indigo-300 ring-1 ring-indigo-300 dark:border-indigo-700 dark:ring-indigo-700"
                        : "border-slate-200/70 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                    )}
                  >
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{pack.name}</h3>
                        {pack.popular && (
                          <span className="shrink-0 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                            Best value
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">{pack.credits}</span>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">credits</span>
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{pack.description}</p>
                      </div>

                      <div className="flex items-baseline justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">{formattedPrice}</span>
                        {pack.perCredit > 0 && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatPrice(convertPrice(pack.perCredit, currency, exchangeRates), currency)} per credit
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <Button
                        onClick={() => handlePackSelect(pack)}
                        disabled={!!processing}
                        variant={pack.popular ? "default" : "outline"}
                        className={cn(
                          "w-full h-10 rounded-xl text-sm font-semibold",
                          pack.popular
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "border-slate-200 text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                        )}
                      >
                        {processing === pack.id ? (
                          <LoaderCircle className="w-4 h-4 animate-spin" aria-label="Processing" />
                        ) : (
                          <span>Buy {pack.credits} credits</span>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border-slate-100 shadow-2xl p-7 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Order Summary</DialogTitle>
            <DialogDescription className="text-slate-500 mt-1">
              Review your top-up details.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPack && (
            <div className="bg-slate-50 border rounded-2xl overflow-hidden mt-2 border-slate-100">
               <div className="p-4 bg-white border-b flex items-center justify-between border-slate-100">
                  <div className="flex items-center gap-3">
                     <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center border", 
                        selectedPack.color === 'sky' ? "bg-sky-50 border-sky-100 text-sky-600" : "bg-indigo-50 border-indigo-100 text-indigo-600")}>
                        <Coins className="w-5 h-5" />
                     </div>
                     <div>
                        <div className="font-bold text-slate-900">{selectedPack.name}</div>
                        <div className="text-xs text-slate-500">{selectedPack.credits} Credits Top-up</div>
                     </div>
                  </div>
                  <div className="text-lg font-black tracking-tight text-slate-900">
                      {formatPrice(convertPrice(selectedPack.price, currency, exchangeRates), currency)}
                  </div>
               </div>

               <div className="p-4 bg-slate-50/50 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Promo Code</label>
                    <div className="flex items-center gap-2">
                        <Input 
                            placeholder="Enter code" 
                            value={couponCode}
                            onChange={e => setCouponCode(e.target.value.toUpperCase())}
                            className="bg-white uppercase font-bold tracking-wider rounded-xl h-11 border-slate-200"
                            disabled={!!appliedCoupon}
                        />
                         {appliedCoupon ? (
                            <Button variant="outline" className="h-11 rounded-xl text-red-600 font-bold hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => setAppliedCoupon(null)}>
                                Remove
                            </Button>
                        ) : (
                            <Button 
                                onClick={async () => {
                                    if(!couponCode) return;
                                    setValidatingCoupon(true);
                                    try {
                                        const res = await fetch('/api/coupons/validate', { 
                                            method: 'POST', 
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ code: couponCode, planId: selectedPack.id, userId: user.uuid }) 
                                        });
                                        const data = await res.json();
                                        if(!res.ok) throw new Error(data.error);
                                        setAppliedCoupon({ code: data.code, discount: data.discountPercent });
                                        toast({ title: "Coupon Applied!", description: `${data.discountPercent}% discount activated.`});
                                    } catch(err: any) {
                                        toast({ title: "Invalid Coupon", description: err.message, variant: "destructive"});
                                        setCouponCode("");
                                    } finally {
                                        setValidatingCoupon(false);
                                    }
                                }} 
                                disabled={!couponCode || validatingCoupon} 
                                variant="secondary"
                                className="h-11 rounded-xl font-bold px-4"
                            >
                                {validatingCoupon ? <LoaderCircle className="w-4 h-4 animate-spin" /> : "Apply"}
                            </Button>
                        )}
                    </div>
                  </div>

                  {appliedCoupon && (
                      <div className="flex items-center justify-between text-indigo-600 font-medium text-xs">
                          <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5"/> Discount ({appliedCoupon.discount}%)</span>
                          <span>- {formatPrice(convertPrice(selectedPack.price * (appliedCoupon.discount / 100), currency, exchangeRates), currency)}</span>
                      </div>
                  )}

                  <div className="border-t border-slate-200/60 pt-3 flex items-center justify-between">
                     <span className="font-bold text-slate-800 text-sm">Total Due</span>
                     <span className="text-2xl font-black text-slate-900">
                         {formatPrice(
                           convertPrice(
                             appliedCoupon 
                               ? Math.max(0, selectedPack.price * (1 - appliedCoupon.discount / 100)) 
                               : selectedPack.price,
                             currency,
                             exchangeRates
                           ),
                           currency
                         )}
                     </span>
                  </div>
               </div>
            </div>
          )}

          <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-col">
             {(appliedCoupon && appliedCoupon.discount >= 100) || (selectedPack && (appliedCoupon ? Math.max(0, selectedPack.price * (1 - appliedCoupon.discount / 100)) : selectedPack.price) <= 0) ? (
               <Button 
                  onClick={confirmActivation} 
                  disabled={!!processing}
                  className="w-full h-12 text-white bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl shadow-lg shadow-emerald-200"
               >
                  {processing === selectedPack?.id ? (
                    <LoaderCircle className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      
                      Claim Credits Free
                    </>
                  )}
               </Button>
             ) : gateway === 'paypal' ? (
               <PayPalPaymentButton
                 amount={
                   appliedCoupon
                     ? Math.max(0, selectedPack ? selectedPack.price * (1 - appliedCoupon.discount / 100) : 0)
                     : selectedPack?.price || 0
                 }
                 currency={currency}
                 planId={selectedPack?.id || ""}
                 userId={user.uuid}
                 couponCode={appliedCoupon?.code}
                 onSuccess={handlePaymentSuccess}
                 onError={(err) => toast({ title: "PayPal Error", description: "PayPal checkout encountered an issue. Please try again.", variant: "destructive" })}
               />
             ) : (
               <Button 
                  onClick={confirmActivation} 
                  disabled={!!processing}
                  className="w-full h-12 text-white bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl shadow-lg shadow-indigo-200"
               >
                  {processing === selectedPack?.id ? (
                    <LoaderCircle className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2 opacity-70" />
                      Confirm & Pay with Razorpay
                    </>
                  )}
               </Button>
             )}
             <Button variant="ghost" className="w-full h-10 rounded-xl font-bold text-slate-500 hover:text-slate-900" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
