"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Sparkles, Send, X, Bot, User, Loader2, MessageSquare, 
  ChevronDown, BookOpen, Briefcase, FileText, Share2, HelpCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/contexts/user-context";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  timestamp: Date;
}

export default function CareerAssistant() {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Extract jobId from pathname if viewing a job description
  const jobPathMatch = pathname?.match(/^\/jobs\/([a-zA-Z0-9-]+)$/);
  const jobId = jobPathMatch ? jobPathMatch[1] : null;

  // Initialize with a welcome message
  useEffect(() => {
    if (loading) return;

    let welcomeMsg = "Hi 👋 I am your AI Career & Referral Assistant. I can help you recommend matching jobs, optimize your resume/ATS score, guide you through referrals, or run mock interviews. What would you like to do?";
    let welcomeSuggestions = ["🔍 Recommend Jobs", "📄 Improve Resume & ATS", "🤝 Get a Referral", "🎯 Mock Interview"];

    if (user?.role === "Employee") {
      welcomeMsg = "Hi 👋 I am your AI Career & Referral Assistant. I can help you find suitable candidates, verify referral requests, or run fraud checks. How can I help you today?";
      welcomeSuggestions = ["👥 Match Candidates", "🚨 Fraud Check", "❓ FAQ & Info"];
    } else if (user?.role === "Recruiter") {
      welcomeMsg = "Hi 👋 I am your AI Career & Referral Assistant. I can help you source matching candidates, review applicant resumes/ATS profiles, or optimize your job posts. What would you like to do?";
      welcomeSuggestions = ["👥 Match Candidates", "📝 Optimize Job Post", "📋 Screen Applicants"];
    } else if (user?.role === "Admin") {
      welcomeMsg = "Hi 👋 I am your AI Career & Referral Assistant. I can help you monitor system analytics, verify referral payouts, or audit flagged referrals. How can I help you today?";
      welcomeSuggestions = ["📊 System Analytics", "💸 Verify Payouts", "🛡️ Audit Referrals"];
    }
    
    setMessages((prev) => {
      if (prev.length === 0) {
        return [{
          role: "assistant",
          content: welcomeMsg,
          suggestions: welcomeSuggestions,
          timestamp: new Date(),
        }];
      }
      // If there's only the default welcome message, and the user's role loaded afterward, update it dynamically
      if (prev.length === 1 && prev[0].role === "assistant" && prev[0].content !== welcomeMsg) {
        return [{
          role: "assistant",
          content: welcomeMsg,
          suggestions: welcomeSuggestions,
          timestamp: new Date(),
        }];
      }
      return prev;
    });
  }, [user, loading]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Show a notification badge if closed and there are unread messages
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setHasNewMessage(true);
    }
  }, [messages.length, isOpen]);

  const handleSendMessage = async (text: string, action?: string) => {
    if (!text.trim() && !action) return;

    // Add user message to state
    const userMsg: ChatMessage = {
      role: "user",
      content: text || (action ? `Clicked: ${action}` : ""),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/career-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.uuid || user?.id || null,
          message: text,
          pathname,
          jobId,
          action,
          history: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.message || "I'm sorry, I couldn't process that request.",
        suggestions: data.suggestions || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Error communicating with career assistant:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, I'm having trouble connecting right now. Please try again in a few moments.",
          suggestions: ["Recommend Jobs", "Improve Resume"],
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (suggestion: string) => {
    let actionKey = "";
    if (suggestion.includes("Recommend Jobs")) actionKey = "find_jobs";
    else if (suggestion.includes("Improve Resume") || suggestion.includes("ATS")) actionKey = "improve_resume";
    else if (suggestion.includes("Referral")) actionKey = "get_referral";
    else if (suggestion.includes("Interview") || suggestion.includes("Prep")) actionKey = "interview_prep";
    else if (suggestion.includes("Match Candidates")) actionKey = "match_candidates";
    else if (suggestion.includes("Fraud")) actionKey = "fraud_check";
    else if (suggestion.includes("Optimize Job Post")) actionKey = "optimize_job_post";
    else if (suggestion.includes("Screen Applicants")) actionKey = "screen_applicants";
    else if (suggestion.includes("System Analytics")) actionKey = "system_analytics";
    else if (suggestion.includes("Verify Payouts")) actionKey = "verify_payouts";
    else if (suggestion.includes("Audit Referrals")) actionKey = "audit_referrals";
    else actionKey = suggestion.toLowerCase().replace(/[^a-z0-9]/g, "_");

    handleSendMessage(suggestion, actionKey);
  };

  const parseInlineMarkdown = (text: string) => {
    // Render markdown links: [text](url)
    let html = text.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-600 underline font-semibold hover:text-blue-800 transition-colors" target="_self">$1</a>'
    );
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Inline code
    html = html.replace(/`(.*?)`/g, '<code class="bg-slate-100 text-pink-600 px-1 py-0.5 rounded font-mono text-xs border">$1</code>');
    return html;
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const cleanLine = line.trim();
      // Unordered list items
      if (cleanLine.startsWith("- ") || cleanLine.startsWith("* ")) {
        const content = cleanLine.substring(2);
        return (
          <li 
            key={idx} 
            className="ml-4 list-disc text-slate-700 my-1 leading-relaxed text-xs" 
            dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(content) }} 
          />
        );
      }
      // Numbered list items: 1. 2. 3.
      if (/^\d+\.\s/.test(cleanLine)) {
        const content = cleanLine.replace(/^\d+\.\s/, "");
        return (
          <li 
            key={idx} 
            className="ml-4 list-decimal text-slate-700 my-1 leading-relaxed text-xs" 
            dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(content) }} 
          />
        );
      }
      // H1
      if (cleanLine.startsWith("# ")) {
        return (
          <h1 
            key={idx} 
            className="text-sm font-bold text-slate-900 mt-3 mb-1" 
            dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(cleanLine.substring(2)) }} 
          />
        );
      }
      // H2
      if (cleanLine.startsWith("## ")) {
        return (
          <h2 
            key={idx} 
            className="text-xs font-bold text-slate-800 mt-2 mb-1" 
            dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(cleanLine.substring(3)) }} 
          />
        );
      }
      // H3
      if (cleanLine.startsWith("### ")) {
        return (
          <h3 
            key={idx} 
            className="text-xs font-semibold text-slate-700 mt-1.5 mb-0.5" 
            dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(cleanLine.substring(4)) }} 
          />
        );
      }
      // Horizontal rule
      if (cleanLine === "---" || cleanLine === "***" || cleanLine === "___") {
        return <hr key={idx} className="my-2 border-slate-200" />;
      }
      // Empty line
      if (cleanLine === "") {
        return <div key={idx} className="h-1.5" />;
      }
      // Default paragraph
      return (
        <p 
          key={idx} 
          className="text-slate-700 my-1 leading-relaxed text-xs" 
          dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(cleanLine) }} 
        />
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Floating Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[550px] max-h-[80vh] flex flex-col bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 transform scale-100 translate-y-0 origin-bottom-right">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10 relative">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-indigo-600 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">JD</h3>
                <p className="text-[10px] text-indigo-100 flex items-center gap-1 font-medium">
                  
                  Career & Referral Assistant
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <ChevronDown className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Context Alert for Job Details */}
          {jobId && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-[10px] text-amber-800 font-medium truncate">
                Context-Active: Ask "Am I eligible for this job?"
              </span>
            </div>
          )}

          {/* Messages Screen */}
          <div className="flex-1 overflow-hidden relative bg-slate-50/50">
            <ScrollArea className="h-full px-4 py-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  return (
                    <div 
                      key={index}
                      className={cn(
                        "flex items-start gap-2 max-w-[85%]",
                        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      {/* Avatar */}
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border text-[10px] font-bold shadow-sm",
                        isUser 
                          ? "bg-slate-200 text-slate-700 border-slate-300" 
                          : "bg-blue-100 text-blue-600 border-blue-200"
                      )}>
                        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-blue-600" />}
                      </div>

                      {/* Message Bubble */}
                      <div className="flex flex-col gap-2">
                        <div className={cn(
                          "px-4 py-3 rounded-2xl shadow-sm text-xs border",
                          isUser
                            ? "bg-blue-600 text-white border-blue-700 rounded-tr-none"
                            : "bg-white text-slate-800 border-slate-200/60 rounded-tl-none"
                        )}>
                          {isUser ? (
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            <div 
                              className="space-y-1"
                              onClick={(e) => {
                                const target = e.target as HTMLElement;
                                // Check if it's a link click
                                if (target.tagName === "A" || target.closest("a")) {
                                  const anchor = target.tagName === "A" ? target : target.closest("a");
                                  const href = anchor?.getAttribute("href");
                                  if (href && href.startsWith("/")) {
                                    e.preventDefault();
                                    router.push(href);
                                  }
                                }
                              }}
                            >
                              {renderMarkdown(msg.content)}
                            </div>
                          )}
                        </div>

                        {/* Quick Action Buttons for Assistant Message */}
                        {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1 max-w-[320px]">
                            {msg.suggestions.map((suggestion, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => handleQuickAction(suggestion)}
                                className="px-3 py-1.5 text-[10px] font-bold bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/20 active:scale-95 transition-all rounded-full shadow-sm"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex items-start gap-2 mr-auto max-w-[85%]">
                    <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                      <Bot className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-500 rounded-tl-none shadow-sm flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span className="text-[10px] font-medium tracking-wide">Assistant is thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Footer Input Bar */}
          <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex-1 flex gap-2"
            >
              <Input
                placeholder={
                  user?.role === "Employee"
                    ? "Ask about candidate matches, fraud checks..."
                    : user?.role === "Recruiter"
                    ? "Ask about sourcing candidates, job posts, screening..."
                    : user?.role === "Admin"
                    ? "Ask about system metrics, verification, payouts..."
                    : "Ask about jobs, resume help, referrals..."
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1 rounded-full border-slate-200 px-4 text-xs h-9 focus-visible:ring-blue-500"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!inputValue.trim() || isLoading}
                className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white shrink-0 active:scale-95 transition-all shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Circular Floating Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasNewMessage(false);
        }}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl relative select-none hover:scale-105 active:scale-95 transition-all duration-300",
          isOpen 
            ? "bg-slate-800 rotate-90" 
            : "bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-700 hover:shadow-blue-500/20"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6" />
            <Sparkles className="w-3 h-3 absolute top-3.5 right-3.5 text-amber-300 animate-pulse" />
            {hasNewMessage && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full animate-bounce"></span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
