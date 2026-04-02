"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle, Award, Plus, Calendar, Percent, Hash, Target, Trash2, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  expiresAt: string;
  maxUses: number;
  currentUses: number;
  applicablePlan?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [fetching, setFetching] = useState(true);
  
  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountPercent: "",
    expiresAt: "",
    maxUses: "",
    applicablePlan: "all",
    isActive: "true"
  });

  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'Admin' && user.role !== 'Super Admin'))) {
      router.push('/');
    } else if (user) {
      loadCoupons();
    }
  }, [user, loading, router]);

  const loadCoupons = async () => {
    try {
      setFetching(true);
      const res = await fetch(`/api/coupons?userId=${user?.id}`);
      if (!res.ok) throw new Error("Failed to load coupons");
      const data = await res.json();
      setCoupons(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const url = editingCoupon ? `/api/coupons/${editingCoupon.id}` : "/api/coupons";
      const method = editingCoupon ? "PUT" : "POST";
      
      const payload: any = { ...formData, userId: user.id };
      if (editingCoupon) payload.isActive = formData.isActive === "true";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${editingCoupon ? 'update' : 'create'} coupon`);

      toast({ title: "Success", description: `Coupon ${editingCoupon ? 'updated' : 'created'} successfully.` });
      setIsDialogOpen(false);
      setEditingCoupon(null);
      setFormData({ code: "", discountPercent: "", expiresAt: "", maxUses: "", applicablePlan: "all", isActive: "true" });
      loadCoupons();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
      if (!confirm(`Are you sure you want to completely delete the coupon '${code}'? This breaks checkout history matching.`)) return;
      if (!user) return;
      
      try {
          const res = await fetch(`/api/coupons/${id}?userId=${user.id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error("Failed to delete coupon");
          toast({ title: "Deleted", description: "Coupon deleted successfully." });
          loadCoupons();
      } catch (error: any) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
      }
  };

  const openCreateDialog = () => {
      setEditingCoupon(null);
      setFormData({ code: "", discountPercent: "", expiresAt: "", maxUses: "", applicablePlan: "all", isActive: "true" });
      setIsDialogOpen(true);
  };

  const openEditDialog = (c: Coupon) => {
      setEditingCoupon(c);
      setFormData({
          code: c.code,
          discountPercent: c.discountPercent.toString(),
          expiresAt: c.expiresAt.split('T')[0],
          maxUses: c.maxUses.toString(),
          applicablePlan: c.applicablePlan || 'all',
          isActive: c.isActive ? "true" : "false"
      });
      setIsDialogOpen(true);
  };

  if (loading || fetching) return <div className="p-8 flex items-center justify-center"><LoaderCircle className="animate-spin w-8 h-8 text-indigo-600" /></div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Coupons</h1>
            <p className="text-slate-500 text-sm mt-1">Create and monitor discount codes for marketing campaigns.</p>
          </div>
        </div>

        {user?.role === 'Super Admin' && (
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
             <Button onClick={openCreateDialog} className="bg-indigo-600 hover:bg-indigo-700">
               <Plus className="w-4 h-4 mr-2" />
               New Coupon
             </Button>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>{editingCoupon ? "Edit Marketing Coupon" : "Create Marketing Coupon"}</DialogTitle>
             </DialogHeader>
             <form onSubmit={handleSave} className="space-y-4 pt-4">
               <div className="space-y-2">
                 <label className="text-sm font-semibold">Coupon Code</label>
                 <Input 
                    placeholder="e.g. LAUNCH50" 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    required
                    disabled={!!editingCoupon}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-semibold flex items-center gap-2"><Percent className="w-4 h-4"/> Discount Percentage</label>
                 <Input 
                    type="number" 
                    min="1" max="100" 
                    placeholder="e.g. 50"
                    value={formData.discountPercent} 
                    onChange={e => setFormData({...formData, discountPercent: e.target.value})}
                    required
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-semibold flex items-center gap-2"><Calendar className="w-4 h-4"/> Expiration Date</label>
                 <Input 
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.expiresAt} 
                    onChange={e => setFormData({...formData, expiresAt: e.target.value})}
                    required
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-semibold flex items-center gap-2"><Hash className="w-4 h-4"/> Max Uses</label>
                 <Input 
                    type="number" 
                    min="1"
                    placeholder="e.g. 100"
                    value={formData.maxUses} 
                    onChange={e => setFormData({...formData, maxUses: e.target.value})}
                    required
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-semibold flex items-center gap-2"><Target className="w-4 h-4"/> Target Plan</label>
                 <select 
                    value={formData.applicablePlan} 
                    onChange={e => setFormData({...formData, applicablePlan: e.target.value})}
                    required
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                 >
                    <option value="all">All Plans (Global)</option>
                    <option value="basic">Recruiter - Basic Plan</option>
                    <option value="talent">Recruiter - Talent Search</option>
                    <option value="premium">Recruiter - Premium Plan</option>
                    <option value="pro">Recruiter - Pro Recruitment</option>
                    <option value="jobseeker_premium">Job Seeker - Premium</option>
                 </select>
               </div>
               
               {editingCoupon && (
                   <div className="space-y-2">
                     <label className="text-sm font-semibold flex items-center gap-2">Status</label>
                     <select 
                        value={formData.isActive} 
                        onChange={e => setFormData({...formData, isActive: e.target.value})}
                        required
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                     >
                        <option value="true">Active</option>
                        <option value="false">Deactivated</option>
                     </select>
                   </div>
               )}

               <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                 {isSubmitting ? <LoaderCircle className="w-4 h-4 animate-spin mr-2" /> : null}
                 {editingCoupon ? "Update Coupon" : "Generate Coupon"}
               </Button>
             </form>
           </DialogContent>
         </Dialog>
        )}
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Target Plan</TableHead>
              <TableHead>Usage Limits</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No coupons found. Click "New Coupon" to create one.
                    </TableCell>
                </TableRow>
            ) : (
                coupons.map((coupon) => {
                    const isExpired = new Date(coupon.expiresAt) < new Date();
                    const isMaxedOut = coupon.currentUses >= coupon.maxUses;
                    const isValid = !isExpired && !isMaxedOut && coupon.isActive;

                    return (
                        <TableRow key={coupon.id}>
                            <TableCell className="font-bold text-indigo-700 tracking-wider">
                                {coupon.code}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-none">
                                    {coupon.discountPercent}% OFF
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                                    {coupon.applicablePlan === 'all' || !coupon.applicablePlan ? 'All Plans' : 
                                     coupon.applicablePlan === 'basic' ? 'RC - Basic' : 
                                     coupon.applicablePlan === 'premium' ? 'RC - Premium' : 
                                     coupon.applicablePlan === 'pro' ? 'RC - Pro' : 
                                     coupon.applicablePlan === 'talent' ? 'RC - Talent' : 
                                     coupon.applicablePlan === 'jobseeker_premium' ? 'JS - Premium' : coupon.applicablePlan}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <span className={isMaxedOut ? "text-red-500 font-semibold" : "text-slate-600"}>
                                    {coupon.currentUses}
                                </span>
                                <span className="text-slate-400"> / {coupon.maxUses} uses</span>
                            </TableCell>
                            <TableCell className={isExpired ? "text-red-500 font-medium" : ""}>
                                {format(new Date(coupon.expiresAt), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>
                                {isValid ? (
                                    <Badge className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
                                ) : (
                                    <Badge variant="destructive">
                                        {isExpired ? "Expired" : isMaxedOut ? "Limit Reached" : "Deactivated"}
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(coupon)}>
                                    <Edit2 className="w-4 h-4 text-slate-500 hover:text-indigo-600" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id, coupon.code)}>
                                    <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-600" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                })
            )}
            
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
