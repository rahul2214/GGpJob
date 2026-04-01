import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Jobs Dart",
  description: "Read the Terms of Service for using the Jobs Dart platform.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using Jobs Dart ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Platform. These terms apply to all visitors, users, and others who wish to access or use the service.`,
  },
  {
    title: "2. Description of Service",
    content: `Jobs Dart is an online job portal that connects Job Seekers with Recruiters and Employees. The Platform allows users to post job listings, search for employment opportunities, submit job applications, share referrals, and manage hiring pipelines.`,
  },
  {
    title: "3. User Accounts",
    content: `You must provide accurate, complete, and current information when creating an account. You are responsible for safeguarding your account password and for all activities occurring under your account. You must notify us immediately of any unauthorized use of your account. Jobs Dart will not be liable for any loss or damage arising from your failure to comply with this obligation.`,
  },
  {
    title: "4. Acceptable Use",
    content: `You agree not to use the Platform to: post false, misleading, or fraudulent job listings or applications; impersonate any person or entity; upload viruses or any other malicious code; scrape or harvest data without our express written consent; engage in any activity that violates applicable laws or regulations; or harass, abuse, or harm another person.`,
  },
  {
    title: "5. Job Listings & Applications",
    content: `Recruiters are responsible for the accuracy and legality of their job listings. Jobs Dart does not guarantee employment or the quality of any candidate. Job Seekers are responsible for ensuring that all information submitted in their profiles and applications is truthful and accurate. Jobs Dart does not guarantee job placement, interview selection, or hiring outcomes for any user.`,
  },
  {
    title: "6. Referrals",
    content: `Employees who share referral opportunities represent that they have the authority to do so and that the referral information is accurate. Jobs Dart is not responsible for the outcome of referred candidates or any hiring decisions made based on referrals shared through the Platform.`,
  },
  {
    title: "7. Intellectual Property",
    content: `The Platform and its original content, features, and functionality are and will remain the exclusive property of Jobs Dart and its licensors. You may not reproduce, distribute, or create derivative works from our content without our explicit written permission.`,
  },
  {
    title: "8. Termination",
    content: `We may terminate or suspend your account and access to the Platform immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Platform ceases immediately.`,
  },
  {
    title: "9. Disclaimer of Warranties",
    content: `The Platform is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or free of viruses or other harmful components.`,
  },
  {
    title: "10. Limitation of Liability",
    content: `To the maximum extent permitted by law, Jobs Dart shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, resulting from your use of or inability to use the Platform.`,
  },
  {
    title: "11. Changes to Terms",
    content: `We reserve the right to modify these Terms at any time. We will notify users of any significant changes via email or a prominent notice on the Platform. Your continued use of the Platform after such changes constitutes your acceptance of the new Terms.`,
  },
  {
    title: "12. Contact Us",
    content: `If you have any questions about these Terms of Service, please contact us at admin@veltria.in or write to us at Jobs Dart, India.`,
  },
  {
    title: "13. Payments & Services",
    content: `Jobs Dart may offer paid services such as premium memberships, enhanced profile visibility, and other career-related features. By purchasing any paid service, you agree to pay all applicable fees as described on the Platform. All payments are processed through secure third-party payment gateways. Jobs Dart does not guarantee job placement, interview calls, or hiring outcomes as part of any paid service. Paid features only enhance visibility and access to platform functionalities.`,
  },
  {
    title: "14. Refund & Cancellation",
    content: `All payments made on Jobs Dart are subject to our Refund Policy. Users are advised to review the Refund Policy before making any purchase. Refunds, if applicable, will be processed according to the terms mentioned on the Refund Policy page.`,
  },
];

export default function TermsPage() {
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
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center">
              <Scale className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Legal</p>
              <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
            </div>
          </div>
          <p className="text-slate-400 mt-4">
            Last updated: <span className="text-slate-300 font-semibold">March 31, 2026</span>
          </p>
          <p className="text-slate-400 mt-2 leading-relaxed max-w-2xl">
            Please read these Terms of Service carefully before using Jobs Dart. By using our platform, you agree to be bound by these terms.
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
