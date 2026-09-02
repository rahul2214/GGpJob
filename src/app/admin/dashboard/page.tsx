
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, FileSignature, BarChart3, Calendar as CalendarIcon, UserSearch, UserCheck,Wallet, Globe, Sparkles, Loader2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "@/components/animated-counter";

interface ChartData {
  name: string;
  value: number;
}

interface AnalyticsData {
  totalJobSeekers: number;
  totalRecruiters: number;
  totalEmployees?: number;
  totalDirectJobs: number;
  totalReferralJobs: number;
  totalApplications: number;
  directJobsByIndustry?: ChartData[];
  directJobsByDomain?: ChartData[];
  referralJobsByIndustry?: ChartData[];
  referralJobsByDomain?: ChartData[];
  usersByCountry?: ChartData[];
  usersByDomain?: ChartData[];
  applicationsByIndustry?: ChartData[];
  applicationsByDomain?: ChartData[];
  applicationsByStatus?: ChartData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {payload[0].name}
            </span>
            <span className="font-bold text-muted-foreground">
              {payload[0].value}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold">
      {value}
    </text>
  );
};

const renderLegend = (props: any) => {
  const { payload } = props;

  return (
    <ul className="grid grid-cols-2 gap-2 text-sm mt-4">
      {
        payload?.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.value}</span>
          </li>
        ))
      }
    </ul>
  );
};


export default function AdminDashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const handleScrapeJobs = async () => {
    try {
      setIsScraping(true);
      toast({
        title: "Scraping Web Jobs...",
        description: "Fetching live tech jobs from public API sources and parsing schema.",
      });
      const res = await fetch('/api/jobs/scrape', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || "Scraping failed");
      toast({
        title: "Jobs Pushed to DB! 🚀",
        description: data.message || `Successfully processed and inserted ${data.insertedCount} jobs.`,
      });
    } catch (err: any) {
      toast({
        title: "Scraping Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsScraping(false);
    }
  };

  const isAdminOrSuperAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

  useEffect(() => {
    if (user && !isAdminOrSuperAdmin) {
      router.push('/'); // Redirect non-admins
    }
  }, [user, router, isAdminOrSuperAdmin]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!isAdminOrSuperAdmin) return;

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (date?.from) params.append('from', date.from.toISOString());
        if (date?.to) params.append('to', date.to.toISOString());

        const userIdVal = user?.uuid || user?.id;
        if (userIdVal) params.append('userId', String(userIdVal));

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/analytics?${params.toString()}`, { headers });
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const data = await res.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [user, date, isAdminOrSuperAdmin]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[...Array(5)].map((_, i) => (
                <Card key={i}><CardHeader><Skeleton className="h-6 w-24 mb-2" /><Skeleton className="h-8 w-16" /></CardHeader></Card>
            ))}
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            <Card>
                <CardHeader><Skeleton className="h-7 w-48" /></CardHeader>
                <CardContent><Skeleton className="h-[350px] w-full" /></CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-7 w-48" /></CardHeader>
                <CardContent><Skeleton className="h-[350px] w-full" /></CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-7 w-48" /></CardHeader>
                <CardContent><Skeleton className="h-[350px] w-full" /></CardContent>
            </Card>
        </div>
      </div>
    );
  }
  
  if (!isAdminOrSuperAdmin) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
                <p>You do not have permission to view this page.</p>
            </CardContent>
        </Card>
      )
  }

  const jobsChartData = analytics?.directJobsByIndustry || analytics?.directJobsByDomain || [];
  const usersChartData = analytics?.usersByCountry || analytics?.usersByDomain || [];
  const appsIndustryChartData = analytics?.applicationsByIndustry || analytics?.applicationsByDomain || [];
  const appsStatusChartData = analytics?.applicationsByStatus || [];

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <BarChart3 className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
        <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
      </div>

      {!analytics ? (
        <Card>
            <CardHeader><CardTitle>Error</CardTitle></CardHeader>
            <CardContent><p>Could not load analytics data. Please refresh or verify permissions.</p></CardContent>
        </Card>
      ) : (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Job Seekers</CardTitle>
                    <UserSearch className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <AnimatedCounter value={analytics.totalJobSeekers || 0} className="text-2xl font-bold" />
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Recruiters</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <AnimatedCounter value={analytics.totalRecruiters || 0} className="text-2xl font-bold" />
                </CardContent>
                </Card>

                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                    <FileSignature className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <AnimatedCounter value={analytics.totalApplications || 0} className="text-2xl font-bold" />
                </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <AnimatedCounter value={analytics.totalDirectJobs || 0} className="text-2xl font-bold" />
                    </CardContent>
                </Card>

                <Card className="bg-indigo-950 text-white shadow-lg shadow-slate-300 dark:shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dynamic Pricing Plans</CardTitle>
                    <Wallet className="h-4 w-4 text-slate-200" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">Manage</span>
                        <Button variant="secondary" size="sm" className="h-7 text-[10px] font-bold uppercase" onClick={() => router.push('/admin/plans')}>
                            Edit Prices
                        </Button>
                    </div>
                </CardContent>
                </Card>
                
                <Card className="bg-violet-950 text-white shadow-lg shadow-violet-300 dark:shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Auto-Scrape Web Jobs</CardTitle>
                    <Globe className="h-4 w-4 text-violet-300" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">Web APIs</span>
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            disabled={isScraping}
                            className="h-7 text-[10px] font-bold uppercase gap-1" 
                            onClick={handleScrapeJobs}
                        >
                            {isScraping ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-amber-400" />}
                            {isScraping ? "Scraping..." : "Scrape & Push"}
                        </Button>
                    </div>
                </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Jobs by Industry</CardTitle>
                    </CardHeader>
                    <CardContent>
                    {jobsChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                          <PieChart>
                          <Pie
                              data={jobsChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomizedLabel}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                          >
                              {jobsChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend content={renderLegend} />
                          </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[350px] flex items-center justify-center text-sm text-slate-400">No data available</div>
                    )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Users by Country</CardTitle>
                    </CardHeader>
                    <CardContent>
                    {usersChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                          <PieChart>
                          <Pie
                              data={usersChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomizedLabel}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                          >
                              {usersChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend content={renderLegend} />
                          </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[350px] flex items-center justify-center text-sm text-slate-400">No data available</div>
                    )}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Applications by Industry</CardTitle>
                    </CardHeader>
                    <CardContent>
                    {appsIndustryChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                          <PieChart>
                          <Pie
                              data={appsIndustryChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomizedLabel}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                          >
                              {appsIndustryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend content={renderLegend} />
                          </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[350px] flex items-center justify-center text-sm text-slate-400">No data available</div>
                    )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Applications by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                    {appsStatusChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                          <PieChart>
                          <Pie
                              data={appsStatusChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomizedLabel}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                          >
                              {appsStatusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend content={renderLegend} />
                          </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[350px] flex items-center justify-center text-sm text-slate-400">No data available</div>
                    )}
                    </CardContent>
                </Card>
            </div>
        </>
      )}
    </div>
  );
}

