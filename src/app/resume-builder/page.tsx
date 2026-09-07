import type { Metadata } from "next"
import { cookies } from "next/headers"
import { SITE_URL, siteUrl } from "@/lib/site"
import ResumeBuilderPage from "./resume-builder-client"
import { ResumeBuilderSeo } from "@/components/resume-builder-seo"
import { RESUME_BUILDER_FAQS, RESUME_BUILDER_STEPS } from "@/lib/seo-content"

const PAGE_URL = siteUrl("/resume-builder")
const OG_IMAGE = siteUrl("/og-image.png")

export const metadata: Metadata = {
  // The root layout appends " | JobsDart" via its title template, so this must
  // stay short enough that the combined string survives SERP truncation.
  title: "Free AI Resume Builder — ATS-Friendly Resume Maker",
  description:
    "Build a job-winning resume with our free AI resume builder. Generate ATS-friendly bullet points, pick a recruiter-ready template and download your PDF free.",
  keywords: [
    // Head term first, then the AI-specific long tail.
    "free ai resume builder",
    "ai resume builder",
    "ai resume builder free online",
    "ai resume generator",
    "ai resume maker",
    "ai powered resume builder",
    "ai resume writer",
    "ai cv generator",
    "free ai cv builder",
    "make resume with ai",
    "ai resume bullet point generator",
    "ai resume template",
    "smart resume builder",
    // Generic builder / maker intent.
    "free resume builder",
    "online resume maker",
    "resume builder online free",
    "create resume online free",
    "instant resume builder",
    "free cv maker",
    "curriculum vitae maker",
    // ATS and format intent.
    "ats friendly resume builder",
    "ats resume builder free",
    "resume builder with ats score",
    "ats resume template free",
    "professional resume templates",
    "job winning resume templates",
    "best resume format for freshers",
    "one page resume builder",
    // Audience and outcome intent.
    "resume builder for freshers",
    "resume builder for students",
    "software developer resume builder",
    "resume maker online free download pdf",
    "download resume pdf free",
    "resume builder india",
    "jobsdart resume builder",
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
    title: "Free AI Resume Builder — ATS-Friendly Resume Maker | JobsDart",
    description:
      "Build a job-winning resume with a free AI resume builder. ATS-friendly bullet points, recruiter-ready templates and an instant PDF download.",
    url: PAGE_URL,
    siteName: "JobsDart",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "JobsDart free AI resume builder with ATS-friendly templates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Resume Builder — ATS-Friendly Resume Maker",
    description:
      "Build a job-winning resume with a free AI resume builder. ATS-friendly bullet points, recruiter-ready templates and an instant PDF download.",
    images: [OG_IMAGE],
  },
}

export default function Page() {
  // Resolved server-side so the marketing copy, headings and FAQ ship in the
  // initial HTML for crawlers, while signed-in users never see it flash in.
  const isSignedIn = Boolean(cookies().get("sb-access-token")?.value)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${PAGE_URL}#app`,
    "name": "JobsDart AI Resume Builder",
    "url": PAGE_URL,
    "description":
      "Create a professional ATS-friendly resume in minutes with a free online AI resume builder, parse-safe templates and PDF export.",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Resume Builder",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "inLanguage": "en",
    "isPartOf": { "@id": `${SITE_URL}/#website` },
    "publisher": { "@id": `${SITE_URL}/#organization` },
    "featureList": [
      "ATS-friendly, single-column resume templates",
      "AI-generated quantified bullet points",
      "Live resume preview while editing",
      "Multiple saved resume versions",
      "ATS-safe PDF export under 1MB",
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
    // Generated from the same array the visible FAQ renders, so the structured
    // data can never drift from the on-page answers.
    "mainEntity": RESUME_BUILDER_FAQS.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": { "@type": "Answer", "text": faq.a },
    })),
  }

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${PAGE_URL}#howto`,
    "name": "How to build an ATS-friendly resume",
    "description":
      "Build a resume that passes applicant tracking system screening using the free JobsDart AI resume builder.",
    "totalTime": "PT10M",
    "estimatedCost": { "@type": "MonetaryAmount", "currency": "INR", "value": "0" },
    "step": RESUME_BUILDER_STEPS.map((step, idx) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "name": step.name,
      "text": step.text,
      "url": `${PAGE_URL}#step-${idx + 1}`,
    })),
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Resume Builder", "item": PAGE_URL },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <ResumeBuilderPage initialShowPromo={!isSignedIn} />
      <ResumeBuilderSeo initialShow={!isSignedIn} />
    </>
  )
}
