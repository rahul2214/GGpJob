"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Users, Loader2, Check, X, Settings2 } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CommunityIcon, COMMUNITY_CATEGORIES } from "@/components/communities/community-ui";
import { communityFetch, errorMessage } from "@/components/communities/community-fetch";

export interface BrowserCommunity {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  memberCount: number;
  isJoined?: boolean;
}

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950";

export function CommunitiesBrowser({ initialCommunities }: { initialCommunities: BrowserCommunity[] }) {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [communities, setCommunities] = useState<BrowserCommunity[]>(initialCommunities);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [view, setView] = useState<"all" | "joined">("all");
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  // The server renders the public list; signed-in users then fetch their
  // joined state once instead of re-requesting the list on every keystroke.
  useEffect(() => {
    if (!user?.uuid) {
      setCommunities(prev => prev.map(c => ({ ...c, isJoined: false })));
      return;
    }
    let cancelled = false;
    fetch(`/api/communities?userId=${encodeURIComponent(user.uuid)}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (cancelled || !Array.isArray(data)) return;
        // Merge per-user state only; the server list carries the slugs.
        const byId = new Map<number, any>(data.map((c: any) => [c.id, c]));
        setCommunities(prev =>
          prev.map(c => {
            const live = byId.get(c.id);
            return live ? { ...c, isJoined: !!live.isJoined, memberCount: live.memberCount ?? c.memberCount } : c;
          })
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.uuid]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: communities.length };
    communities.forEach(c => (map[c.category] = (map[c.category] || 0) + 1));
    return map;
  }, [communities]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return communities.filter(c => {
      if (view === "joined" && !c.isJoined) return false;
      if (category !== "All" && c.category !== category) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q);
    });
  }, [communities, search, category, view]);

  const joinedCount = communities.filter(c => c.isJoined).length;
  const isAdmin = user?.role === "Admin" || user?.role === "Super Admin";

  const toggleJoin = async (comm: BrowserCommunity) => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/communities/${comm.slug}`)}`);
      return;
    }
    setPendingIds(prev => new Set(prev).add(comm.id));
    try {
      const res = comm.isJoined
        ? await communityFetch(`/api/communities/${comm.id}/join?userUuid=${encodeURIComponent(user.uuid)}`, { method: "DELETE" })
        : await communityFetch(`/api/communities/${comm.id}/join`, { method: "POST", body: JSON.stringify({ userUuid: user.uuid }) });
      if (!res.ok) throw new Error(await errorMessage(res, "We couldn't update your membership. Please try again."));
      setCommunities(prev =>
        prev.map(c =>
          c.id === comm.id
            ? { ...c, isJoined: !c.isJoined, memberCount: Math.max(0, c.memberCount + (c.isJoined ? -1 : 1)) }
            : c
        )
      );
    } catch (err: any) {
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(comm.id);
        return next;
      });
    }
  };

  return (
    <section aria-labelledby="browse-heading" className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 id="browse-heading" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Browse communities
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {filtered.length} of {communities.length} communities
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {isAdmin && (
            <Button asChild variant="outline" className="h-10 rounded-xl border-slate-200 dark:border-slate-700">
              <Link href="/communities/admin">
                <Settings2 className="mr-2 h-4 w-4" aria-hidden="true" /> Manage
              </Link>
            </Button>
          )}
          <div className="relative sm:w-72">
            <label htmlFor="community-search" className="sr-only">Search communities</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              id="community-search"
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or topic"
              className="h-10 rounded-xl border-slate-200 bg-white pl-9 pr-9 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className={cn("absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600", focusRing)}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {COMMUNITY_CATEGORIES.map(cat => {
            const active = category === cat.value && view === "all";
            return (
              <button
                key={cat.value}
                type="button"
                aria-pressed={active}
                onClick={() => { setCategory(cat.value); setView("all"); }}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  focusRing,
                  active
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                )}
              >
                {cat.label}
                <span className={cn("ml-1.5 tabular-nums", active ? "text-indigo-100" : "text-slate-400")}>{counts[cat.value] || 0}</span>
              </button>
            );
          })}
        </div>
        {user && (
          <button
            type="button"
            onClick={() => { setView(view === "joined" ? "all" : "joined"); setCategory("All"); }}
            aria-pressed={view === "joined"}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              focusRing,
              view === "joined"
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            )}
          >
            Joined <span className="ml-1 tabular-nums opacity-80">{joinedCount}</span>
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(comm => (
            <li
              key={comm.id}
              className="group relative flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                  <CommunityIcon name={comm.icon} className="h-5 w-5" />
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {comm.category}
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                <Link href={`/communities/${comm.slug}`} className={cn("rounded after:absolute after:inset-0 after:rounded-2xl", focusRing)}>
                  {comm.name}
                </Link>
              </h3>
              <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {comm.description || `Discuss jobs, referrals and interviews with the ${comm.name} community.`}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="tabular-nums">{comm.memberCount.toLocaleString()}</span> {comm.memberCount === 1 ? "member" : "members"}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant={comm.isJoined ? "outline" : "default"}
                  disabled={pendingIds.has(comm.id)}
                  onClick={() => toggleJoin(comm)}
                  aria-label={comm.isJoined ? `Leave ${comm.name}` : `Join ${comm.name}`}
                  className={cn(
                    "relative z-10 h-8 rounded-lg px-3 text-xs font-semibold",
                    comm.isJoined
                      ? "border-slate-200 text-slate-700 hover:border-rose-200 hover:text-rose-600 dark:border-slate-700 dark:text-slate-200"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  )}
                >
                  {pendingIds.has(comm.id) ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : comm.isJoined ? (
                    <><Check className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> Joined</>
                  ) : (
                    "Join"
                  )}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <Search className="mx-auto mb-3 h-6 w-6 text-slate-400" aria-hidden="true" />
          <p className="font-semibold text-slate-900 dark:text-white">
            {view === "joined" ? "You haven't joined any communities yet" : "No communities match your search"}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {view === "joined" ? "Browse the list and join the ones that match your goals." : "Try a different keyword or category."}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 rounded-xl"
            onClick={() => { setSearch(""); setCategory("All"); setView("all"); }}
          >
            Show all communities
          </Button>
        </div>
      )}
    </section>
  );
}
