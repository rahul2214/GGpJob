import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Jobs Dart",
  description: "Learn how Jobs Dart collects, uses, and protects your personal information.",
};

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly to us when you create an account, including your name, email address, phone number, professional headline, resume, skills, education, and employment history. We also collect usage data such as the pages you visit, job listings you view, and applications you submit. Technical data including your IP address, browser type, and device information may also be collected automatically.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use the information we collect to: create and manage your account; match you with relevant jobs or candidates; send transactional emails such as application status updates and account notifications; improve our Platform through analytics; prevent fraud and ensure platform security; and comply with legal obligations. We may also use your information to process payments, manage subscriptions, and provide access to paid services offered on the Platform.`,
  },
  {
    title: "3. Information Sharing",
    content: `We do not sell your personal information to third parties. We do not sell or rent your personal data to third parties under any circumstances. When you apply for a job, your profile and resume are shared with the relevant Recruiter or Employer. When a Recruiter posts a job, their company information is visible to Job Seekers. We may share anonymised, aggregated data with business partners for analytics purposes.`,
  },
  {
    title: "4. Data Retention",
    content: `We retain your personal information for as long as your account is active or as needed to provide services. If you delete your account, we will delete your personal data within 30 days, except where we are required by law to retain certain information for a longer period.`,
  },
  {
    title: "5. Cookies & Tracking",
    content: `We use cookies and similar tracking technologies to enhance your experience on our Platform. Essential cookies are required for the Platform to function correctly. You may disable non-essential cookies in your browser settings, but this may affect certain features of the Platform.`,
  },
  {
    title: "6. Data Security",
    content: `We implement industry-standard security measures to protect your personal information, including encryption in transit (HTTPS/TLS), Firestore security rules, and access control. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "7. Your Rights",
    content: `Depending on your location, you may have the following rights: access to your personal data; correction of inaccurate data; deletion of your data ("right to be forgotten"); restriction of processing; data portability; and the right to object to certain processing. To exercise these rights, contact us at admin@veltria.in.`,
  },
  {
    title: "8. Third-Party Services",
    content: `Our Platform may use third-party services such as Firebase (Google) for authentication and data storage, Resend for transactional email delivery, and analytics providers. These services have their own privacy policies and we encourage you to review them. We are not responsible for the practices of third-party services.`,
  },
  {
    title: "9. Children's Privacy",
    content: `Jobs Dart is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child under 18 has provided us with personal information, we will delete that information immediately.`,
  },
  {
    title: "10. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and, where appropriate, by sending you an email notification. Your continued use of the Platform after changes are posted constitutes your acceptance.`,
  },
  {
    title: "11. Contact Us & Grievance Officer",
    content: `If you have any questions or concerns about this Privacy Policy or our data practices, please contact our Data Protection contact at admin@veltria.in or write to us at Jobs Dart, India. For any complaints or concerns regarding your data, you may contact our Grievance Officer at admin@veltria.in.`,
  },
  {
    title: "12. Payments & Third-Party Processors",
    content: `We use third-party payment gateways (such as Razorpay or Cashfree) to process payments securely. We do not store your debit/credit card details. All payment transactions are processed through secure and compliant payment providers. These payment providers may collect and process your payment information in accordance with their own privacy policies. We encourage you to review their policies before making any transactions. Payments are handled by third-party secure providers and are governed by their respective terms of service.`,
  },
];

export default function PrivacyPage() {
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
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">Legal</p>
              <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
            </div>
          </div>
          <p className="text-slate-400 mt-4">
            Last updated: <span className="text-slate-300 font-semibold">March 31, 2026</span>
          </p>
          <p className="text-slate-400 mt-2 leading-relaxed max-w-2xl">
            Your privacy matters to us. This policy explains what data we collect, how we use it, and the choices you have over your personal information.
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
