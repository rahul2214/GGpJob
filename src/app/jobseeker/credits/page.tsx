"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Lock, Coins, Tag, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CREDIT_PACKS } from "@/lib/pricing-constants";
import Link from "next/link";
import { CurrencySelector } from "@/components/currency-selector";
import { formatPrice, convertPrice } from "@/utils/currency";
import { PayPalPaymentButton } from "@/components/paypal-payment-button";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CreditsPage() {
  const { user, loading, fetchUserProfile, setUser, currency, exchangeRates } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  const [packs, setPacks] = useState<any[]>(CREDIT_PACKS);
  const [selectedPack, setSelectedPack] = useState<typeof CREDIT_PACKS[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/payments/prices')
      .then(res => res.json())
      .then(data => {
        if (data?.prices) {
          setPacks(prev => prev.map(pack => {
            const dbPrice = data.prices[pack.id];
            if (dbPrice !== undefined) {
              return { ...pack, price: dbPrice };
            }
            return pack;
          }));
        }
      })
      .catch(err => console.warn('Failed to fetch pack prices:', err));
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

  const handlePackSelect = (pack: typeof CREDIT_PACKS[0]) => {
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
        throw new Error("Verification failed.");
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
    <div className="min-h-screen bg-[#f8fafc] py-20 px-6 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-100/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Link href="/profile" className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Profile
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Currency:</span>
            <CurrencySelector />
          </div>
        </div>

        <div className="text-center mb-16 space-y-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Coins className="w-6 h-6" />
              </div>
              Top-up Credits
            </h1>
            <p className="text-slate-500 text-lg max-w-xl mx-auto mt-4">
              Get additional credits to fast-track your job applications and boost your profile visibility.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {packs.map((pack, idx) => {
            const convertedPrice = convertPrice(pack.price, currency, exchangeRates);
            const formattedPrice = formatPrice(convertedPrice, currency);

            return (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="flex"
              >
                <Card className={cn(
                  "relative flex flex-col w-full border border-slate-200 shadow-xl rounded-[2.5rem] overflow-hidden bg-white transition-all hover:scale-[1.02]",
                  pack.popular && "ring-4 ring-amber-400/30 shadow-amber-200/40 border-none"
                )}>
                  {pack.popular && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-white px-6 py-2 rounded-bl-[1.5rem] text-xs font-bold tracking-widest uppercase z-20">
                      Best Value
                    </div>
                  )}

                  <div className={cn(
                    "p-8 text-white text-center",
                    pack.color === 'sky' && "bg-gradient-to-br from-sky-500 to-blue-600",
                    pack.color === 'amber' && "bg-gradient-to-br from-amber-500 to-orange-600",
                    pack.color === 'indigo' && "bg-gradient-to-br from-indigo-600 to-purple-700"
                  )}>
                    <h3 className="text-2xl font-bold mb-1">{pack.name}</h3>
                    <p className="text-white/80 text-xs leading-relaxed mb-6">{pack.description}</p>
                    
                    <div className="text-5xl font-black tracking-tighter text-white mb-2">
                      {pack.credits}
                    </div>
                    <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider block">
                      Credits Pack
                    </span>
                  </div>

                  <CardContent className="p-8 flex-grow flex flex-col justify-center items-center text-center">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Price</p>
                      <p className="text-3xl font-black text-slate-900">{formattedPrice}</p>
                    </div>
                  </CardContent>

                  <CardFooter className="p-8 pt-0">
                    <Button
                      onClick={() => handlePackSelect(pack)}
                      disabled={!!processing}
                      className={cn(
                        "w-full h-12 rounded-2xl font-bold text-base transition-all text-white",
                        pack.color === 'sky' && "bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-200",
                        pack.color === 'amber' && "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200",
                        pack.color === 'indigo' && "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                      )}
                    >
                      {processing === pack.id ? (
                        <LoaderCircle className="w-5 h-5 animate-spin" />
                      ) : (
                        <span>Buy Pack</span>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
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
                                            body: JSON.stringify({ code: couponCode, planId: selectedPack.id }) 
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
             {currency.toUpperCase() !== 'INR' ? (
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
                  className="w-full h-12 text-white bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl shadow-lg shadow-indigo-200"
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
