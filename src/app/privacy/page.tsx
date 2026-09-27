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
    content: `We collect information you provide directly to us when you create an account, including your name, email address, phone number, professional headline, resume, skills, education, and employment history. We also collect usage data such as the pages you visit, job listings you view, search queries you enter, and applications you submit. Technical data including your IP address, browser type, device identifiers, and operating system information may also be collected automatically to maintain platform reliability and security.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use the information we collect to: create and manage your account; match you with relevant jobs or candidates; send transactional emails such as application status updates and security alerts; improve our Platform through analytics; prevent fraud and ensure platform security; and comply with applicable legal obligations. We may also use your information to process payments, manage subscriptions, and provide access to paid services offered on the Platform.`,
  },
  {
    title: "3. Information Sharing & Disclosure",
    content: `We do not sell, rent, or trade your personal information to third parties under any circumstances. When you apply for a job, your profile and submitted resume are shared with the relevant Recruiter or Employer. When a Recruiter posts a job, their company information is visible to Job Seekers. We may share anonymised, aggregated data with business partners and service providers for analytics and technical infrastructure purposes.`,
  },
  {
    title: "4. Data Retention",
    content: `We retain your personal information for as long as your account is active or as needed to provide our recruitment services. If you delete your account, we will delete or anonymise your personal data within 30 days, except where we are required by law or regulatory compliance to retain certain records for a longer period.`,
  },
  {
    title: "5. Cookies & Tracking Technologies",
    content: `We use cookies and similar tracking technologies (such as web beacons and local storage) to provide essential platform functionality, remember user preferences, analyze site traffic, and support advertising. Essential cookies are required for authentication, session integrity, and core navigation. You may manage or disable non-essential cookies through your browser settings, though doing so may affect certain interactive features of the Platform.`,
  },
  {
    title: "6. Google AdSense & Third-Party Advertising",
    content: `JobsDart partners with third-party advertising vendors, including Google, to display advertisements on our Platform. Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites across the Internet. Google's use of advertising cookies (including the DoubleClick DART cookie) enables it and its partners to serve targeted ads to users based on their visits to JobsDart and/or other sites on the Internet. We do not provide personally identifiable information (such as your name, email, or resume details) to advertising networks. For more information on how Google collects and processes data, please review Google's Privacy & Terms at https://policies.google.com/technologies/partner-sites.`,
  },
  {
    title: "7. Opting Out of Personalized Advertising",
    content: `You have full control over your advertising preferences. You may opt out of personalized advertising by visiting Google Ads Settings (https://adssettings.google.com) or by using the Google Analytics Opt-out Browser Add-on. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting the Digital Advertising Alliance at https://www.aboutads.info/choices/ or the Network Advertising Initiative at https://www.networkadvertising.org/choices/. You can also configure your web browser to reject all cookies or to alert you when a cookie is being placed on your device.`,
  },
  {
    title: "8. Data Security",
    content: `We implement industry-standard administrative, technical, and physical security measures to protect your personal information, including encryption in transit (HTTPS/TLS), firewalls, access controls, and encrypted cloud storage. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "9. Your Rights (GDPR, CCPA & DPDP Compliance)",
    content: `Depending on your location, you may have the right to: access and receive a copy of your personal data; request correction of inaccurate data; request deletion of your personal data ("right to be forgotten"); restrict or object to certain processing activities; and request portability of your data in a structured, machine-readable format. To exercise any of these rights, contact us at support@jobsdart.in or admin@veltria.in.`,
  },
  {
    title: "10. Third-Party Services & Integrations",
    content: `Our Platform integrates with reputable third-party infrastructure and service providers including secure cloud database and authentication services (Supabase, PostgreSQL), Google Analytics (for aggregate site performance metrics), Google AdSense (for advertising delivery), Resend (for transactional emails), and payment gateways. Each of these providers operates under its own independent privacy policy, and we encourage you to review their respective practices.`,
  },
  {
    title: "11. Children's Privacy",
    content: `JobsDart is intended for working professionals and students seeking employment aged 18 and older. We do not knowingly collect personal information from individuals under the age of 18. If we become aware that a child under 18 has provided us with personal information, we will take immediate steps to delete that data from our systems.`,
  },
  {
    title: "12. Payments & Transaction Security",
    content: `All monetary transactions on JobsDart are processed through secure, PCI-DSS compliant third-party payment gateways (such as Razorpay and Cashfree). JobsDart does not store or process your complete credit/debit card numbers or bank account credentials. All billing information is handled directly by licensed payment processors in accordance with banking security protocols.`,
  },
  {
    title: "13. Changes to This Privacy Policy",
    content: `We may update this Privacy Policy periodically to reflect changes in our service offerings, legal requirements, or advertising practices. When updates are published, the "Last Updated" date at the top of this policy will be revised. Continued use of JobsDart following the posting of modifications indicates your acknowledgement of the revised policy.`,
  },
  {
    title: "14. Contact Us & Grievance Officer",
    content: `If you have questions, feedback, or formal inquiries regarding this Privacy Policy or our advertising practices, please reach out to our team at support@jobsdart.in or write to: JobsDart Support, Veltria, India. For legal notices or regulatory complaints, you may reach our designated Grievance Officer directly at admin@veltria.in.`,
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
