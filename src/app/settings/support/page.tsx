"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Headphones,
  Mail,
  Phone,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  Send,
  LoaderCircle,
  ChevronDown,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/user-context";

function SupportSkeleton() {
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
      <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
      <div className="h-72 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse mt-6" />
    </div>
  );
}

function SupportContent() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { toast } = useToast();

  // Auth Protection: If unauthenticated, redirect to login page with redirect URL
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=%2Fsettings%2Fsupport");
    }
  }, [user, loading, router]);

  // Support inquiry form state
  const [inquiryName, setInquiryName] = useState(user?.name || "");
  const [inquiryEmail, setInquiryEmail] = useState(user?.email || "");
  const [inquiryCategory, setInquiryCategory] = useState("General Inquiry");
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Sync user info once loaded
  useEffect(() => {
    if (user) {
      if (user.name && !inquiryName) setInquiryName(user.name);
      if (user.email && !inquiryEmail) setInquiryEmail(user.email);
    }
  }, [user]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter your message before sending.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingInquiry(true);
    // Simulate support ticket submission
    await new Promise((res) => setTimeout(res, 800));
    setIsSubmittingInquiry(false);

    toast({
      title: "Support Request Sent ✨",
      description: "Thank you! Our support team has received your ticket and will respond to your email shortly.",
    });

    setInquirySubject("");
    setInquiryMessage("");
  };

  const FAQS = [
    {
      q: "How do platform credits work for Job Seekers and Employers?",
      a: "Job Seekers use credits for AI resume optimizations, tailored recommendations, and direct messaging. Recruiters and employers use credits to post premium job openings and access candidate profiles.",
    },
    {
      q: "How does the ATS Score checker evaluate my resume?",
      a: "Our ATS auditor scans keyword density, standard resume sections (Summary, Experience, Education, Skills), readability formulas, and formatting compliance to provide an actionable percentage score.",
    },
    {
      q: "How long do recruiter job postings stay active?",
      a: "Standard job postings remain live for 30 days. Recruiters can extend, edit, or archive postings at any time directly through the 'My Postings' tab.",
    },
    {
      q: "What should I do if a credit purchase or payment fails?",
      a: "Failed transactions are processed through our secure payment gateway and typically auto-refund within 24 to 48 business hours. If you need urgent assistance, please contact admin@veltria.in.",
    },
  ];

  if (loading || !user) {
    return <SupportSkeleton />;
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/settings" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Settings
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300">Support</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <Headphones className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Customer Support
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Reach customer care, submit technical inquiries, or review frequently asked questions.
            </p>
          </div>
        </div>
      </div>

      {/* Support Content */}
      <div className="space-y-6">
        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardContent className="pt-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Email Support</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  For billing, credits, and general support.
                </p>
              </div>
              <a
                href="mailto:admin@veltria.in"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline block truncate"
              >
                admin@veltria.in
              </a>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardContent className="pt-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Helpline Phone</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Mon-Fri from 9:00 AM to 6:00 PM IST.
                </p>
              </div>
              <a
                href="tel:+916303563546"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline block"
              >
                +91 63035 63546
              </a>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardContent className="pt-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Grievance Desk</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Formal escalation & data compliance.
                </p>
              </div>
              <a
                href="mailto:admin@veltria.in"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline block truncate"
              >
                admin@veltria.in
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Quick Ticket Form */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Submit a Support Request
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Send a direct message to our support agents. We typically respond within 24 business hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-name" className="text-xs font-semibold">Your Name</Label>
                  <Input
                    id="inquiry-name"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-email" className="text-xs font-semibold">Your Email</Label>
                  <Input
                    id="inquiry-email"
                    type="email"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="alex@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-category" className="text-xs font-semibold">Inquiry Category</Label>
                  <select
                    id="inquiry-category"
                    value={inquiryCategory}
                    onChange={(e) => setInquiryCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Account & Login">Account & Login</option>
                    <option value="Billing & Credits">Billing & Credits</option>
                    <option value="ATS Score & Resume">ATS Score & Resume</option>
                    <option value="Job Applications">Job Applications</option>
                    <option value="Bug Report">Bug Report</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-subject" className="text-xs font-semibold">Subject Line</Label>
                  <Input
                    id="inquiry-subject"
                    value={inquirySubject}
                    onChange={(e) => setInquirySubject(e.target.value)}
                    placeholder="Brief summary of your question"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inquiry-message" className="text-xs font-semibold">Message</Label>
                <Textarea
                  id="inquiry-message"
                  rows={4}
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Describe your issue or question in detail..."
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmittingInquiry}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-4 gap-2"
                >
                  {isSubmittingInquiry ? (
                    <>
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Support Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* FAQs Accordion */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {FAQS.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-3.5 transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-3"
                  >
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={<SupportSkeleton />}>
      <SupportContent />
    </Suspense>
  );
}
