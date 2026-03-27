"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, SlidersHorizontal, X, User2, FileText, MapPin, Sparkles, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import type { Domain, MasterSkill } from "@/lib/types";
import Image from "next/image";

interface Candidate {
  id: string;
  name: string;
  headline: string;
  photoUrl: string;
  domainId: string;
  skills: { id: string; name: string }[];
  resumeUrl: string;
  location: string;
}

function CandidateCard({ candidate, domainName }: { candidate: Candidate; domainName: string }) {
  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 hover:-translate-y-0.5 flex flex-col gap-4">
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          {candidate.photoUrl ? (
            <Image
              src={candidate.photoUrl}
              alt={candidate.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-slate-100">
              {initials}
            </div>
          )}
        </div>

        {/* Name & headline */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm truncate">{candidate.name}</h3>
          {candidate.headline ? (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{candidate.headline}</p>
          ) : (
            <p className="text-xs text-slate-400 mt-0.5 italic">No headline set</p>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        {domainName && (
          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
            <Sparkles className="w-2.5 h-2.5" />
            {domainName}
          </span>
        )}
        {candidate.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {candidate.location}
          </span>
        )}
      </div>

      {/* Skills */}
      {candidate.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {candidate.skills.slice(0, 5).map((s) => (
            <Badge
              key={s.id}
              variant="secondary"
              className="text-xs bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-default"
            >
              {s.name}
            </Badge>
          ))}
          {candidate.skills.length > 5 && (
            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-500">
              +{candidate.skills.length - 5} more
            </Badge>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex gap-2 pt-1 border-t border-slate-100">
        <Button asChild variant="ghost" size="sm" className="flex-1 text-xs h-8 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50">
          <Link href={`/profile/${candidate.id}`} target="_blank">
            <User2 className="w-3.5 h-3.5 mr-1.5" />
            View Profile
            <ChevronRight className="w-3 h-3 ml-auto" />
          </Link>
        </Button>
        {candidate.resumeUrl && (
          <Button asChild variant="ghost" size="sm" className="h-8 px-3 text-xs text-slate-600 hover:text-indigo-700 hover:bg-indigo-50">
            <a href={candidate.resumeUrl} target="_blank" rel="noreferrer">
              <FileText className="w-3.5 h-3.5" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function TalentSearch() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [masterSkills, setMasterSkills] = useState<MasterSkill[]>([]);

  // Load metadata
  useEffect(() => {
    const load = async () => {
      const [domainsRes, skillsRes] = await Promise.all([fetch('/api/domains'), fetch('/api/skills')]);
      if (domainsRes.ok) setDomains(await domainsRes.json());
      if (skillsRes.ok) setMasterSkills(await skillsRes.json());
    };
    load();
  }, []);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (selectedDomain !== 'all') params.set('domain', selectedDomain);
      if (selectedSkill !== 'all') params.set('skill', selectedSkill);

      const res = await fetch(`/api/talent-search?${params}`);
      if (res.ok) setCandidates(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setInitialLoaded(true);
    }
  }, [search, selectedDomain, selectedSkill]);

  // Auto-search with debounce on text, immediate on filters
  useEffect(() => {
    const t = setTimeout(() => fetchCandidates(), search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchCandidates, search]);

  const domainMap = useMemo(() => {
    const m: Record<string, string> = {};
    domains.forEach(d => (m[d.id] = d.name));
    return m;
  }, [domains]);

  const hasFilters = selectedDomain !== 'all' || selectedSkill !== 'all' || search.trim() !== '';

  const clearFilters = () => {
    setSearch('');
    setSelectedDomain('all');
    setSelectedSkill('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            Talent Search
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Discover and connect with skilled candidates in your domain.
          </p>
        </div>
        {initialLoaded && (
          <div className="sm:ml-auto text-sm text-slate-500">
            <span className="font-semibold text-slate-800">{candidates.length}</span> candidate{candidates.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filter Candidates
          {hasFilters && (
            <button onClick={clearFilters} className="ml-auto flex items-center gap-1 text-indigo-600 hover:text-indigo-800 normal-case font-medium">
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Text search */}
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Name, skill, or keyword…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-200 focus:border-indigo-400 h-10"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Domain filter */}
          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger className="bg-white border-slate-200 h-10">
              <SelectValue placeholder="All Domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {domains.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Skill filter */}
          <Select value={selectedSkill} onValueChange={setSelectedSkill}>
            <SelectTrigger className="bg-white border-slate-200 h-10">
              <SelectValue placeholder="All Skills" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              {masterSkills.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results grid */}
      {loading && !initialLoaded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
          <div className="w-14 h-14 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <User2 className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-600 font-semibold">No candidates found</p>
          <p className="text-slate-400 text-sm mt-1">
            {hasFilters ? "Try clearing some filters to broaden the search." : "No job seekers have signed up yet."}
          </p>
          {hasFilters && (
            <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map(c => (
            <CandidateCard key={c.id} candidate={c} domainName={domainMap[c.domainId] || ''} />
          ))}
        </div>
      )}

      {/* Loading overlay for re-fetch */}
      {loading && initialLoaded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
