"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, ShieldCheck, Zap, Lock, CheckCircle2, Star, Crown, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLANS = [
  {
    id: "free",
    name: "Free Plan",
    price: 0,
    description: "Get started and apply to jobs instantly.",
    icon: Star,
    color: "slate",
    features: [
      "Standard profile visibility",
      "Apply to jobs",
      "Basic email alerts",
      "Track application status"
    ]
  },
  {
    id: "jobseeker_premium",
    name: "4-Months Premium Plan",
    price: 199,
    originalPrice: 799,
    description: "Boost your profile visibility to top recruiters and access premium tools.",
    icon: Crown,
    color: "amber",
    popular: true,
    features: [
      "Highlighted Profile to Recruiters",
      "Priority Application Sorting",
      "Contact recruiters directly",
      "Premium candidate badge",
      "Advanced interview resources"
    ]
  }
];

export default function JobSeekerPlansPage() {
  const { user, loading, fetchUserProfile, setUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Job Seeker')) {
        router.push('/');
        return;
    }
    // Only redirect if they already have an active plan and aren't returning
    if (!loading && user?.planType && user.planType !== 'none') {
        router.push('/');
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

  const handlePlanSelect = async (plan: typeof PLANS[0]) => {
     if (plan.id === "free") {
         if (!user) return;
         setProcessing(plan.id);
         try {
             const res = await fetch("/api/payments/activate-free", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ userId: user.id }),
             });
             if (!res.ok) throw new Error("Failed to activate free plan.");
             
             toast({ title: "Plan Activated!", description: "Your free plan is now active." });
             const updatedProfile = await fetchUserProfile(user.id);
             setUser(updatedProfile);
             router.push("/");
         } catch (error: any) {
             toast({ title: "Error", description: error.message, variant: "destructive" });
             setProcessing(null);
         }
         return;
     }

     setSelectedPlan(plan);
     setAppliedCoupon(null);
     setCouponCode("");
     setIsModalOpen(true);
  };

  const confirmActivation = async () => {
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

        // Handle Free Activation (100% discount)
        if (order.isFree) {
            const verifyRes = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    razorpay_order_id: order.id,
                    razorpay_payment_id: `free_pay_${Date.now()}`,
                    razorpay_signature: "free_sig",
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
            return;
        }

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || order.key_id,
            amount: order.amount,
            currency: order.currency,
            name: "Jobs Dart Careers",
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
            theme: { color: "#f59e0b" },
            modal: { ondismiss: () => setProcessing(null) }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
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
    <div className="min-h-screen bg-[#f8fafc] py-20 px-6 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-100/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-100/30 rounded-full blur-[100px] translate-x-1/3 translate-y-1/2 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight sm:text-6xl">
              Catapult your career.
            </h1>
            <p className="text-slate-500 text-lg max-w-xl mx-auto mt-4">
              Select a plan to start applying for jobs. Go Premium to unlock exclusive features and stand out to recruiters.
            </p>
          </motion.div>


        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="flex"
            >
              <Card className={cn(
                "relative flex flex-col w-full border border-slate-200 shadow-xl rounded-[2.5rem] overflow-hidden bg-white transition-all hover:scale-[1.02]",
                plan.popular && "ring-4 ring-amber-400/30 shadow-amber-200/40 border-none",
                !plan.popular && "shadow-slate-200/50"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white px-6 py-2 rounded-bl-[1.5rem] text-xs font-bold tracking-widest uppercase z-20">
                    Recommended
                  </div>
                )}
                
                <div className={cn(
                  "p-8",
                  plan.color === 'slate' && "bg-slate-50 border-b border-slate-100",
                  plan.color === 'amber' && "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                )}>
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                    plan.color === 'slate' ? "bg-slate-200/50" : "bg-white/20 backdrop-blur-md"
                  )}>
                    <plan.icon className={cn("w-6 h-6", plan.color === 'slate' ? "text-slate-600" : "text-white")} />
                  </div>
                  <h3 className={cn("text-2xl font-bold mb-1", plan.color === 'slate' ? "text-slate-900" : "text-white")}>{plan.name}</h3>
                  <p className={cn("text-sm leading-relaxed mb-6", plan.color === 'slate' ? "text-slate-500" : "text-white/80")}>{plan.description}</p>
                  
                  <div className="flex items-center flex-wrap gap-2.5 mb-2">
                    {plan.originalPrice && plan.price > 0 && (
                      <>
                        <span className="text-white/60 font-medium text-xl line-through decoration-white/40 pt-1">₹{plan.originalPrice}</span>
                        <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-1">
                          Save {Math.round((1 - plan.price / plan.originalPrice) * 100)}%
                        </span>
                      </>
                    )}
                    <span className={cn("text-4xl font-black tracking-tighter pt-1 ml-auto", plan.color === 'slate' ? "text-slate-900" : "text-white")}>
                      ₹{plan.price}
                    </span>
                  </div>
                </div>

                <CardContent className="p-8 flex-grow">
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">What's included:</p>
                    <ul className="space-y-4">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <CheckCircle2 className={cn(
                            "w-5 h-5 mt-0.5 shrink-0",
                            plan.color === 'slate' && "text-slate-400",
                            plan.color === 'amber' && "text-amber-500"
                          )} />
                          <span className="text-slate-600 text-sm font-medium leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="p-8 pt-0">
                  <Button
                    onClick={() => handlePlanSelect(plan)}
                    disabled={!!processing || (plan.id !== 'free' && !scriptLoaded)}
                    variant={plan.id === 'free' ? "outline" : "default"}
                    className={cn(
                      "w-full h-14 rounded-2xl font-bold text-lg transition-all group",
                      plan.id === 'free' && "border-slate-300 text-slate-700 hover:bg-slate-50",
                      plan.id !== 'free' && "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200",
                    )}
                  >
                    {processing === plan.id ? (
                      <LoaderCircle className="w-6 h-6 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        {plan.id === 'free' ? "Start for Free" : "Upgrade to Premium"} 
                        {plan.id !== 'free' && <Zap className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />}
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-full shadow-sm">
             <ShieldCheck className="w-5 h-5 text-indigo-600" />
             <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">SSL Encrypted Secure Platform</span>
          </div>
          <p className="text-xs text-slate-400 text-center max-w-lg">
            By activating a plan, you agree to our Terms of Service and Privacy Policy. Premium plans are a one-time payment for extended functionality.
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
                     <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", selectedPlan.color === 'slate' ? "bg-slate-100 text-slate-600" : "bg-indigo-100 text-indigo-600")}>
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
                      <div className="flex items-center justify-between text-indigo-600 font-medium text-sm">
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
                onClick={confirmActivation} 
                className={"text-white bg-indigo-600 hover:bg-indigo-700"}
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
