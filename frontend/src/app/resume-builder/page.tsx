import ResumeBuilderPage from "./resume-builder-client"

export const metadata = {
  title: "Free AI Resume Builder: Create ATS-Friendly Resumes Online | JobsDart",
  description: "Build a professional, ATS-optimized resume in minutes with our AI resume builder. Access tailored templates, generate quantified bullet points, and download your high-quality PDF under 1MB.",
  keywords: [
    "free resume builder",
    "ai resume builder",
    "ats friendly resume creator",
    "online resume builder",
    "ats resume template",
    "ai resume writer",
    "cv maker",
    "professional resume templates",
    "jobsdart"
  ],
  alternates: {
    canonical: "https://www.jobsdart.in/resume-builder",
  },
  openGraph: {
    title: "Free AI Resume Builder: Create ATS-Friendly Resumes Online | JobsDart",
    description: "Create a professional, ATS-optimized resume in minutes with our free online AI resume builder and writer. Generate quantified bullet points and download high-quality PDFs under 1MB.",
    url: "https://www.jobsdart.in/resume-builder",
    siteName: "JobsDart",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Resume Builder: Create ATS-Friendly Resumes Online | JobsDart",
    description: "Build a professional, ATS-optimized resume in minutes with our AI resume builder. Access tailored templates, generate quantified bullet points, and download PDFs.",
  }
}

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "JD Resume Builder",
    "url": "https://www.jobsdart.in/resume-builder",
    "description": "Create a professional ATS-friendly resume in minutes with our free online AI resume builder and writer.",
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ResumeBuilderPage />
    </>
  )
}
