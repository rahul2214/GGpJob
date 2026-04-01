import Link from "next/link";
import { Mail, ArrowLeft, MapPin, Phone, MessageSquare, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Jobs Dart",
  description: "Get in touch with the Jobs Dart support team.",
};

export default function ContactPage() {
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
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Support</p>
              <h1 className="text-3xl font-extrabold text-white">Contact Us</h1>
            </div>
          </div>
          <p className="text-slate-400 mt-2 leading-relaxed max-w-2xl">
            We're here to help. Reach out to us for any questions regarding billing, platform access, or technical support.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Contact Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Email Support</p>
                  <p className="text-sm text-slate-500 mb-1">For general inquiries and billing.</p>
                  <a href="mailto:admin@veltria.in" className="text-blue-600 text-sm font-medium hover:underline">admin@veltria.in</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Phone</p>
                  <p className="text-sm text-slate-500 mb-1">Mon-Fri from 9am to 6pm IST.</p>
                  <a href="tel:+916303563546" className="text-blue-600 text-sm font-medium hover:underline">+91 63035 63546</a>
                </div>
              </div>

             

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Compliance</p>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Grievance Officer</p>
                    <p className="text-xs text-slate-500 mb-1">For data-related concerns and formal grievances.</p>
                    <a href="mailto:admin@veltria.in" className="text-blue-600 text-xs font-medium hover:underline">admin@veltria.in</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Payment Gateway Notice</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              For issues related to payment failures, please ensure you allow up to 48 hours for failed transactions to automatically reverse before submitting a ticket.
            </p>
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
              <p className="text-sm text-orange-800 font-medium">
                Note: Jobs Dart is a digital platform connecting employers with talent. We do not provide employment guarantees or charge fees for guaranteed job placements.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
