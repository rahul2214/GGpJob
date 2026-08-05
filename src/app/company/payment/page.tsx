"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, ShieldCheck, Zap, CreditCard, Lock, CheckCircle2, Search, Star, Crown, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { RECRUITER_PLANS } from "@/lib/pricing-constants";
import RecruiterPricingGrid from "@/components/recruiter-pricing-grid";
import { CurrencySelector } from "@/components/currency-selector";
import { formatPrice, convertPrice } from "@/utils/currency";
import { PayPalPaymentButton } from "@/components/paypal-payment-button";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage() {
  const { user, loading, fetchUserProfile, setUser, currency, exchangeRates } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  const [selectedPlan, setSelectedPlan] = useState<typeof RECRUITER_PLANS[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Recruiter')) {
      router.push('/company/login');
      return;
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

  const handlePlanSelect = (plan: typeof RECRUITER_PLANS[0]) => {
     setSelectedPlan(plan);
     setAppliedCoupon(null);
     setCouponCode("");
     setIsModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentDetails: any) => {
    setIsModalOpen(false);
    if (!selectedPlan || !user) return;
    setProcessing(selectedPlan.id);

    try {
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentDetails,
          userId: user.uuid,
          planId: selectedPlan.id,
          couponCode: appliedCoupon?.code,
          currency
        }),
      });

      if (verifyRes.ok) {
        toast({ title: "Activated Successfully!", description: `The ${selectedPlan.name} is now active on your account.` });
        const updatedProfile = await fetchUserProfile(user.uuid);
        setUser(updatedProfile);
        router.push("/");
      } else {
        throw new Error("Verification failed.");
      }
    } catch (err: any) {
      toast({ title: "Verification Failed", description: err.message || "Something went wrong. Please contact support.", variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const confirmPayment = async () => {
    if (!user || !selectedPlan) return;
    
    const rawPriceUSD = selectedPlan.price;
    const finalPriceUSD = appliedCoupon ? Math.max(0, rawPriceUSD * (1 - appliedCoupon.discount / 100)) : rawPriceUSD;
    const finalPriceConverted = convertPrice(finalPriceUSD, currency, exchangeRates);
    const roundedPrice = Math.round(finalPriceConverted * 100) / 100;
    
    setIsModalOpen(false);
    setProcessing(selectedPlan.id);

    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.uuid, 
          planId: selectedPlan.id, 
          amount: roundedPrice,
          couponCode: appliedCoupon?.code,
          currency
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
          razorpay_signature: "free_sig"
        });
        return;
      }

      // Razorpay Checkout (Only for INR)
      if (order.gateway === 'razorpay') {
        if (!scriptLoaded) throw new Error("Payment checkout SDK not loaded. Please refresh.");
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || order.key_id || 'rzp_test_placeholder',
          amount: order.amount,
          currency: order.currency,
          name: "Jobs Dart Recruiter Portal",
          description: `${selectedPlan.name} - One-Time Payment`,
          order_id: order.id,
          handler: async (response: any) => {
            await handlePaymentSuccess(response);
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone || "",
          },
          theme: { color: selectedPlan.id === 'premium' ? "#f59e0b" : "#059669" },
          modal: { ondismiss: () => setProcessing(null) }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      }
    } catch (error: any) {
      toast({ title: "Payment Error", description: error.message, variant: "destructive" });
      setProcessing(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoaderCircle className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-20 px-6 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-emerald-100/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-sky-100/30 rounded-full blur-[100px] translate-x-1/3 translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Global Currency Selection Row */}
        <div className="flex justify-end mb-8">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Currency:</span>
            <CurrencySelector />
          </div>
        </div>

        <div className="text-center mb-16 space-y-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight sm:text-6xl">
              Choose your hiring speed.
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto mt-4">
              Unlock the tools you need to find the best talent. From basic verification to premium recruitment automation.
            </p>
          </motion.div>
        </div>

        <RecruiterPricingGrid 
          onPlanSelect={handlePlanSelect} 
          isMarketing={false} 
          processingId={processing}
          disabled={!!processing}
        />

        <div className="mt-20 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-full shadow-sm">
             <ShieldCheck className="w-5 h-5 text-emerald-600" />
             <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
               Secure Payments via {currency.toUpperCase() === 'INR' ? 'Razorpay' : 'PayPal'}
             </span>
          </div>
          <p className="text-xs text-slate-400 text-center max-w-lg">
            By purchasing, you agree to our Terms of Service and Privacy Policy. These are one-time payments providing access for the stated duration.
          </p>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border-slate-100 shadow-2xl p-7 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Order Summary</DialogTitle>
            <DialogDescription className="text-slate-500 mt-1">
              Review your checkout details for the {selectedPlan?.name}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="bg-slate-50 border rounded-2xl overflow-hidden mt-2 border-slate-100">
               <div className="p-4 bg-white border-b flex items-center justify-between border-slate-100">
                  <div className="flex items-center gap-3">
                     <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center border", selectedPlan.color === 'emerald' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : selectedPlan.color === 'amber' ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-sky-50 border-sky-100 text-sky-600")}>
                        <selectedPlan.icon className="w-5 h-5" />
                     </div>
                     <div>
                        <div className="font-bold text-slate-900">{selectedPlan.name}</div>
                        <div className="text-xs text-slate-500">One-time payment</div>
                     </div>
                  </div>
                  <div className="text-lg font-black tracking-tight text-slate-900">
                      {formatPrice(convertPrice(selectedPlan.price, currency, exchangeRates), currency)}
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
                                            body: JSON.stringify({ code: couponCode, planId: selectedPlan.id }) 
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
                      <div className="flex items-center justify-between text-emerald-600 font-medium text-xs">
                          <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5"/> Discount ({appliedCoupon.discount}%)</span>
                          <span>- {formatPrice(convertPrice(selectedPlan.price * (appliedCoupon.discount / 100), currency, exchangeRates), currency)}</span>
                      </div>
                  )}

                  <div className="border-t border-slate-200/60 pt-3 flex items-center justify-between">
                     <span className="font-bold text-slate-800 text-sm">Total Due</span>
                     <span className="text-2xl font-black text-slate-900">
                         {formatPrice(
                           convertPrice(
                             appliedCoupon 
                               ? Math.max(0, selectedPlan.price * (1 - appliedCoupon.discount / 100)) 
                               : selectedPlan.price,
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
             {currency.toUpperCase() !== 'INR' ? (
               <PayPalPaymentButton
                 amount={
                   appliedCoupon
                     ? Math.max(0, selectedPlan ? selectedPlan.price * (1 - appliedCoupon.discount / 100) : 0)
                     : selectedPlan?.price || 0
                 }
                 currency={currency}
                 planId={selectedPlan?.id || ""}
                 userId={user.uuid}
                 couponCode={appliedCoupon?.code}
                 onSuccess={handlePaymentSuccess}
                 onError={(err) => toast({ title: "PayPal Error", description: "PayPal checkout encountered an issue. Please try again.", variant: "destructive" })}
               />
             ) : (
               <Button 
                  onClick={confirmPayment} 
                  className={cn(
                    "w-full h-12 text-white font-bold rounded-xl shadow-lg",
                    selectedPlan?.color === 'emerald' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" :
                    selectedPlan?.color === 'amber' ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200" : "bg-sky-500 hover:bg-sky-600 shadow-sky-200"
                  )}
               >
                  <Lock className="w-4 h-4 mr-2 opacity-70" />
                  Confirm & Pay with Razorpay
               </Button>
             )}
             <Button variant="ghost" className="w-full h-10 rounded-xl font-bold text-slate-500 hover:text-slate-900" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
