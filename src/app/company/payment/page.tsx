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

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Local definition removed - now using RECRUITER_PLANS from pricing-constants.ts

export default function PaymentPage() {
  const { user, loading, fetchUserProfile, setUser } = useUser();
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
    if (!loading && (!user || (user.role !== 'Recruiter' && user.role !== 'Employee'))) {
      router.push('/company/login');
      return;
    }
    // Only redirect if they already have an active plan and aren't trying to upgrade
    if (!loading && user?.planType && user.planType !== 'none' && !location.search.includes('upgrade=true')) {
        // Talent search only plan might still want to post jobs (buy basic)
        if (user.planType === 'talent' && !location.search.includes('buy_basic=true')) {
             // Let them stay if they want to buy a posting plan
        } else if (user.planType !== 'talent') {
             router.push('/');
             return;
        }
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

  const confirmPayment = async () => {
    if (!scriptLoaded || !user || !selectedPlan) return;
    
    const finalPrice = appliedCoupon ? Math.max(0, Math.round(selectedPlan.price * (1 - appliedCoupon.discount / 100))) : selectedPlan.price;
    
    setIsModalOpen(false);
    setProcessing(selectedPlan.id);

    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.id, 
          planId: selectedPlan.id, 
          amount: finalPrice,
          couponCode: appliedCoupon?.code
        }),
      });

      if (!orderRes.ok) throw new Error("Failed to create payment order.");
      const order = await orderRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Jobs Dart Recruiter Portal",
        description: `${selectedPlan.name} - One-Time Payment`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                userId: user.id,
                planId: selectedPlan.id,
                couponCode: appliedCoupon?.code
              }),
            });

            if (verifyRes.ok) {
              toast({ title: "Activated Successfully!", description: `The ${selectedPlan.name} is now active on your account.` });
              const updatedProfile = await fetchUserProfile(user.id);
              setUser(updatedProfile);
              router.push("/");
            } else {
              throw new Error("Verification failed.");
            }
          } catch (err) {
            toast({ title: "Verification Failed", description: "Something went wrong. Please contact support.", variant: "destructive" });
          } finally {
            setProcessing(null);
          }
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
          disabled={!scriptLoaded}
        />

        <div className="mt-20 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-full shadow-sm">
             <ShieldCheck className="w-5 h-5 text-emerald-600" />
             <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">SSL Encrypted & Secure Payments via Razorpay</span>
          </div>
          <p className="text-xs text-slate-400 text-center max-w-lg">
            By purchasing, you agree to our Terms of Service and Privacy Policy. These are one-time payments providing access for the stated duration.
          </p>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Summary</DialogTitle>
            <DialogDescription>
              Review your checkout details for the {selectedPlan?.name}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="bg-slate-50 border rounded-xl overflow-hidden mt-2">
               <div className="p-4 bg-white border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", selectedPlan.color === 'emerald' ? "bg-emerald-100 text-emerald-600" : selectedPlan.color === 'amber' ? "bg-amber-100 text-amber-600" : "bg-sky-100 text-sky-600")}>
                        <selectedPlan.icon className="w-5 h-5" />
                     </div>
                     <div>
                        <div className="font-bold text-slate-900">{selectedPlan.name}</div>
                        <div className="text-xs text-slate-500">One-time payment</div>
                     </div>
                  </div>
                  <div className="text-lg font-black tracking-tight text-slate-900">
                      ₹{selectedPlan.price}
                  </div>
               </div>

               <div className="p-4 bg-slate-50 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 shadow-none block">Promo Code</label>
                    <div className="flex items-center gap-2">
                        <Input 
                            placeholder="Enter code" 
                            value={couponCode}
                            onChange={e => setCouponCode(e.target.value.toUpperCase())}
                            className="bg-white uppercase font-bold tracking-wider"
                            disabled={!!appliedCoupon}
                        />
                         {appliedCoupon ? (
                            <Button variant="outline" className="text-red-600 font-bold hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => setAppliedCoupon(null)}>
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
                            >
                                {validatingCoupon ? <LoaderCircle className="w-4 h-4 animate-spin" /> : "Apply"}
                            </Button>
                        )}
                    </div>
                  </div>

                  {appliedCoupon && (
                      <div className="flex items-center justify-between text-emerald-600 font-medium text-sm">
                          <span className="flex items-center gap-1"><Tag className="w-4 h-4"/> Discount ({appliedCoupon.discount}%)</span>
                          <span>- ₹{Math.round(selectedPlan.price * (appliedCoupon.discount / 100))}</span>
                      </div>
                  )}

                  <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                     <span className="font-bold text-slate-900">Total Due</span>
                     <span className="text-2xl font-black text-slate-900">
                         ₹{appliedCoupon ? Math.max(0, Math.round(selectedPlan.price * (1 - appliedCoupon.discount / 100))) : selectedPlan.price}
                     </span>
                  </div>
               </div>
            </div>
          )}

          <DialogFooter className="mt-4">
             <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
             <Button 
                onClick={confirmPayment} 
                className={cn(
                    "text-white",
                    selectedPlan?.color === 'emerald' ? "bg-emerald-600 hover:bg-emerald-700" :
                    selectedPlan?.color === 'amber' ? "bg-amber-500 hover:bg-amber-600" : "bg-sky-500 hover:bg-sky-600"
                )}
             >
                <Lock className="w-4 h-4 mr-2 opacity-70" />
                Confirm & Pay
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
