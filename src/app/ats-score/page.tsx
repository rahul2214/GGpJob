import type { Metadata } from "next"
import { cookies } from "next/headers"
import { SITE_URL, siteUrl } from "@/lib/site"
import { AtsScoreClient } from "./AtsScoreClient"
import { ATS_FAQS } from "@/lib/seo-content"

const PAGE_URL = siteUrl("/ats-score")
const OG_IMAGE = siteUrl("/og-image.png")

export const metadata: Metadata = {
  // The root layout appends " | JobsDart" via its title template.
  title: "Free ATS Resume Checker — Instant ATS Score & Keyword Scan",
  description:
    "Check your ATS resume score free in seconds. Paste any job description to scan your CV for missing keywords, get a section-by-section ATS compatibility score, and AI-rewritten bullet points that pass applicant tracking systems.",
  keywords: [
    "ats resume checker",
    "free ats checker",
    "ats score checker",
    "check resume ats score online free",
    "resume ats scanner",
    "ats resume checker india",
    "applicant tracking system checker",
    "resume checker free",
    "resume keyword scanner",
    "job description resume match",
    "ats compatibility test",
    "ai resume analyzer",
    "cv ats checker",
    "resume score check",
    "ats checker for freshers",
    "resume optimization tool",
    "how to pass ats screening",
    "naukri resume checker",
    "linkedin resume checker",
    "ats checker for it jobs",
    "free cv scanner",
    "resume feedback tool",
    "jobsdart ats checker",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Free ATS Resume Checker — Instant ATS Score & Keyword Scan | JobsDart",
    description:
      "Scan your resume against any job description for free. Get an instant ATS compatibility score, spot missing keywords, and rewrite weak bullet points with AI.",
    url: PAGE_URL,
    siteName: "JobsDart",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "JobsDart free ATS resume checker and score scanner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free ATS Resume Checker — Instant ATS Score & Keyword Scan",
    description:
      "Scan your resume against any job description for free. Instant ATS score, missing keywords, and AI-optimized bullet points.",
    images: [OG_IMAGE],
  },
}

export default function AtsScorePage() {
  // Rendered server-side so the marketing copy, H1 and FAQ ship in the initial
  // HTML for crawlers, while signed-in users never see it flash in.
  const isSignedIn = Boolean(cookies().get("sb-access-token")?.value)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${PAGE_URL}#app`,
    "name": "JobsDart ATS Resume Checker & Score Analyzer",
    "url": PAGE_URL,
    "description":
      "Scan and optimize your resume against a job description with a free AI ATS compatibility score checker, keyword gap analysis and bullet point rewriting.",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Resume Optimization",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "inLanguage": "en",
    "isPartOf": { "@id": `${SITE_URL}/#website` },
    "publisher": { "@id": `${SITE_URL}/#organization` },
    "featureList": [
      "Instant ATS compatibility score out of 100",
      "Missing keyword detection against any job description",
      "Section-by-section resume breakdown",
      "AI-rewritten, quantified bullet points",
      "PDF resume parsing",
    ],
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "INR",
    },
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${PAGE_URL}#faq`,
    // Sourced from the same array the visible FAQ renders, so the structured
    // data can never drift from the on-page answers.
    "mainEntity": ATS_FAQS.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": { "@type": "Answer", "text": faq.a },
    })),
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "ATS Resume Checker", "item": PAGE_URL },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <AtsScoreClient initialShowPromo={!isSignedIn} />
    </>
  )
}
