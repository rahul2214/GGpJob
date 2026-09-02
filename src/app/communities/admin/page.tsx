"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck, Loader2, ArrowLeft, Plus, Trash2, Edit,
  CheckCircle, AlertOctagon, HelpCircle, Mail, Ban, Server
} from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Community {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
}

interface Report {
  id: number;
  post_id?: number | null;
  comment_id?: number | null;
  reason: string;
  details: string;
  status: string;
  created_at: string;
}

export default function CommunitiesAdminPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [fetching, setFetching] = useState(true);

  // Community Form
  const [commName, setCommName] = useState("");
  const [commDesc, setCommDesc] = useState("");
  const [commCat, setCommCat] = useState("Technology");
  const [commIcon, setCommIcon] = useState("Atom");
  const [submittingComm, setSubmittingComm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && (!user || (user.role !== "Admin" && user.role !== "Super Admin"))) {
      router.push("/communities");
      return;
    }
  }, [user, loading, router]);

  const loadAdminData = async () => {
    if (!user?.uuid) return;
    try {
      setFetching(true);
      const [commRes, repRes] = await Promise.all([
        fetch("/api/communities"),
        fetch(`/api/communities/reports?adminUuid=${user.uuid}`)
      ]);

      if (commRes.ok) setCommunities(await commRes.json());
      if (repRes.ok) setReports(await repRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [user?.uuid]);

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commName || !user) return;

    setSubmittingComm(true);
    try {
      const isEditing = !!editId;
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/communities/${editId}` : "/api/communities";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: commName,
          description: commDesc,
          category: commCat,
          icon: commIcon,
          creatorUuid: user.uuid
        })
      });

      if (res.ok) {
        toast({ 
          title: isEditing ? "✓ Community Updated" : "✓ Community Created", 
          description: isEditing ? `Successfully updated ${commName}.` : `Successfully added ${commName}.` 
        });
        setCommName("");
        setCommDesc("");
        setEditId(null);
        loadAdminData();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit");
      }
    } catch (err: any) {
      toast({ title: "Operation Failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmittingComm(false);
    }
  };

  const handleEditClick = (comm: Community) => {
    setEditId(comm.id);
    setCommName(comm.name);
    setCommDesc(comm.description || "");
    setCommCat(comm.category);
    setCommIcon(comm.icon);
  };

  const handleDeleteCommunity = async (commId: number) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this community and all its posts?")) return;

    try {
      const res = await fetch(`/api/communities/${commId}?adminUuid=${user.uuid}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast({ title: "✓ Community Deleted" });
        setCommunities(prev => prev.filter(c => c.id !== commId));
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleResolveReport = async (reportId: number, status: 'resolved' | 'dismissed') => {
    if (!user) return;
    try {
      const res = await fetch("/api/communities/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          status,
          adminUuid: user.uuid
        })
      });

      if (res.ok) {
        toast({ title: `Report marked as ${status}` });
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || (!user && fetching)) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-15 dark:opacity-5 bg-indigo-500" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">
        
        {/* Back navigation */}
        <Button 
          variant="ghost" 
          onClick={() => router.push("/communities")} 
          className="mb-6 hover:bg-slate-100 dark:hover:bg-slate-900 font-bold text-xs uppercase gap-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Forums List
        </Button>

        {/* Hero Section */}
        <div className="max-w-4xl mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full border bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-200/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrative
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">
            Forums <span className="text-rose-600">Moderation.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-semibold max-w-xl leading-relaxed">
            Create communities, moderate abuse reports, filter duplicates, and enforce community standards.
          </p>
        </div>

        {/* Splitted setup */}
        <div className="grid lg:grid-cols-[340px_1fr] gap-8 items-start">
          
          {/* Sidebar Creation Panel */}
          <div className="space-y-6">
            <form onSubmit={handleCreateCommunity} className="bg-white/85 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                {editId ? <Edit className="w-4.5 h-4.5" /> : <Plus className="w-4.5 h-4.5" />} 
                {editId ? "Edit Forum" : "New Forum"}
              </h3>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Forum Name</label>
                <Input placeholder="e.g. Next.js Developers" value={commName} onChange={e => setCommName(e.target.value)} required className="h-10 text-xs rounded-xl" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Category</label>
                <Select value={commCat} onValueChange={setCommCat}>
                  <SelectTrigger className="h-10 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Technology" className="text-xs font-bold uppercase tracking-wider">Technology</SelectItem>
                    <SelectItem value="Career" className="text-xs font-bold uppercase tracking-wider">Career Guidance</SelectItem>
                    <SelectItem value="Countries" className="text-xs font-bold uppercase tracking-wider">Geographies</SelectItem>
                    <SelectItem value="Companies" className="text-xs font-bold uppercase tracking-wider">Companies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Icon</label>
                <Select value={commIcon} onValueChange={setCommIcon}>
                  <SelectTrigger className="h-10 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                    <SelectValue placeholder="Icon" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Atom" className="text-xs font-bold uppercase tracking-wider">Atom</SelectItem>
                    <SelectItem value="Cpu" className="text-xs font-bold uppercase tracking-wider">Cpu (Hardware)</SelectItem>
                    <SelectItem value="Server" className="text-xs font-bold uppercase tracking-wider">Server (Backend)</SelectItem>
                    <SelectItem value="Database" className="text-xs font-bold uppercase tracking-wider">Database</SelectItem>
                    <SelectItem value="Cloud" className="text-xs font-bold uppercase tracking-wider">Cloud</SelectItem>
                    <SelectItem value="FileText" className="text-xs font-bold uppercase tracking-wider">FileText (Resumes)</SelectItem>
                    <SelectItem value="Users" className="text-xs font-bold uppercase tracking-wider">Users (Careers)</SelectItem>
                    <SelectItem value="Globe" className="text-xs font-bold uppercase tracking-wider">Globe (Countries)</SelectItem>
                    <SelectItem value="Building2" className="text-xs font-bold uppercase tracking-wider">Building (Companies)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Description</label>
                <Textarea placeholder="Explain forum purpose..." value={commDesc} onChange={e => setCommDesc(e.target.value)} required className="min-h-24 text-xs rounded-xl" />
              </div>

              <div className="flex gap-2">
                {editId && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setEditId(null);
                      setCommName("");
                      setCommDesc("");
                    }} 
                    className="flex-1 h-11 text-xs font-bold uppercase rounded-xl"
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={submittingComm || !commName.trim()} className="flex-grow h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase rounded-xl shadow-md shadow-rose-500/10">
                  {submittingComm ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? "Update Forum" : "Save Forum"}
                </Button>
              </div>
            </form>
          </div>

          {/* Active Lists Panel */}
          <div className="space-y-8">
            
            {/* Abuse Reports Log list */}
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-1.5">
                <AlertOctagon className="w-4.5 h-4.5 text-rose-500" /> Active Abuse Reports ({reports.filter(r => r.status === 'pending').length})
              </h3>
              
              {reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.map(rep => (
                    <div key={rep.id} className="p-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/30 dark:border-slate-800/30 flex justify-between items-center gap-4">
                      <div>
                        <div className="flex gap-2 mb-1.5 items-center">
                          <span className="text-[9px] font-black uppercase tracking-wider rounded bg-rose-50 text-rose-700 dark:bg-rose-950/20 px-2 py-0.5">
                            {rep.reason}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            Target: {rep.comment_id ? `Comment #${rep.comment_id}` : `Post #${rep.post_id}`}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold leading-relaxed line-clamp-2">{rep.details || "No details provided"}</p>
                      </div>

                      {rep.status === 'pending' ? (
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => handleResolveReport(rep.id, 'dismissed')} className="h-8 text-[9px] font-black uppercase tracking-wider rounded-lg">Dismiss</Button>
                          <Button size="sm" onClick={() => handleResolveReport(rep.id, 'resolved')} className="h-8 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-sm">Resolve</Button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{rep.status}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">All clean! No pending moderation reports logged.</div>
              )}
            </div>

            {/* Forums Catalog list */}
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-1.5">
                <Server className="w-4.5 h-4.5 text-indigo-500" /> Active Forums Catalog ({communities.length})
              </h3>

              <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
                {communities.map(comm => (
                  <div key={comm.id} className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/20 dark:border-slate-800/20 rounded-2xl flex justify-between items-center gap-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">{comm.name}</h4>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{comm.category}</span>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleEditClick(comm)} 
                        className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDeleteCommunity(comm.id)} 
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
