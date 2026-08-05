"use client";

import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, MessageSquare, Loader2, Plus, ArrowRight, UserCheck } from "lucide-react";
import * as Icons from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Community {
  id: number;
  uuid: string;
  name: string;
  description: string;
  category: string;
  coverImage?: string;
  icon: string;
  memberCount: number;
  isJoined: boolean;
}

const CATEGORIES = ["All", "Technology", "Career", "Countries", "Companies"];

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (Icons as any)[name] || Icons.Users;
  return <IconComponent className={className} />;
}

export default function CommunitiesPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [joiningIds, setJoiningIds] = useState<Set<number>>(new Set());

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/communities?userId=${user?.uuid || ""}&category=${activeCategory}&search=${search}`);
      if (res.ok) {
        const data = await res.json();
        setCommunities(data);
      }
    } catch (err) {
      console.error("Failed to load communities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [user?.uuid, activeCategory, search]);

  const handleJoinToggle = async (e: React.MouseEvent, comm: Community) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join professional communities.",
        variant: "destructive"
      });
      router.push('/login');
      return;
    }

    setJoiningIds(prev => {
      const next = new Set(prev);
      next.add(comm.id);
      return next;
    });

    try {
      const method = comm.isJoined ? "DELETE" : "POST";
      const url = comm.isJoined 
        ? `/api/communities/${comm.id}/join?userUuid=${user.uuid}`
        : `/api/communities/${comm.id}/join`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: comm.isJoined ? undefined : JSON.stringify({ userUuid: user.uuid })
      });

      if (!res.ok) throw new Error("Failed to process request");

      setCommunities(prev =>
        prev.map(c =>
          c.id === comm.id
            ? { ...c, isJoined: !c.isJoined, memberCount: c.isJoined ? c.memberCount - 1 : c.memberCount + 1 }
            : c
        )
      );

      toast({
        title: comm.isJoined ? "Left Community" : "Joined Community! 🎉",
        description: comm.isJoined 
          ? `You have successfully unsubscribed from ${comm.name}.`
          : `Welcome to ${comm.name}! Explore posts, resources, and live events.`
      });
    } catch (err: any) {
      toast({
        title: "Connection Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setJoiningIds(prev => {
        const next = new Set(prev);
        next.delete(comm.id);
        return next;
      });
    }
  };

  const isAdmin = user?.role === "Admin" || user?.role === "Super Admin";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 relative overflow-hidden">
      {/* Decorative Blur Mesh */}
      <div className="absolute top-0 left-0 w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-20 dark:opacity-10 bg-[#3525cd]" />
      <div className="absolute top-20 right-0 w-[450px] h-[450px] rounded-full blur-[120px] pointer-events-none translate-x-1/3 opacity-20 dark:opacity-10 bg-indigo-500" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Banner Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div className="flex gap-3 shrink-0">
            {isAdmin && (
              <Button
                onClick={() => router.push("/communities/admin")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-5 py-2.5 flex items-center gap-2 shadow-lg shadow-indigo-500/25"
              >
                Manage Communities
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search & Tabs Controls */}
        <div className="space-y-6 mb-10">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 w-full md:w-auto scrollbar-none">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => startTransition(() => setActiveCategory(cat))}
                  className={cn(
                    "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border whitespace-nowrap transition-all duration-200",
                    activeCategory === cat
                      ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-md shadow-slate-900/10"
                      : "bg-white/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-50"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search forums..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-10 pl-11 pr-4 rounded-xl border-slate-200/60 focus:border-indigo-400 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Grid List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-2/5 rounded-lg" />
                    <Skeleton className="h-4 w-1/5 rounded-lg" />
                  </div>
                </div>
                <Skeleton className="h-4 w-5/6 rounded-lg" />
              </div>
            ))}
          </div>
        ) : communities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((comm, idx) => (
              <motion.div
                key={comm.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.3) }}
                whileHover={{ y: -4 }}
                onClick={() => router.push(`/communities/${comm.id}`)}
                className="cursor-pointer group flex flex-col justify-between bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm hover:shadow-[0_20px_40px_rgba(99,102,241,0.05)] transition-all duration-300 relative overflow-hidden"
              >
                {/* Background light reflex */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />

                <div>
                  {/* Icon & Category */}
                  <div className="flex justify-between items-center mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-center text-[#3525cd] dark:text-indigo-400 shadow-inner group-hover:scale-105 transition-transform">
                      <DynamicIcon name={comm.icon} className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-md">
                      {comm.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 truncate group-hover:text-[#3525cd] dark:group-hover:text-indigo-400 transition-colors">
                    {comm.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed mb-6 line-clamp-3">
                    {comm.description || "Join the conversation, ask questions, share resources, and network professionally with other members."}
                  </p>
                </div>

                {/* Footer specs */}
                <div className="flex items-center justify-between border-t border-slate-200/30 dark:border-slate-800/30 pt-4 mt-auto">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400/80" />
                    {comm.memberCount.toLocaleString()} Members
                  </span>

                  <Button
                    size="sm"
                    variant={comm.isJoined ? "secondary" : "outline"}
                    disabled={joiningIds.has(comm.id)}
                    onClick={(e) => handleJoinToggle(e, comm)}
                    className={cn(
                      "rounded-lg font-bold text-[10px] uppercase py-1 px-3.5 h-7",
                      comm.isJoined
                        ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        : "border-[#3525cd]/50 text-[#3525cd] hover:bg-[#3525cd] hover:text-white dark:border-indigo-500/50 dark:text-indigo-400 dark:hover:bg-indigo-600"
                    )}
                  >
                    {joiningIds.has(comm.id) ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : comm.isJoined ? (
                      <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> Joined</span>
                    ) : (
                      "Join"
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border-2 border-dashed border-slate-200/60 dark:border-slate-800/60 p-16 text-center max-w-xl mx-auto"
          >
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200/40 dark:border-slate-800/40">
              <MessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-600" />
            </div>
            <h3 className="text-slate-700 dark:text-slate-300 font-extrabold text-lg mb-2">No Communities Found</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mx-auto">
              We couldn't find any communities matching your active criteria. Try adjusting the category tab or keyword filter.
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
}
