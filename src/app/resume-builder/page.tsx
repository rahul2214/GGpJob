import type { Metadata } from "next"
import { cookies } from "next/headers"
import { SITE_URL, siteUrl } from "@/lib/site"
import ResumeBuilderPage from "./resume-builder-client"
import { ResumeBuilderSeo } from "@/components/resume-builder-seo"
import { RESUME_BUILDER_FAQS, RESUME_BUILDER_STEPS } from "@/lib/seo-content"

const PAGE_URL = siteUrl("/resume-builder")
const OG_IMAGE = siteUrl("/og-image.png")

export const metadata: Metadata = {
  // The root layout appends " | JobsDart" via its title template.
  title: "Free AI Resume Builder — Make an ATS-Friendly Resume Online",
  description:
    "Build a professional, ATS-friendly resume free in minutes. Pick a parse-safe template, let AI write quantified bullet points, check your ATS score, and download a recruiter-ready PDF under 1MB.",
  keywords: [
    "free resume builder",
    "ai resume builder",
    "ats friendly resume builder",
    "online resume maker",
    "resume maker online free download pdf",
    "create resume online free",
    "free cv maker",
    "resume builder for freshers",
    "ats resume template free",
    "professional resume templates",
    "ai resume writer",
    "ai cv generator",
    "resume builder india",
    "best resume format for freshers",
    "one page resume builder",
    "resume builder with ats score",
    "software developer resume builder",
    "download resume pdf free",
    "job winning resume templates",
    "curriculum vitae maker",
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
    title: "Free AI Resume Builder — Make an ATS-Friendly Resume Online | JobsDart",
    description:
      "Create a professional, ATS-optimized resume in minutes with a free online AI resume builder. Parse-safe templates, quantified bullet points and PDF export under 1MB.",
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
    title: "Free AI Resume Builder — ATS-Friendly Resumes Online",
    description:
      "Build a professional, ATS-optimized resume in minutes. AI bullet points, parse-safe templates and a recruiter-ready PDF download.",
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
