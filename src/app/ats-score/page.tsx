import { AtsChecker } from "@/components/ats-checker"

export const metadata = {
  title: "ATS Resume Analyzer",
  description: "Check your resume ATS score against a job description.",
}

export default function AtsScorePage() {
  return (
    <div className="container max-w-5xl py-12">
      <div className="mb-10 text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          AI Resume Analyzer
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Upload your resume and paste a job description. Our Grok-powered AI will evaluate your fit and give you a detailed ATS compatibility score with actionable feedback.
        </p>
      </div>
      <AtsChecker />
    </div>
  )
}
