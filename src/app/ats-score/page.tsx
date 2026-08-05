import { AtsScoreClient } from "./AtsScoreClient"

export const metadata = {
  title: "Free AI ATS Resume Checker & Score Optimizer | JobsDart",
  description: "Scan your resume against any job description for free. Get an instant ATS compatibility score, identify missing keywords, and get AI-optimized bullet points to stand out to recruiters.",
  keywords: [
    "free ats checker",
    "ats resume checker",
    "resume score scanner",
    "ai resume analyzer",
    "job description match",
    "ats optimization",
    "resume keywords match",
    "cv score",
    "resume feedback",
    "jobsdart"
  ],
  alternates: {
    canonical: "https://www.jobsdart.in/ats-score",
  },
  openGraph: {
    title: "Free AI ATS Resume Checker & Score Scanner | JobsDart",
    description: "Optimize your resume for applicant tracking systems. Pasting a job description scans for missing keywords, gives a detailed score, and rewrites bullet points contextually.",
    url: "https://www.jobsdart.in/ats-score",
    siteName: "JobsDart",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI ATS Resume Checker & Score Scanner | JobsDart",
    description: "Scan your resume against any job description for free. Get an instant ATS compatibility score, identify missing keywords, and get AI-optimized bullet points.",
  }
}

export default function AtsScorePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "JD ATS Resume Checker & Analyzer",
    "url": "https://www.jobsdart.in/ats-score",
    "description": "Scan and optimize your resume against a job description with our free AI ATS compatibility score checker.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "INR"
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is an ATS score?",
        "acceptedAnswer": { "@type": "Answer", "text": "An ATS (Applicant Tracking System) score indicates how well your resume matches a job description. Most companies use ATS software to filter applications before a human reviews them. A score above 70% significantly increases your chances of passing the initial screen." }
      },
      {
        "@type": "Question", 
        "name": "Is this ATS checker really free?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes, your first ATS analysis on JobsDart is completely free. Subsequent analyses cost 1 credit each." }
      },
      {
        "@type": "Question",
        "name": "What file formats does the resume checker support?",
        "acceptedAnswer": { "@type": "Answer", "text": "Currently supports PDF files up to 2MB. ATS systems work best with text-based PDFs, not scanned images." }
      }
    ]
  };

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

      <AtsScoreClient />
    </>
  )
}
