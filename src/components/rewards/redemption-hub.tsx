"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, Zap, ChevronRight, CheckCircle, Trophy, Wallet, History, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface RedemptionHubProps {
    user: any;
    refreshUser: () => void;
    isPage?: boolean;
}

export function RedemptionHub({ user, refreshUser, isPage = false }: RedemptionHubProps) {
    const { toast } = useToast();
    const [redeemAmount, setRedeemAmount] = useState("");
    const [redeemMethod, setRedeemMethod] = useState("bank");
    const [redeemTab, setRedeemTab] = useState<'form' | 'history'>('form');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingTx, setLoadingTx] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bankDetails, setBankDetails] = useState({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: ''
    });
    const [upiDetails, setUpiDetails] = useState({
        upiId: '',
        upiHolderName: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchTransactions = async () => {
        if (!user) return;
        setLoadingTx(true);
        try {
            const res = await fetch(`/api/wallet/transactions?userId=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
            }
        } catch (err) {
            console.error("Failed to fetch transactions", err);
        } finally {
            setLoadingTx(false);
        }
    };

    useEffect(() => {
        if (redeemTab === 'history') {
            fetchTransactions();
        }
    }, [redeemTab]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const amount = parseFloat(redeemAmount);

        if (!redeemAmount || isNaN(amount)) {
            newErrors.amount = "Please enter a valid amount";
        } else if (amount < 500) {
            newErrors.amount = "Minimum withdrawal is ₹500";
        } else if (amount > (user?.rewardsBalance || 0)) {
            newErrors.amount = "Insufficient balance";
        }

        if (redeemMethod === 'bank') {
            if (!bankDetails.accountHolderName.trim()) newErrors.accountHolderName = "Required";
            if (!bankDetails.accountNumber.trim()) {
                newErrors.accountNumber = "Required";
            } else if (!/^\d{9,18}$/.test(bankDetails.accountNumber)) {
                newErrors.accountNumber = "Invalid account number (9-18 digits)";
            }
            if (!bankDetails.ifscCode.trim()) {
                newErrors.ifscCode = "Required";
            } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode)) {
                newErrors.ifscCode = "Invalid IFSC format (e.g. HDFC0001234)";
            }
            if (!bankDetails.bankName.trim()) newErrors.bankName = "Required";
        } else {
            if (!upiDetails.upiHolderName.trim()) newErrors.upiHolderName = "Required";
            if (!upiDetails.upiId.trim()) {
                newErrors.upiId = "Required";
            } else if (!/^[\w.-]+@[\w.-]+$/.test(upiDetails.upiId)) {
                newErrors.upiId = "Invalid UPI ID format";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRedeem = async () => {
        if (!validate()) return;
        const amount = parseFloat(redeemAmount);

        if (amount < 500) {
            toast({ 
                title: "Minimum Amount Required", 
                description: "The minimum amount to redeem is ₹500.", 
                variant: "destructive" 
            });
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch('/api/wallet/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    amount: amount,
                    method: redeemMethod,
                    details: redeemMethod === 'bank' ? bankDetails : upiDetails
                }),
            });

            const result = await response.json();
            
            if (!response.ok) throw new Error(result.error || 'Failed to process redemption');

            toast({ 
                title: "Request Submitted!", 
                description: "Your redemption request is being processed (1-3 days).",
                className: "bg-emerald-600 text-white border-none"
            });
            
            setRedeemAmount("");
            refreshUser(); 
            setRedeemTab('history');
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col h-full max-h-full min-h-0", isPage ? "bg-slate-50 min-h-screen" : "bg-white")}>
            <div className={cn("bg-slate-900 p-8 pb-10 relative", isPage ? "pt-12" : "")}>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-white leading-tight flex items-center gap-3">
                        Redemption Hub
                    </h2>
                    <p className="font-semibold text-slate-400 mt-2 text-sm">
                        Withdraw your hard-earned rewards securely.
                    </p>
                </div>

                <div className="flex bg-slate-800/80 backdrop-blur-md p-1.5 rounded-2xl mt-8 relative z-10 border border-white/5">
                    <button 
                        type="button"
                        onClick={() => setRedeemTab('form')}
                        className={cn(
                            "flex-1 py-2.5 text-xs uppercase tracking-wider font-black rounded-xl transition-all",
                            redeemTab === 'form' ? "bg-emerald-500 text-slate-900 shadow-md" : "text-slate-400 hover:text-white"
                        )}
                    >
                        Withdraw
                    </button>
                    <button 
                        type="button"
                        onClick={() => setRedeemTab('history')}
                        className={cn(
                            "flex-1 py-2.5 text-xs uppercase tracking-wider font-black rounded-xl transition-all",
                            redeemTab === 'history' ? "bg-emerald-500 text-slate-900 shadow-md" : "text-slate-400 hover:text-white"
                        )}
                    >
                        History
                    </button>
                </div>
            </div>

            <div className={cn("p-8 flex-1 overflow-y-auto custom-scrollbar min-h-0", isPage ? "max-w-2xl mx-auto w-full" : "")}>
                {redeemTab === 'form' ? (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div>
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">
                                Payout Amount <span className="text-emerald-600 ml-2 font-bold">(Min ₹500)</span>
                            </Label>
                            <div className="relative group/input">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl transition-colors group-focus-within/input:text-emerald-500">₹</span>
                                <Input 
                                    type="number" 
                                    placeholder="0" 
                                    className={cn(
                                        "pl-11 h-14 rounded-2xl border-2 bg-white focus:ring-0 font-black text-2xl text-slate-900 shadow-sm transition-all",
                                        errors.amount ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"
                                    )}
                                    value={redeemAmount}
                                    onChange={(e) => {
                                        setRedeemAmount(e.target.value);
                                        if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                                    }}
                                />
                            </div>
                            {errors.amount && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1 uppercase tracking-widest">{errors.amount}</p>}
                            <div className="flex items-center justify-between mt-3 px-1">
                                <p className="text-[10px] text-slate-500 font-bold bg-slate-200/50 px-2 py-1 rounded-md">Available: ₹{user?.rewardsBalance || 0}</p>
                                <button 
                                    type="button"
                                    onClick={() => setRedeemAmount(String(user?.rewardsBalance || 0))}
                                    className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-md transition-colors"
                                >
                                    Max Out
                                </button>
                            </div>
                        </div>

                        <div>
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Transfer Method</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {['bank', 'upi'].map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setRedeemMethod(m)}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden ${redeemMethod === m ? 'border-emerald-500 bg-emerald-50 shadow-md transform scale-[1.02]' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${redeemMethod === m ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                                            {m === 'bank' ? <Briefcase className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                                        </div>
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest", redeemMethod === m ? "text-emerald-700" : "text-slate-500")}>{m}</span>
                                        {redeemMethod === m && (
                                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {redeemMethod === 'bank' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-[10px] font-bold text-slate-500 uppercase">Account Holder Name</Label>
                                        <Input 
                                            className={cn("h-10 rounded-xl", errors.accountHolderName ? "border-red-500" : "border-slate-200")}
                                            value={bankDetails.accountHolderName}
                                            onChange={(e) => {
                                                setBankDetails({...bankDetails, accountHolderName: e.target.value});
                                                if (errors.accountHolderName) setErrors(prev => ({ ...prev, accountHolderName: '' }));
                                            }}
                                            placeholder="John Doe"
                                        />
                                        {errors.accountHolderName && <p className="text-red-500 text-[9px] font-bold">{errors.accountHolderName}</p>}
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-[10px] font-bold text-slate-500 uppercase">Account Number</Label>
                                        <Input 
                                            className={cn("h-10 rounded-xl", errors.accountNumber ? "border-red-500" : "border-slate-200")}
                                            value={bankDetails.accountNumber}
                                            onChange={(e) => {
                                                setBankDetails({...bankDetails, accountNumber: e.target.value});
                                                if (errors.accountNumber) setErrors(prev => ({ ...prev, accountNumber: '' }));
                                            }}
                                            placeholder="000000000000"
                                        />
                                        {errors.accountNumber && <p className="text-red-500 text-[9px] font-bold">{errors.accountNumber}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-500 uppercase">IFSC Code</Label>
                                        <Input 
                                            className={cn("h-10 rounded-xl", errors.ifscCode ? "border-red-500" : "border-slate-200")}
                                            value={bankDetails.ifscCode}
                                            onChange={(e) => {
                                                setBankDetails({...bankDetails, ifscCode: e.target.value.toUpperCase()});
                                                if (errors.ifscCode) setErrors(prev => ({ ...prev, ifscCode: '' }));
                                            }}
                                            placeholder="HDFC0001234"
                                        />
                                        {errors.ifscCode && <p className="text-red-500 text-[9px] font-bold">{errors.ifscCode}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-500 uppercase">Bank Name</Label>
                                        <Input 
                                            className={cn("h-10 rounded-xl", errors.bankName ? "border-red-500" : "border-slate-200")}
                                            value={bankDetails.bankName}
                                            onChange={(e) => {
                                                setBankDetails({...bankDetails, bankName: e.target.value});
                                                if (errors.bankName) setErrors(prev => ({ ...prev, bankName: '' }));
                                            }}
                                            placeholder="HDFC Bank"
                                        />
                                        {errors.bankName && <p className="text-red-500 text-[9px] font-bold">{errors.bankName}</p>}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {redeemMethod === 'upi' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-500 uppercase">UPI Holder Name</Label>
                                    <Input 
                                        className={cn("h-10 rounded-xl", errors.upiHolderName ? "border-red-500" : "border-slate-200")}
                                        value={upiDetails.upiHolderName}
                                        onChange={(e) => {
                                            setUpiDetails({...upiDetails, upiHolderName: e.target.value});
                                            if (errors.upiHolderName) setErrors(prev => ({ ...prev, upiHolderName: '' }));
                                        }}
                                        placeholder="John Doe"
                                    />
                                    {errors.upiHolderName && <p className="text-red-500 text-[9px] font-bold">{errors.upiHolderName}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-500 uppercase">UPI ID</Label>
                                    <Input 
                                        className={cn("h-10 rounded-xl", errors.upiId ? "border-red-500" : "border-slate-200")}
                                        value={upiDetails.upiId}
                                        onChange={(e) => {
                                            setUpiDetails({...upiDetails, upiId: e.target.value});
                                            if (errors.upiId) setErrors(prev => ({ ...prev, upiId: '' }));
                                        }}
                                        placeholder="username@upi"
                                    />
                                    {errors.upiId && <p className="text-red-500 text-[9px] font-bold">{errors.upiId}</p>}
                                </div>
                            </motion.div>
                        )}

                        <Button 
                            onClick={handleRedeem}
                            disabled={loading || !redeemAmount}
                            className="w-full bg-slate-900 hover:bg-black text-white h-14 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-slate-300 transition-transform active:scale-[0.98] mt-4"
                        >
                            {loading ? "Processing..." : `Confirm ₹${redeemAmount || '0'} Transfer`}
                        </Button>
                        <div className="h-8" />
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                        {loadingTx ? (
                            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl bg-slate-200/50" />)
                        ) : transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <div key={tx.id} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 capitalize group-hover:bg-slate-100 transition-colors">
                                            {tx.method === 'bank' ? <Briefcase className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-slate-900 tracking-tight">₹{tx.amount}</p>
                                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest mt-0.5">
                                                {tx.method} <span className="w-1 h-1 rounded-full bg-slate-300" /> {format(new Date(tx.created_at), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className={cn(
                                        "rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm",
                                        tx.status === 'pending' ? "bg-amber-100 text-amber-700 border-amber-200" : 
                                        tx.status === 'completed' ? "bg-emerald-100 text-emerald-700 border-emerald-200" : 
                                        "bg-red-100 text-red-700 border-red-200"
                                    )}>
                                        {tx.status}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 px-6">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <History className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-slate-900 font-black text-lg">No history yet</h3>
                                <p className="text-slate-400 text-sm font-semibold mt-1">Your withdrawal requests will appear here.</p>
                            </div>
                        )}
                        <div className="h-8" />
                    </motion.div>
                )}
            </div>
        </div>
    );
}
