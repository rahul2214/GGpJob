"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, ShieldAlert, ArrowLeft, Save, Edit2, Coins, Briefcase, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

// Metadata mapping for grouping and display names
const PLAN_METADATA: Record<string, { name: string; type: string; category: string; description: string }> = {
  'free': { name: 'Free Plan', type: 'Plan', category: 'Recruiter', description: 'Default free posting' },
  'basic': { name: 'Basic Plan', type: 'Plan', category: 'Recruiter', description: 'Single job posting' },
  'premium': { name: 'Premium Plan', type: 'Plan', category: 'Recruiter', description: 'Standard hiring plan' },
  'pro': { name: 'Pro Recruitment', type: 'Plan', category: 'Recruiter', description: 'Unlimited premium hiring' },

  

  
  'mini': { name: 'Mini Credit Pack', type: 'Credits', category: 'Job Seeker Pack', description: '10 credits for referrals and topups' },
  'popular_pack': { name: 'Popular Credit Pack', type: 'Credits', category: 'Job Seeker Pack', description: '60 credits for referrals and topups' },
  'pro_pack': { name: 'Pro Credit Pack', type: 'Credits', category: 'Job Seeker Pack', description: '150 credits for referrals and topups' },
  
  'employee_starter': { name: 'Starter Boost Pack', type: 'Credits', category: 'Employee Pack', description: '50 boost credits for matching referrers' },
  'employee_double': { name: 'Double Boost Pack', type: 'Credits', category: 'Employee Pack', description: '100 boost credits for matching referrers' },
  'employee_pro': { name: 'Pro Boost Pack', type: 'Credits', category: 'Employee Pack', description: '250 boost credits for matching referrers' },
  'employee_enterprise': { name: 'Enterprise Boost Pack', type: 'Credits', category: 'Employee Pack', description: '600 boost credits for matching referrers' },
};

export default function AdminPlansPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/prices');
      if (!res.ok) throw new Error("Failed to load prices");
      const data = await res.json();
      setPrices(data.prices || {});
    } catch (err: any) {
      toast({
        title: "Load Failed",
        description: err.message || "Failed to query plans from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push('/admin/login');
      } else if (!isAdmin) {
        router.push('/');
      } else {
        fetchPrices();
      }
    }
  }, [user, userLoading, router, isAdmin]);

  const handleStartEdit = (id: string, currentPrice: number) => {
    setEditingId(id);
    setEditingPrice(String(currentPrice));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingPrice("");
  };

  const handleSavePrice = async (planId: string) => {
    const numericPrice = parseFloat(editingPrice);
    if (isNaN(numericPrice) || numericPrice < 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid non-negative number.",
        variant: "destructive"
      });
      return;
    }

    setUpdatingId(planId);
    try {
      const meta = PLAN_METADATA[planId] || { name: planId };
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, price: numericPrice, name: meta.name })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update price.");
      }

      toast({
        title: "Price Updated",
        description: `Price for plan "${planId}" updated successfully to $${numericPrice}.`
      });

      setPrices(prev => ({ ...prev, [planId]: numericPrice }));
      setEditingId(null);
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="max-w-md mx-auto mt-20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <ShieldAlert className="w-6 h-6" /> Access Denied
          </CardTitle>
          <CardDescription>
            You do not have permissions to access the Admin Panel.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Group prices by category
  const categories = {
    'Recruiter': [] as string[],
    'Job Seeker': [] as string[],
    'Job Seeker Pack': [] as string[],
    'Employee Pack': [] as string[],
    'Other': [] as string[]
  };

  Object.keys(prices).forEach(key => {
    const meta = PLAN_METADATA[key];
    const category = meta ? meta.category : 'Other';
    if (categories[category as keyof typeof categories]) {
      categories[category as keyof typeof categories].push(key);
    } else {
      categories['Other'].push(key);
    }
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/admin/dashboard')}
            className="-ml-3 text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Plans & Pricing Manager</h1>
          <p className="text-slate-500 text-sm">Update plan values in USD (Base Currency). All international currencies will scale dynamically.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPrices} className="self-start sm:self-center">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Rates
        </Button>
      </div>

      {Object.entries(categories).map(([categoryName, keys]) => {
        if (keys.length === 0) return null;
        return (
          <div key={categoryName} className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-800 border-b pb-2 flex items-center gap-2">
              {categoryName.includes('Pack') ? <Coins className="w-5 h-5 text-amber-500" /> : <Briefcase className="w-5 h-5 text-indigo-500" />}
              {categoryName} {categoryName.includes('Pack') ? 'Packages' : 'Plans'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {keys.map((id) => {
                const meta = PLAN_METADATA[id] || { name: id, description: 'Dynamic Plan', type: 'Other' };
                const currentPrice = prices[id];
                const isEditing = editingId === id;
                const isUpdating = updatingId === id;

                return (
                  <motion.div
                    key={id}
                    layout
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="h-full flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-2xl border-slate-200/65">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {meta.type}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">ID: {id}</span>
                        </div>
                        <CardTitle className="text-lg font-bold text-slate-800 mt-2">{meta.name}</CardTitle>
                        <CardDescription className="text-xs text-slate-500 min-h-[32px] line-clamp-2">
                          {meta.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="py-2 flex-grow flex items-center justify-between bg-slate-50/50 border-y border-slate-100 px-6 h-16">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Base Price:</span>
                        {isEditing ? (
                          <div className="flex items-center gap-2 max-w-[120px]">
                            <span className="text-lg font-extrabold text-slate-700">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingPrice}
                              onChange={(e) => setEditingPrice(e.target.value)}
                              className="h-9 font-extrabold rounded-xl text-right bg-white text-base"
                            />
                          </div>
                        ) : (
                          <span className="text-2xl font-black text-indigo-600 tracking-tight">
                            ${currentPrice.toFixed(2)} <span className="text-[10px] font-bold text-slate-400">USD</span>
                          </span>
                        )}
                      </CardContent>

                      <CardFooter className="p-4 bg-white flex justify-end gap-2 px-6">
                        {isEditing ? (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={handleCancelEdit}
                              className="text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleSavePrice(id)}
                              disabled={isUpdating}
                              className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-xl shadow-md shadow-indigo-100"
                            >
                              {isUpdating ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1.5" /> Save</>}
                            </Button>
                          </>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleStartEdit(id, currentPrice)}
                            className="rounded-xl border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Edit Price
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
