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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoaderCircle className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative subtle background gradient */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        {/* Compact Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Credits
              </h1>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Check balance, earn free credits by referring peers, or purchase instant top-ups.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-white border border-slate-200/80 rounded-xl px-2.5 py-1 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Currency:</span>
            <CurrencySelector
              options={BILLING_CURRENCY_CODES}
              value={currency}
              onChange={setBillingCurrency}
            />
          </div>
        </div>

        {/* Top Section: Wallet Balance & Refer & Earn Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* My Wallet & Balance (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 pb-3 mb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">My Credit Balance</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Available for applications & AI tools</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[11px] font-bold">
                    Active
                  </span>
                </div>

                {/* Total Balance Highlight */}
                <div className="bg-gradient-to-br from-indigo-50/90 via-indigo-50/50 to-violet-50/60 rounded-xl p-3.5 border border-indigo-100 mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Total Available</p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl font-black text-indigo-700 tracking-tight">
                        {(user.subscriptionCredits || 0) + (user.purchasedCredits || 0)}
                      </span>
                      <span className="text-xs font-bold text-indigo-500">Credits</span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>

                {/* Breakdown by Type */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Subscription</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">
                      {user.subscriptionCredits || 0} <span className="text-[10px] font-medium text-slate-400">Monthly</span>
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Purchased</p>
                    <p className="text-sm font-black text-emerald-600 mt-0.5">
                      {user.purchasedCredits || 0} <span className="text-[10px] font-medium text-slate-400">Top-up</span>
                    </p>
                  </div>
                </div>
              </div>

             
            </div>
          </div>

          {/* Refer & Earn (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <ReferAndEarnCard creditsPerReferral={referralCredits} className="h-full" />
          </div>
        </div>

        {/* Credit Packs Section */}
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Top-up Credit Packs</span>
              </h2>
              <p className="text-xs text-slate-500">
                Choose a pack to instantly power your applications and profile visibility.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">Instant Delivery • Secure Checkout</span>
          </div>

          {loadingPacks ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-64 rounded-2xl bg-white border border-slate-200/80 shadow-xs animate-pulse p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="h-5 w-1/2 bg-slate-200 rounded-lg" />
                    <div className="h-8 w-1/3 bg-slate-200 rounded-lg" />
                    <div className="h-4 w-5/6 bg-slate-100 rounded-lg" />
                  </div>
                  <div className="h-10 w-full bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : packs.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 max-w-md mx-auto p-6 shadow-xs">
              <Coins className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-700">No Credit Packs Available</h3>
              <p className="text-xs text-slate-500 mt-1">Please check back later or contact support.</p>
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
                      "relative flex flex-col justify-between w-full border border-slate-200/90 shadow-2xs hover:shadow-md rounded-2xl overflow-hidden bg-white transition-all hover:border-indigo-300",
                      pack.popular && "ring-2 ring-amber-400/80 border-amber-300 shadow-amber-50"
                    )}
                  >
                    {pack.popular && (
                      <div className="absolute top-3.5 right-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs">
                        Best Value
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-1.5">
                        
                        <h3 className="text-base font-bold text-slate-900 truncate pr-16">{pack.name}</h3>
                      </div>

                      <div className="flex items-baseline gap-1.5 my-2.5">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">{pack.credits}</span>
                        <span className="text-xs font-bold text-indigo-600">Credits</span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] mb-3 leading-relaxed">
                        {pack.description}
                      </p>

                      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
                          <span className="text-lg font-black text-slate-900">{formattedPrice}</span>
                        </div>
                        {pack.perCredit > 0 && (
                          <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-200/60 shadow-2xs">
                            {formatPrice(convertPrice(pack.perCredit, currency, exchangeRates), currency)} / cr
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <Button
                        onClick={() => handlePackSelect(pack)}
                        disabled={!!processing}
                        size="sm"
                        className={cn(
                          "w-full h-10 rounded-xl font-bold text-xs sm:text-sm text-white shadow-2xs transition-all",
                          pack.color === 'sky' && "bg-sky-500 hover:bg-sky-600",
                          pack.color === 'amber' && "bg-amber-500 hover:bg-amber-600",
                          pack.color === 'indigo' && "bg-indigo-600 hover:bg-indigo-700",
                          pack.color === 'emerald' && "bg-emerald-600 hover:bg-emerald-700",
                          pack.color === 'purple' && "bg-purple-600 hover:bg-purple-700"
                        )}
                      >
                        {processing === pack.id ? (
                          <LoaderCircle className="w-4 h-4 animate-spin" />
                        ) : (
                          <span>Buy {pack.credits} Credits</span>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
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
