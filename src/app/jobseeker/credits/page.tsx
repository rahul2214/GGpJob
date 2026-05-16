"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, ShieldCheck, Zap, Lock, CheckCircle2, Coins, Tag, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CREDIT_PACKS } from "@/lib/pricing-constants";
import Link from "next/link";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CreditsPage() {
  const { user, loading, fetchUserProfile, setUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  const [selectedPack, setSelectedPack] = useState<typeof CREDIT_PACKS[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handlePackSelect = (pack: typeof CREDIT_PACKS[0]) => {
     setSelectedPack(pack);
     setAppliedCoupon(null);
     setCouponCode("");
     setIsModalOpen(true);
  };

  const confirmActivation = async () => {
    if (!scriptLoaded || !user || !selectedPack) return;
    
    const finalPrice = appliedCoupon ? Math.max(0, Math.round(selectedPack.price * (1 - appliedCoupon.discount / 100))) : selectedPack.price;
    
    setIsModalOpen(false);
    setProcessing(selectedPack.id);

    try {
        const orderRes = await fetch("/api/payments/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                userId: user.uuid, 
                planId: selectedPack.id, // Reusing planId field for pack ID
                amount: finalPrice,
                couponCode: appliedCoupon?.code,
                type: 'credit_topup' // Explicitly marking as topup
            }),
        });

        if (!orderRes.ok) throw new Error("Failed to create payment order.");
        const order = await orderRes.json();

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || order.key_id,
            amount: order.amount,
            currency: order.currency,
            name: "Jobs Dart Careers",
            description: `${selectedPack.name} - ${selectedPack.credits} Credits`,
            order_id: order.id,
            handler: async (response: any) => {
            try {
                const verifyRes = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...response,
                    userId: user.uuid,
                    planId: selectedPack.id,
                    couponCode: appliedCoupon?.code,
                    type: 'credit_topup'
                }),
                });

                if (verifyRes.ok) {
                toast({ title: "Purchase Successful!", description: `${selectedPack.credits} credits added to your account.` });
                const updatedProfile = await fetchUserProfile(user.uuid);
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
            theme: { color: "#6366f1" },
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
    <div className="min-h-screen bg-[#f8fafc] py-12 md:py-20 px-6 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-100/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-sky-100/30 rounded-full blur-[100px] translate-x-1/3 translate-y-1/2 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-start mb-12">
            <Button asChild variant="ghost" className="rounded-full text-slate-500 hover:text-slate-900 transition-colors">
                <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>
            </Button>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-white border border-slate-100 px-6 py-2.5 rounded-2xl shadow-sm flex items-center gap-3 border-l-4 border-l-indigo-500">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                        <Coins className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Balance</p>
                        <p className="text-lg font-black text-slate-800">
                            {((user as any).subscriptionCredits || 0) + ((user as any).purchasedCredits || 0)}
                        </p>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 px-6 py-2.5 rounded-2xl shadow-sm flex items-center gap-3 opacity-80">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500">
                        <Tag className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Subscription</p>
                        <p className="text-sm font-bold text-slate-600">{(user as any).subscriptionCredits || 0}</p>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 px-6 py-2.5 rounded-2xl shadow-sm flex items-center gap-3 opacity-80">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500">
                        <Zap className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Purchased</p>
                        <p className="text-sm font-bold text-slate-600">{(user as any).purchasedCredits || 0}</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="text-center mb-16 space-y-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl lg:text-6xl">
              Power up your <span className="text-indigo-600">job search.</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-xl mx-auto mt-4">
              Get more credits to unlock high-priority referrals and start direct conversations with employees.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CREDIT_PACKS.map((pack, idx) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="flex"
            >
              <Card className={cn(
                "relative flex flex-col w-full border border-slate-200 shadow-lg rounded-[2rem] overflow-hidden bg-white transition-all hover:shadow-2xl hover:-translate-y-1",
                pack.popular && "ring-4 ring-amber-400/30 border-amber-200 shadow-amber-200/20",
              )}>
                {pack.popular && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white px-5 py-1.5 rounded-bl-2xl text-[10px] font-black tracking-widest uppercase z-20">
                    Best Value
                  </div>
                )}
                
                <CardContent className="p-8 pb-0">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-6",
                    pack.color === 'sky' && "bg-sky-50 text-sky-600",
                    pack.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                    pack.color === 'amber' && "bg-amber-50 text-amber-600",
                    pack.color === 'indigo' && "bg-indigo-50 text-indigo-600"
                  )}>
                    <pack.icon className="w-7 h-7" />
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-800 mb-1">{pack.name}</h3>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-3xl font-black text-slate-900">{pack.credits}</span>
                    <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">Credits</span>
                  </div>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">{pack.description}</p>
                  
                  <div className="space-y-3 pt-6 border-t border-slate-50">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price</span>
                        <span className="text-2xl font-black text-indigo-600">₹{pack.price}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Per Credit</span>
                        <span className="text-xs font-bold text-slate-600">₹{pack.perCredit}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-8">
                  <Button
                    onClick={() => handlePackSelect(pack)}
                    disabled={!!processing || !scriptLoaded}
                    className={cn(
                      "w-full h-12 rounded-xl font-bold text-sm transition-all group",
                      pack.color === 'sky' && "bg-sky-500 hover:bg-sky-600 text-white shadow-sky-200 shadow-lg",
                      pack.color === 'emerald' && "bg-emerald-500 hover:bg-emerald-700 text-white shadow-emerald-200 shadow-lg",
                      pack.color === 'amber' && "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 shadow-lg",
                      pack.color === 'indigo' && "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 shadow-lg",
                    )}
                  >
                    {processing === pack.id ? (
                      <LoaderCircle className="w-5 h-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Get Credits
                        <Zap className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
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
             <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Secure Payment Powered by Razorpay</span>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">Checkout</DialogTitle>
            <DialogDescription>
              Adding {selectedPack?.credits} credits to your account.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPack && (
            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] overflow-hidden mt-2">
               <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", 
                        selectedPack.color === 'sky' ? "bg-sky-50 text-sky-600" : 
                        selectedPack.color === 'emerald' ? "bg-emerald-50 text-emerald-600" : 
                        selectedPack.color === 'amber' ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600")}>
                        <selectedPack.icon className="w-5 h-5" />
                     </div>
                     <div>
                        <div className="font-bold text-slate-900 leading-tight">{selectedPack.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedPack.credits} Credits</div>
                     </div>
                  </div>
                  <div className="text-xl font-black text-slate-900">
                      ₹{selectedPack.price}
                  </div>
               </div>

               <div className="p-6 space-y-5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Promo Code</label>
                    <div className="flex items-center gap-2">
                        <Input 
                            placeholder="Optional" 
                            value={couponCode}
                            onChange={e => setCouponCode(e.target.value.toUpperCase())}
                            className="bg-white uppercase font-bold tracking-wider rounded-xl h-11"
                            disabled={!!appliedCoupon}
                        />
                         {appliedCoupon ? (
                            <Button variant="ghost" className="text-rose-600 font-bold h-11 hover:bg-rose-50 rounded-xl" onClick={() => setAppliedCoupon(null)}>
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
                                            body: JSON.stringify({ code: couponCode, packId: selectedPack.id }) 
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
                                className="h-11 bg-slate-800 text-white hover:bg-slate-900 font-bold rounded-xl px-6"
                            >
                                {validatingCoupon ? <LoaderCircle className="w-4 h-4 animate-spin" /> : "Apply"}
                            </Button>
                        )}
                    </div>
                  </div>

                  {appliedCoupon && (
                      <div className="flex items-center justify-between text-indigo-600 font-bold text-sm">
                          <span className="flex items-center gap-1"><Tag className="w-4 h-4"/> Coupon Discount ({appliedCoupon.discount}%)</span>
                          <span>- ₹{Math.round(selectedPack.price * (appliedCoupon.discount / 100))}</span>
                      </div>
                  )}

                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                     <span className="font-bold text-slate-800">Total Payable</span>
                     <span className="text-3xl font-black text-slate-900 tracking-tight">
                         ₹{appliedCoupon ? Math.max(0, Math.round(selectedPack.price * (1 - appliedCoupon.discount / 100))) : selectedPack.price}
                     </span>
                  </div>
               </div>
            </div>
          )}

          <DialogFooter className="mt-4 gap-2">
             <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setIsModalOpen(false)}>Cancel</Button>
             <Button 
                onClick={confirmActivation} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-8 shadow-lg shadow-indigo-100"
             >
                <Lock className="w-4 h-4 mr-2 opacity-70" />
                Pay Securely
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
