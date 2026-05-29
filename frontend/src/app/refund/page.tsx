import Link from "next/link";
import { RefreshCcw, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Jobs Dart",
  description: "Read our policies on refunds and cancellations.",
};

const sections = [
  {
    title: "1. Digital Goods & Services",
    content: "Jobs Dart provides digital services, including premium profile visibility and access to candidate databases. Due to the digital and instantly accessible nature of these services, refunds are generally not applicable once the service has been activated on your account.",
  },
  {
    title: "2. Cancellation Policy",
    content: "You may cancel your subscription or delete your account at any time through your Account Settings. However, please note that cancelling an active premium plan will not result in a pro-rated refund for the remaining duration of the billing cycle. Your premium features will remain active until the end of the purchased period.",
  },
  {
    title: "3. Refund Eligibility",
    content: "Refunds are generally not provided. However, we may offer a full refund in the following exceptional circumstances: (a) You were charged multiple times for the same transaction due to a technical error. (b) The premium features you purchased were not provisioned to your account within 48 hours of successful payment, and our support team is unable to resolve the issue. (c) A fraudulent transaction was made using your payment method. Jobs Dart does not guarantee job placement, interview calls, or hiring outcomes. Refunds will not be issued based on dissatisfaction with hiring results.",
  },
  {
    title: "4. Refund Process",
    content: "To request a refund under the eligible circumstances, you must contact our support team at admin@veltria.in within 7 days of the original transaction date. Please include your registered email address, transaction ID, and a detailed explanation of the issue.",
  },
  {
    title: "5. Processing Time",
    content: "If your refund request is approved, the amount will be credited back to your original payment method within 5 to 7 business days. The actual time for the refund to reflect may vary depending on your bank and payment provider.",
  },
  {
    title: "6. Payment Gateway",
    content: "All payments on Jobs Dart are processed through secure third-party payment gateways. Jobs Dart does not store your card or payment details. Refunds, when applicable, are processed through the same payment gateway used during the transaction in accordance with the gateway's refund processing timelines.",
  },
];

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-600/30 flex items-center justify-center">
              <RefreshCcw className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-1">Legal</p>
              <h1 className="text-3xl font-extrabold text-white">Refund Policy</h1>
            </div>
          </div>
          <p className="text-slate-400 mt-4">
            Last updated: <span className="text-slate-300 font-semibold">March 31, 2026</span>
          </p>
          <p className="text-slate-400 mt-2 leading-relaxed max-w-2xl">
            Please read our refund and cancellation policy carefully before purchasing any premium services.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {sections.map((section, idx) => (
            <div key={idx} className="px-8 py-7">
              <h2 className="text-lg font-bold text-slate-900 mb-3">{section.title}</h2>
              <p className="text-slate-600 leading-relaxed text-sm">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
