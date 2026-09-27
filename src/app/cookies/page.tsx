import Link from "next/link";
import { Cookie, ArrowLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | JobsDart",
  description:
    "Learn how JobsDart uses cookies, analytics, and third-party advertising technologies including Google AdSense to deliver our career services.",
};

const sections = [
  {
    title: "1. What Are Cookies?",
    content: `Cookies are small text files placed on your computer, tablet, or mobile phone by websites you visit. They are widely used to make websites work properly, improve user efficiency, remember preferences, and provide analytical and advertising information to website operators. Cookies can be "persistent" (remaining on your device until deleted or expired) or "session" (deleted automatically when you close your browser).`,
  },
  {
    title: "2. Types of Cookies We Use",
    content: `JobsDart categorizes cookies into four distinct operational classes:
(a) Strictly Necessary Cookies: Essential for authentication, security, session management, and page navigation. The site cannot function without them.
(b) Preference & Functional Cookies: Remember your site settings, language choices, and search criteria between visits.
(c) Performance & Analytics Cookies: Help us measure visitor traffic, understand which job categories and career guides are most popular, and diagnose technical errors.
(d) Advertising & Marketing Cookies: Deployed by third-party advertising networks (including Google AdSense) to deliver relevant career-related promotions and limit repetitive ads.`,
  },
  {
    title: "3. Google AdSense & Advertising Cookies",
    content: `JobsDart utilizes Google AdSense to serve programmatic advertisements. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites across the web. Google's use of advertising cookies (including the DoubleClick DART cookie) enables Google and its ad partners to serve advertisements to you based on your visit to JobsDart and/or other sites on the Internet. No personally identifiable information (such as your full name, email address, or uploaded resumes) is shared with Google AdSense.`,
  },
  {
    title: "4. Google Analytics & Telemetry",
    content: `We use Google Analytics to monitor aggregated user engagement, understand how users navigate through our resume-building tools, and optimize site speed. Google Analytics collects anonymized data including device type, geographic region, and pages viewed. This data is processed in aggregate and does not identify individual job seekers.`,
  },
  {
    title: "5. How to Opt-Out & Manage Your Cookies",
    content: `You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences through several mechanisms:
(a) Personalized Ads Opt-Out: Visit Google Ads Settings at https://adssettings.google.com to customize or disable personalized advertising across Google's Display Network.
(b) Industry Opt-Out Portals: Opt out of third-party behavioral advertising via the Digital Advertising Alliance at https://www.aboutads.info/choices/ or the Network Advertising Initiative at https://www.networkadvertising.org/choices/.
(c) Browser Cookie Controls: Most web browsers (Chrome, Safari, Firefox, Edge) allow you to block or delete cookies via browser settings. Note that disabling strictly necessary cookies may prevent you from logging in or using interactive tools.`,
  },
  {
    title: "6. Third-Party Websites & External Links",
    content: `Our career articles and job listings contain links to external employer portals, industry documentation, and research resources. When you follow these external links, the destination websites may set their own cookies. JobsDart does not govern third-party cookie practices, and we advise reviewing their independent privacy and cookie policies.`,
  },
  {
    title: "7. Updates to This Cookie Policy",
    content: `We may revise this Cookie Policy periodically to accommodate technical changes, new regulatory guidance, or modifications to our advertising partnerships. When revisions occur, the "Last Updated" date will reflect the current version.`,
  },
  {
    title: "8. Questions & Contact Information",
    content: `For any questions regarding our use of cookies, tracking technologies, or data privacy practices, please contact our support desk at support@jobsdart.in or write to our parent organization at admin@veltria.in.`,
  },
];

export default function CookiesPage() {
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
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-600/30 flex items-center justify-center">
              <Cookie className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
                Transparency &amp; Compliance
              </p>
              <h1 className="text-3xl font-extrabold text-white">Cookie Policy</h1>
            </div>
          </div>
          <p className="text-slate-400 mt-4">
            Last updated: <span className="text-slate-300 font-semibold">March 31, 2026</span>
          </p>
          <p className="text-slate-400 mt-2 leading-relaxed max-w-2xl">
            This Cookie Policy explains how JobsDart and our advertising partners use cookies and tracking technologies to support our free career services, analyze traffic, and ensure platform security.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {sections.map((section, idx) => (
            <div key={idx} className="px-8 py-7">
              <h2 className="text-lg font-bold text-slate-900 mb-3">{section.title}</h2>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed space-y-1">
            <p className="font-bold text-sm text-amber-950">
              Google AdSense Compliance &amp; Partner Disclosures
            </p>
            <p>
              JobsDart strictly adheres to Google Publisher Policies. We do not place misleading advertisements, encourage invalid clicks, or display deceptive download prompts. To learn how Google handles user information on partner websites, visit{' '}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-800 font-semibold underline hover:text-amber-950"
              >
                Google Partner Technologies Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
