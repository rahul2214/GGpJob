import { AtsChecker } from "@/components/ats-checker"

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
    "name": "JobsDart AI ATS Resume Checker & Analyzer",
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

  return (
    <div className="container max-w-5xl py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mb-10 text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          AI Resume Analyzer
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Upload your resume and paste a job description. Our AI will evaluate your fit and give you a detailed ATS compatibility score with actionable feedback.
        </p>
      </div>
      <AtsChecker />
    </div>
  )
}
