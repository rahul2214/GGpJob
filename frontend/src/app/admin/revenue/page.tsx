"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Coins, TrendingUp, Receipt, Users, Search, Tag, Calendar, 
  DollarSign, CreditCard, CheckCircle, ArrowUpDown, Filter, Sparkles, Wallet, Percent, ArrowUpRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "@/components/animated-counter";

interface Transaction {
  id: number;
  uuid: string;
  userId?: string;
  orderId: string;
  paymentId: string;
  amount: number;
  planId: string;
  couponCode?: string;
  timestamp: string;
}

interface PlanRevenue {
  name: string;
  value: number;
  count: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  payouts: number;
  profit: number;
  transactions: number;
}

interface RevenueData {
  totalRevenue: number;
  totalPayouts: number;
  pendingPayouts: number;
  pendingPayoutsCount: number;
  netRevenue: number;
  totalTransactions: number;
  paidTransactions: number;
  freeOrDiscountedTransactions: number;
  averageOrderValue: number;
  uniquePayingUsers: number;
  revenueByPlan: PlanRevenue[];
  monthlyTrend: MonthlyRevenue[];
  recentTransactions: Transaction[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
        <p className="text-xs font-bold uppercase text-slate-400 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 py-1 text-sm">
            <span className="font-semibold text-slate-600 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-black text-slate-900">
              {typeof entry.value === 'number' ? `₹${Number(entry.value).toLocaleString('en-IN')}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminRevenuePage() {
  const { user } = useUser();
  const router = useRouter();
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState("ALL");

  const isAdminOrSuperAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

  useEffect(() => {
    if (user && !isAdminOrSuperAdmin) {
      router.push('/');
    }
  }, [user, router, isAdminOrSuperAdmin]);

  const fetchRevenueData = async () => {
    if (!isAdminOrSuperAdmin) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/revenue');
      if (!res.ok) throw new Error("Failed to fetch revenue analytics");
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Failed to fetch revenue data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [user, isAdminOrSuperAdmin]);

  const filteredTransactions = useMemo(() => {
    if (!data?.recentTransactions) return [];
    let list = data.recentTransactions;

    if (selectedPlanFilter !== "ALL") {
      list = list.filter(t => (t.planId || '').toUpperCase() === selectedPlanFilter);
    }

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      list = list.filter(t => 
        t.orderId.toLowerCase().includes(query) ||
        t.paymentId.toLowerCase().includes(query) ||
        (t.planId && t.planId.toLowerCase().includes(query)) ||
        (t.couponCode && t.couponCode.toLowerCase().includes(query))
      );
    }

    return list;
  }, [data, searchTerm, selectedPlanFilter]);

  const planFilters = useMemo(() => {
    if (!data?.recentTransactions) return ["ALL"];
    const plans = new Set<string>();
    data.recentTransactions.forEach(t => plans.add((t.planId || 'UNSPECIFIED').toUpperCase()));
    return ["ALL", ...Array.from(plans)];
  }, [data]);

  if (loading || !data) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-3xl p-6 border-slate-100 shadow-sm"><Skeleton className="h-20 w-full" /></Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-3xl p-6"><Skeleton className="h-[350px] w-full" /></Card>
          <Card className="rounded-3xl p-6"><Skeleton className="h-[350px] w-full" /></Card>
        </div>
      </div>
    );
  }

  const marginPercentage = data.totalRevenue > 0 ? Math.round((data.netRevenue / data.totalRevenue) * 100) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Title Header with Net Profit & Gross Metrics */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2.5 bg-indigo-500/20 px-3.5 py-1.5 rounded-full w-max border border-indigo-400/30">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span className="text-xs font-black uppercase tracking-widest text-indigo-200">Financial Hub & Payouts</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">Net Profit & Margin Intelligence</h1>
            <p className="text-slate-300 text-sm font-medium">
              Real-time platform revenue minus insider employee payouts. Complete transparent oversight of business margin health.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Net Revenue / Profit Card */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 backdrop-blur-md p-6 rounded-2xl border border-emerald-400/30 flex-1 sm:flex-initial">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-black uppercase text-emerald-300 tracking-wider">Net Platform Profit</span>
                <span className="text-[11px] font-black bg-emerald-400/20 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <Percent className="w-3 h-3" /> {marginPercentage}% Margin
                </span>
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white mt-1.5 font-mono">
                ₹{data.netRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] font-bold text-emerald-200/80 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> Gross Income minus Completed Payouts
              </div>
            </div>

            {/* Breakdown Mini Cards */}
            <div className="flex sm:flex-col gap-3 justify-center">
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 flex-1 sm:flex-initial">
                <div className="text-[10px] font-bold uppercase text-slate-300 tracking-wider">Gross Platform Revenue</div>
                <div className="text-xl font-black text-white mt-0.5 font-mono">₹{data.totalRevenue.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-rose-500/15 backdrop-blur-md px-5 py-3 rounded-xl border border-rose-400/20 flex-1 sm:flex-initial">
                <div className="text-[10px] font-bold uppercase text-rose-300 tracking-wider">Completed Payouts</div>
                <div className="text-xl font-black text-rose-200 mt-0.5 font-mono">₹{data.totalPayouts.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 bg-white group hover:scale-[1.02] transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-wider">Total Orders</CardTitle>
            <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Receipt className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900"><AnimatedCounter value={data.totalTransactions} /></div>
            <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-600 font-black">{data.paidTransactions} Paid</span> • <span>{data.freeOrDiscountedTransactions} Free</span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 bg-white group hover:scale-[1.02] transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-wider">Average Order Value</CardTitle>
            <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">₹{data.averageOrderValue.toLocaleString('en-IN')}</div>
            <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> High conversion health
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 bg-white group hover:scale-[1.02] transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-wider">Active Buyers</CardTitle>
            <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900"><AnimatedCounter value={data.uniquePayingUsers} /></div>
            <p className="text-xs font-bold text-slate-400 mt-1">Unique purchasing accounts</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 bg-white group hover:scale-[1.02] transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase text-rose-500 tracking-wider">Pending Payout Review</CardTitle>
            <div className="p-2.5 bg-rose-50 rounded-2xl text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Wallet className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-600">₹{data.pendingPayouts.toLocaleString('en-IN')}</div>
            <p className="text-xs font-bold text-slate-400 mt-1">{data.pendingPayoutsCount} requests awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-6 sm:p-8">
          <CardHeader className="px-0 pt-0 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900">Gross Revenue vs Payouts Trend</CardTitle>
                <CardDescription className="text-slate-500 font-medium text-xs mt-1">Monthly comparison of incoming cash vs employee reward disbursements.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={data.monthlyTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorPayouts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="payouts" name="Employee Payouts" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorPayouts)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-6 sm:p-8">
          <CardHeader className="px-0 pt-0 pb-6">
            <CardTitle className="text-xl font-black text-slate-900">Revenue Breakdown by Product Plan</CardTitle>
            <CardDescription className="text-slate-500 font-medium text-xs mt-1">Volume and gross earnings contribution across subscription tiers.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={data.revenueByPlan}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={6}
                  dataKey="value"
                  nameKey="name"
                >
                  {data.revenueByPlan.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend 
                  formatter={(value, entry: any) => (
                    <span className="text-xs font-bold text-slate-700 ml-1.5">
                      {value} <span className="text-slate-400 font-semibold">({entry.payload?.count || 0} orders)</span>
                    </span>
                  )}
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Ledger Table */}
      <Card className="rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100/80 p-6 sm:p-8 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Transaction Ledger</CardTitle>
              <CardDescription className="text-slate-500 text-sm font-medium mt-1">
                Detailed record of all payments, free redemptions, coupons, and subscription activations.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search Order ID, Coupon..."
                  className="pl-10 h-11 rounded-xl bg-white border-slate-200 sm:w-[240px] text-sm shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Plan Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-6">
            {planFilters.map((plan) => (
              <Button
                key={plan}
                variant={selectedPlanFilter === plan ? "default" : "outline"}
                onClick={() => setSelectedPlanFilter(plan)}
                className={`rounded-xl h-9 px-4 text-xs font-black transition-all ${selectedPlanFilter === plan ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
              >
                {plan === "ALL" ? "All Transactions" : plan}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 my-6 mx-6 rounded-3xl border border-dashed border-slate-200">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No Transactions Found</h3>
              <p className="text-slate-400 text-sm mt-1">No orders matched your search or plan filter criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 bg-slate-50/50">
                  <TableHead className="font-bold text-slate-700">Order ID & Status</TableHead>
                  <TableHead className="font-bold text-slate-700">Plan Product</TableHead>
                  <TableHead className="font-bold text-slate-700">Coupon Code</TableHead>
                  <TableHead className="font-bold text-slate-700">Timestamp</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Amount Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((t) => (
                  <TableRow key={t.uuid} className="hover:bg-slate-50/80 transition-colors group">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${t.amount > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                          {t.amount > 0 ? <Coins className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors font-mono text-xs max-w-[220px] truncate">
                            {t.orderId}
                          </div>
                          <div className="text-[11px] font-bold mt-0.5">
                            {t.amount > 0 ? (
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Paid Order</span>
                            ) : (
                              <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Free / 100% Discounted</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-black tracking-wide text-[10px] px-2.5 py-1">
                        {(t.planId || 'UNSPECIFIED').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {t.couponCode ? (
                        <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5 w-max">
                          <Tag className="w-3.5 h-3.5 text-amber-500" /> {t.couponCode}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">— None —</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.timestamp ? format(new Date(t.timestamp), 'MMM d, yyyy • h:mm a') : 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-black text-base">
                      {t.amount > 0 ? (
                        <span className="text-emerald-600">₹{t.amount.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-slate-400 font-bold text-sm">₹0</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
