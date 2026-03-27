"use client"

import { useState } from "react"
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AtsChecker() {
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  
  const [result, setResult] = useState<{
    score: number;
    feedback: string[];
    strengths: string[];
  } | null>(null)
  
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setResult(null)
      setError(null)
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a resume first.")
      return
    }

    setIsUploading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)
    if (jobDescription) {
      formData.append("jobDescription", jobDescription)
    }

    try {
      const response = await fetch("/api/ats-score", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "Failed to analyze resume")
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Something went wrong during analysis.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Upload Section */}
      <div className="space-y-6">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>1. Upload Resume</CardTitle>
            <CardDescription>Upload your resume in PDF format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 text-center hover:bg-muted/50 transition-colors">
              <input
                type="file"
                id="resume-upload"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
              <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {file ? file.name : "Click to upload your resume"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PDF up to 5MB</p>
                </div>
                <Button variant="outline" type="button" className="mt-2" onClick={() => document.getElementById('resume-upload')?.click()}>
                  Select File
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>2. Job Description (Optional)</CardTitle>
            <CardDescription>Paste the job description for a tailored ATS score</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste job description here..."
              className="min-h-[120px] resize-none"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <Button 
              className="w-full mt-6" 
              size="lg" 
              onClick={handleAnalyze}
              disabled={!file || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Resume"
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <Card className="h-full border shadow-sm">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              {result ? "Actionable feedback to improve your resume" : "Upload your resume to see results"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isUploading && (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p>AI is analyzing your resume...</p>
              </div>
            )}

            {!isUploading && !result && !error && (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-4">
                <FileText className="w-12 h-12 opacity-20" />
                <p>No results yet</p>
              </div>
            )}

            {result && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Score Circular visualization */}
                <div className="flex flex-col items-center">
                  <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-[8px] border-muted">
                    {/* A simple overlay circle for score - doing CSS trick or standard progress */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="56" className="stroke-current text-primary" strokeWidth="8" fill="transparent" 
                        strokeDasharray={351.858} 
                        strokeDashoffset={351.858 - (351.858 * result.score) / 100} 
                        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                        transform="translate(8, 8)"
                      />
                    </svg>
                    <div className="text-center">
                      <span className="text-4xl font-bold">{result.score}</span>
                      <span className="text-sm text-muted-foreground block">/ 100</span>
                    </div>
                  </div>
                  <h3 className="mt-4 font-semibold text-lg text-center">
                    {result.score >= 80 ? "Excellent Match!" : result.score >= 60 ? "Good Potential" : "Needs Improvement"}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-green-600 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {result.strengths.map((str, i) => (
                        <li key={i} className="text-sm border-l-2 border-green-500 pl-3 py-1 bg-green-50/50 dark:bg-green-950/20">{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-orange-600 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      Areas to Improve
                    </h4>
                    <ul className="space-y-2">
                      {result.feedback.map((fb, i) => (
                        <li key={i} className="text-sm border-l-2 border-orange-500 pl-3 py-1 bg-orange-50/50 dark:bg-orange-950/20">{fb}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
