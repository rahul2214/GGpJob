"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, Search, FileText, MapPin, Sparkles, 
  Clock, ShieldCheck, AlertCircle, RefreshCw, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function MessagesPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();

  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [activeAppUuid, setActiveAppUuid] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/messages");
    }
  }, [user, authLoading, router]);

  const fetchChats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let url = "";
      if (user.role === "Employee") {
        url = `/api/applications?employeeId=${user.uuid}&requesterId=${user.uuid}`;
      } else if (user.role === "Job Seeker") {
        url = `/api/applications?userId=${user.uuid}&requesterId=${user.uuid}`;
      } else {
        setLoading(false);
        return;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setChats(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load chats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uuid) {
      fetchChats();

      // Poll chats every 30 seconds for unread message count updates
      const interval = setInterval(fetchChats, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.uuid, user?.role]);

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Filter chats (only show statusId >= 3 since that's when chat is unlocked/active)
  const filteredChats = chats
    .filter((chat) => {
      if (chat.statusId < 3) return false;

      const query = searchQuery.toLowerCase();
      const nameMatch = user?.role === "Employee" 
        ? chat.applicantName.toLowerCase().includes(query)
        : (chat.posterName || "Referrer").toLowerCase().includes(query);

      const headlineMatch = user?.role === "Employee"
        ? (chat.applicantHeadline || "").toLowerCase().includes(query)
        : "";

      const jobMatch = chat.jobTitle.toLowerCase().includes(query) ||
                       chat.companyName.toLowerCase().includes(query);

      const skillsMatch = user?.role === "Employee"
        ? (chat.applicantSkills || "").toLowerCase().includes(query)
        : "";

      const matchesSearch = nameMatch || headlineMatch || jobMatch || skillsMatch;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "unlocked" && chat.statusId === 4) ||
        (statusFilter === "accepted" && chat.statusId === 3) ||
        (statusFilter === "referred" && chat.statusId === 5) ||
        (statusFilter === "interviewing" && chat.statusId === 6);

      return matchesSearch && matchesStatus;
    });

  if (authLoading || (loading && chats.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-semibold text-slate-500">Loading Conversations...</p>
        </div>
      </div>
    );
  }

  // Authorize only seeker & employee
  if (user && !["Job Seeker", "Employee"].includes(user.role)) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="border-amber-200 bg-amber-50/40">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertCircle className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <CardTitle className="text-amber-800 text-lg">Messages Page Restricted</CardTitle>
              <p className="text-xs text-amber-700 font-medium">
                Unified messaging is currently optimized for Job Seekers and Employees.
              </p>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            You are logged in as a <strong>{user.role}</strong>. Recruiter dashboards have independent application tracking pipelines.
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")} variant="outline">
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isEmployee = user?.role === "Employee";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner Section */}
        <div className="border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Conversations
            </h1>
            <p className="mt-2.5 text-slate-600 max-w-2xl text-sm leading-relaxed">
              {isEmployee 
                ? "Interact directly with job seekers who unlocked guidance chats or applied to your postings."
                : "Chat with employees who accepted your requests, unlocked guidance, or reviewed your resume."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <Input
                type="text"
                placeholder={isEmployee ? "Search candidates, jobs, skills..." : "Search referrers, companies..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 border-slate-200 text-xs rounded-xl bg-white"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Chats</option>
              <option value="unlocked">Guidance Chats</option>
              <option value="accepted">Shortlisted</option>
              <option value="referred">Referred</option>
              <option value="interviewing">Interviewing</option>
            </select>
          </div>
        </div>

        {/* Chats Grid */}
        {filteredChats.length === 0 ? (
          <Card className="border-dashed py-16 text-center rounded-[2rem] bg-white">
            <CardContent className="flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                <MessageSquare className="w-8 h-8 animate-pulse" />
              </div>
              <h4 className="text-lg font-black text-slate-800 tracking-tight">No Conversations Found</h4>
              <p className="text-xs text-slate-500 max-w-sm font-medium leading-relaxed">
                {chats.length === 0 
                  ? (isEmployee 
                      ? "You don't have any active candidate chats yet. Share your referral links or shortlist applicants to start chatting." 
                      : "You don't have any active chats yet. Go to Referrers Marketplace to unlock guidance chats with employees.")
                  : "No matches found. Try resetting filters or search term."}
              </p>
              {chats.length === 0 && !isEmployee && (
                <Button onClick={() => router.push("/referrers")} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-2 text-xs">
                  Browse Referrers Marketplace
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredChats.map((chat, idx) => (
                <motion.div
                  key={chat.uuid}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Card 
                    className={cn(
                      "border-slate-200/80 hover:border-indigo-100 hover:shadow-xl transition-all duration-300 rounded-[2rem] flex flex-col overflow-hidden bg-white relative border h-full",
                      chat.unreadChatCount > 0 ? "ring-2 ring-indigo-500/20 border-indigo-200" : ""
                    )}
                  >
                    {/* Unread Message Accent Line */}
                    {chat.unreadChatCount > 0 && (
                      <div className="h-1.5 bg-gradient-to-r from-red-500 to-indigo-600"></div>
                    )}
                    
                    <CardHeader className="pb-3 pt-6 px-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-sm shadow-md flex items-center justify-center shrink-0">
                          {getInitials(isEmployee ? chat.applicantName : (chat.posterName || "Referrer"))}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 justify-between">
                            <h4 className="text-sm font-black text-slate-900 truncate">
                              {isEmployee ? chat.applicantName : (chat.posterName || "Referrer")}
                            </h4>
                            {chat.unreadChatCount > 0 && (
                              <Badge className="bg-red-500 hover:bg-red-600 text-white border-none text-[9px] px-2 py-0.5 animate-pulse font-black uppercase shrink-0">
                                {chat.unreadChatCount} New
                              </Badge>
                            )}
                          </div>
                          
                          {isEmployee ? (
                            <>
                              <p className="text-xs text-slate-500 font-semibold truncate mt-0.5">
                                {chat.applicantHeadline || "Job Seeker"}
                              </p>
                              {chat.applicantLocation && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{chat.applicantLocation}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-indigo-600 font-bold truncate mt-0.5">
                              Employee at {chat.companyName}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 px-6 pb-4 flex flex-col gap-4">
                      {/* Applied Job Info */}
                      <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3.5 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Regarding Post</span>
                          {chat.statusId !== 4 && chat.statusName !== 'Referral Unlocked' && (
                            <span className={cn(
                              "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider",
                              chat.statusId === 3 ? "bg-blue-50 text-blue-700" :
                              chat.statusId === 5 ? "bg-violet-50 text-violet-700" :
                              chat.statusId === 6 ? "bg-amber-50 text-amber-700" :
                              chat.statusId === 7 ? "bg-emerald-50 text-emerald-700" :
                              "bg-slate-50 text-slate-600"
                            )}>
                              {chat.statusName}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-800 font-bold text-xs truncate">
                          {chat.jobTitle}
                        </span>
                      </div>

                      {/* Skills Tags (Employee View Only) */}
                      {isEmployee && chat.applicantSkills && (
                        <div className="text-xs text-slate-500 truncate" title={chat.applicantSkills}>
                          <span className="font-bold text-slate-600">Skills: </span>
                          {chat.applicantSkills.split(',').map((s: string) => s.trim()).join(', ')}
                        </div>
                      )}

                      {/* Seeker Info (Seeker View Only) */}
                      {!isEmployee && (
                        <div className="text-[11px] text-slate-500 font-medium">
                          Last activity: {chat.updatedAt ? format(new Date(chat.updatedAt), "PPP") : format(new Date(chat.appliedAt), "PPP")}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-3 border-t border-slate-100 bg-slate-50/40 p-4 flex gap-2">
                      {isEmployee && chat.applicantResumeUrl && (
                        <Button 
                          asChild 
                          variant="outline" 
                          className="border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs px-3 rounded-xl shrink-0"
                        >
                          <a href={chat.applicantResumeUrl} target="_blank" rel="noopener noreferrer" title="View Resume">
                            <FileText className="w-4.5 h-4.5" />
                          </a>
                        </Button>
                      )}
                      <Button 
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md rounded-xl h-10 flex items-center justify-center gap-1.5"
                        onClick={() => {
                          setActiveAppUuid(chat.uuid);
                          setIsChatOpen(true);
                        }}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Chat Now
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ChatDrawer Integration */}
      {activeAppUuid && (
        <ChatDrawer 
          applicationId={activeAppUuid} 
          isOpen={isChatOpen} 
          onClose={() => {
            setIsChatOpen(false);
            fetchChats();
          }} 
          onMessageRead={fetchChats}
        />
      )}
    </div>
  );
}
