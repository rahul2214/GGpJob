"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
    Banknote, 
    CreditCard, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ExternalLink, 
    Search,
    ChevronLeft,
    Wallet
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function AdminPayoutsPage() {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedPayout, setSelectedPayout] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");
    const [processing, setProcessing] = useState(false);

    const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/payouts');
            if (res.ok) {
                const data = await res.json();
                setPayouts(data);
            }
        } catch (err) {
            console.error("Failed to fetch payouts", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && !isAdmin) {
            router.push('/');
            return;
        }
        fetchPayouts();
    }, [user, isAdmin, router]);

    const handleUpdateStatus = async (payoutId: string, status: string) => {
        setProcessing(true);
        try {
            const res = await fetch('/api/admin/payouts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payoutId, status, adminNotes })
            });

            if (res.ok) {
                toast({ title: "Success", description: `Payout marked as ${status}.` });
                setIsDetailsOpen(false);
                setSelectedPayout(null);
                setAdminNotes("");
                fetchPayouts();
            } else {
                const error = await res.json();
                throw new Error(error.error || "Update failed");
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setProcessing(false);
        }
    };

    const filteredPayouts = payouts.filter(p => 
        p.method !== 'system' && (
            p.employees?.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.employees?.email?.toLowerCase().includes(search.toLowerCase()) ||
            p.method?.toLowerCase().includes(search.toLowerCase()) ||
            p.status?.toLowerCase().includes(search.toLowerCase())
        )
    );

    if (!isAdmin) return null;

    return (
        <div className="space-y-6 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Employee Payouts</h1>
                        <p className="text-slate-500 font-medium text-sm">Manage withdrawal requests and manual payments.</p>
                    </div>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Search employee or status..." 
                        className="pl-10 h-11 rounded-2xl border-slate-200 bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden rounded-[2rem]">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Withdrawal Requests</CardTitle>
                            <CardDescription className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
                                {filteredPayouts.length} total requests
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={fetchPayouts} className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-9">
                            Refresh Data
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 border-b border-slate-100 hover:bg-slate-50/50">
                                <TableHead className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Employee</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Method</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</TableHead>
                                <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i} className="border-b border-slate-50">
                                        <TableCell colSpan={6} className="py-8 px-8"><div className="h-6 w-full bg-slate-100 animate-pulse rounded-lg" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredPayouts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                <Wallet className="h-8 w-8" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No payout requests found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPayouts.map((payout) => (
                                    <TableRow key={payout.id} className="border-b border-slate-50 hover:bg-slate-50/50 group transition-colors">
                                        <TableCell className="py-5 px-8">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 tracking-tight">{payout.employees?.name}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{payout.employees?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-lg font-black text-slate-900 tracking-tighter">₹{payout.amount}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn(
                                                "rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border-none shadow-sm",
                                                payout.method === 'bank' ? "bg-indigo-50 text-indigo-700" : "bg-sky-50 text-sky-700"
                                            )}>
                                                {payout.method === 'bank' ? <Banknote className="w-3 h-3 mr-1" /> : <CreditCard className="w-3 h-3 mr-1" />}
                                                {payout.method}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(
                                                "rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm",
                                                payout.status === 'pending' ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : 
                                                payout.status === 'completed' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : 
                                                "bg-red-100 text-red-700 hover:bg-red-100"
                                            )}>
                                                {payout.status === 'pending' && <Clock className="w-3 h-3 mr-1.5" />}
                                                {payout.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1.5" />}
                                                {payout.status === 'rejected' && <XCircle className="w-3 h-3 mr-1.5" />}
                                                {payout.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {format(new Date(payout.created_at), 'MMM d, yyyy')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            <Button 
                                                variant="secondary" 
                                                size="sm" 
                                                className="rounded-xl h-9 px-4 font-bold uppercase tracking-widest text-[10px] transition-all"
                                                onClick={() => {
                                                    setSelectedPayout(payout);
                                                    setIsDetailsOpen(true);
                                                }}
                                            >
                                                Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-lg bg-white border-none shadow-2xl rounded-[2rem] p-0 flex flex-col max-h-[90vh] overflow-hidden">
                    {selectedPayout && (
                        <>
                            <div className="bg-slate-900 p-8 relative overflow-hidden shrink-0">
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
                                <DialogHeader className="relative z-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge className="bg-white/10 text-white border-white/10 px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                                            {selectedPayout.status} Request
                                        </Badge>
                                    </div>
                                    <DialogTitle className="text-3xl font-black text-white leading-tight">
                                        Payout Details
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">
                                        Review and confirm manual transfer
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</p>
                                        <p className="font-black text-slate-900 tracking-tight">{selectedPayout.employees?.name}</p>
                                        <p className="text-xs text-slate-500 font-medium">{selectedPayout.employees?.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payout Amount</p>
                                        <p className="text-2xl font-black text-indigo-600 tracking-tighter">₹{selectedPayout.amount}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        {selectedPayout.method === 'bank' ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                                        Payment Information ({selectedPayout.method})
                                    </p>
                                    
                                    {selectedPayout.method === 'bank' ? (
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Account Holder</p>
                                                <p className="text-sm font-black text-slate-900">{selectedPayout.holder_name}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Bank Name</p>
                                                <p className="text-sm font-black text-slate-900">{selectedPayout.bank_name}</p>
                                            </div>
                                            <div className="space-y-1 col-span-2">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Account Number</p>
                                                <p className="text-base font-black text-indigo-600 font-mono tracking-wider">{selectedPayout.account_number}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">IFSC Code</p>
                                                <p className="text-sm font-black text-slate-900">{selectedPayout.ifsc_code}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">UPI Holder Name</p>
                                                <p className="text-sm font-black text-slate-900">{selectedPayout.holder_name}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">UPI ID</p>
                                                <p className="text-lg font-black text-indigo-600 tracking-tight">{selectedPayout.upi_id}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {selectedPayout.status === 'pending' && (
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Notes (Visible to employee)</Label>
                                        <Input 
                                            placeholder="Txn ID: 12345 or reason for rejection..."
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            className="h-12 rounded-xl border-slate-200"
                                        />
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 gap-3">
                                {selectedPayout.status === 'pending' ? (
                                    <>
                                        <Button 
                                            variant="outline" 
                                            className="rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 font-black text-[10px] uppercase tracking-widest h-12 flex-1"
                                            onClick={() => handleUpdateStatus(selectedPayout.id, 'rejected')}
                                            disabled={processing}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject
                                        </Button>
                                        <Button 
                                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest h-12 flex-1 shadow-lg shadow-emerald-100"
                                            onClick={() => handleUpdateStatus(selectedPayout.id, 'completed')}
                                            disabled={processing}
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Mark Paid
                                        </Button>
                                    </>
                                ) : (
                                    <Button 
                                        variant="outline" 
                                        className="w-full rounded-xl h-12 font-black text-[10px] uppercase tracking-widest"
                                        onClick={() => setIsDetailsOpen(false)}
                                    >
                                        Close Details
                                    </Button>
                                )}
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
