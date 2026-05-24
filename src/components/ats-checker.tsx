"use client";

import { useState, useEffect } from "react"
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Copy, Check, Sparkles, TrendingUp, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useUser } from "@/contexts/user-context"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface BulletOptimization {
  original: string;
  improved: string;
  reason: string;
}

export function AtsChecker() {
  const { user, refreshUser } = useUser()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedJd = localStorage.getItem('jobsdart_ats_jd')
      if (savedJd) {
        setJobDescription(savedJd)
        localStorage.removeItem('jobsdart_ats_jd')
      }
    }
  }, [])
  
  const [result, setResult] = useState<{
    score: number;
    keywordMatch: number;
    formattingSafety: number;
    roleAlignment: number;
    skillsCoverage: number;
    experienceImpact: number;
    recruiterReadability: number;
    missingSkills: string[];
    feedback: string[];
    strengths: string[];
    bulletOptimizations: BulletOptimization[];
  } | null>(null)
  
  const [error, setError] = useState<string | null>(null)
  const [animateProgress, setAnimateProgress] = useState(false)

  useEffect(() => {
    if (result) {
      setAnimateProgress(false)
      const timer = setTimeout(() => setAnimateProgress(true), 150)
      return () => clearTimeout(timer)
    } else {
      setAnimateProgress(false)
    }
  }, [result])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      
      // Check for 2MB limit
      if (selectedFile.size > 2 * 1024 * 1024) {
        setError("File size exceeds 2MB limit. Please upload a smaller PDF.")
        setFile(null)
        e.target.value = "" // Reset input
        return
      }

      setFile(selectedFile)
      setResult(null)
      setError(null)
    }
  }

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const executeAnalyze = async () => {
    setIsUploading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append("file", file!)
    formData.append("userId", user!.uuid)
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
      await refreshUser()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Something went wrong during analysis.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a resume first.")
      return
    }

    if (!user) {
      router.push("/login?redirect=/ats-score")
      return
    }

    const hasUsedAts = user.metadata?.has_used_ats_checker === true
    const totalCredits = (user.subscriptionCredits || 0) + (user.purchasedCredits || 0)
    
    if (hasUsedAts && totalCredits < 1) {
      setError("Insufficient credits. Analyzing your resume costs 1 credit.")
      return
    }

    if (!hasUsedAts) {
      await executeAnalyze()
    } else {
      setShowConfirmDialog(true)
    }
  }

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200"
    if (score >= 60) return "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200"
    return "text-rose-600 bg-rose-50 dark:bg-rose-950/20 border-rose-200"
  }

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500"
    if (score >= 60) return "bg-amber-500"
    return "bg-rose-500"
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
                  <p className="text-xs text-muted-foreground mt-1">PDF up to 2MB</p>
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
            {user && (
              <div className="mt-4 flex items-center justify-between text-xs border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                  <Coins className="w-3.5 h-3.5 text-indigo-500" />
                  {!user.metadata?.has_used_ats_checker ? (
                    <span>Your first ATS check is <strong className="text-indigo-600 dark:text-indigo-400 font-bold">FREE</strong>!</span>
                  ) : (
                    <span>Each check costs <strong className="font-semibold text-slate-800 dark:text-slate-200">1 Credit</strong>.</span>
                  )}
                </div>
                <div className="text-right">
                  <span className={`font-bold ${(user.credits || 0) > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`}>
                    Balance: {user.credits || 0} Credits
                  </span>
                </div>
              </div>
            )}

            {user && user.metadata?.has_used_ats_checker && (user.credits || 0) < 1 && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 text-xs flex flex-col gap-2">
                <p className="font-medium">You need at least 1 credit to perform this analysis.</p>
                <Link href="/jobseeker/credits" className="text-indigo-600 dark:text-indigo-400 font-bold underline hover:text-indigo-700">
                  Get Credits Now →
                </Link>
              </div>
            )}

            <Button 
              className="w-full mt-6" 
              size="lg" 
              onClick={handleAnalyze}
              disabled={!file || isUploading || (user && user.metadata?.has_used_ats_checker && (user.credits || 0) < 1)}
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
        <Card className="border shadow-sm">
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
                  <div className="relative flex items-center justify-center w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                      {/* Background track circle */}
                      <circle 
                        cx="64" 
                        cy="64" 
                        r="54" 
                        className="stroke-slate-100 dark:stroke-slate-800" 
                        strokeWidth="8" 
                        fill="transparent" 
                      />
                      {/* Foreground progress circle */}
                      <circle 
                        cx="64" 
                        cy="64" 
                        r="54" 
                        className={`stroke-current ${
                          result.score >= 80 
                            ? "text-emerald-500" 
                            : result.score >= 60 
                            ? "text-amber-500" 
                            : "text-rose-500"
                        } transition-all duration-1000 ease-out`} 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={339.292} 
                        strokeDashoffset={animateProgress ? 339.292 - (339.292 * result.score) / 100 : 339.292} 
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className={`text-4.5xl font-black tracking-tight ${
                        result.score >= 80 
                          ? "text-emerald-600 dark:text-emerald-400" 
                          : result.score >= 60 
                          ? "text-amber-600 dark:text-amber-400" 
                          : "text-rose-600 dark:text-rose-400"
                      }`}>{result.score}</span>
                      <span className="text-xs text-muted-foreground block font-medium uppercase tracking-wider mt-0.5">Score</span>
                    </div>
                  </div>
                  <div className={`mt-4 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                    result.score >= 80 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30" 
                      : result.score >= 60 
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30" 
                      : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                  }`}>
                    {result.score >= 80 ? "Excellent Match" : result.score >= 60 ? "Good Potential" : "Needs Improvement"}
                  </div>
                </div>

                {/* Granular Sub-Scores Grid */}
                <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 dark:border-slate-800 py-6">
                  {[
                    { label: "Keyword Match", val: result.keywordMatch },
                    { label: "Formatting Safety", val: result.formattingSafety },
                    { label: "Role Alignment", val: result.roleAlignment },
                    { label: "Skills Coverage", val: result.skillsCoverage },
                    { label: "Experience Impact", val: result.experienceImpact },
                    { label: "Recruiter Readability", val: result.recruiterReadability },
                  ].map((sub, idx) => (
                    <div key={idx} className="space-y-2 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600 dark:text-slate-400">{sub.label}</span>
                        <span className={`font-bold ${
                          sub.val >= 80 
                            ? "text-emerald-600 dark:text-emerald-400" 
                            : sub.val >= 60 
                            ? "text-amber-600 dark:text-amber-400" 
                            : "text-rose-600 dark:text-rose-400"
                        }`}>{sub.val}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getProgressBarColor(sub.val)} transition-all duration-1000 ease-out`} 
                          style={{ width: animateProgress ? `${sub.val}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Missing Skills Section */}
                {result.missingSkills && result.missingSkills.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                      Missing Core Skills (High Priority)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 font-medium px-2.5 py-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {result.strengths.map((str, i) => (
                        <li key={i} className="text-sm text-slate-700 dark:text-slate-300 border-l-2 border-emerald-500 pl-3 py-1 bg-emerald-50/50 dark:bg-emerald-950/10">{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      Areas to Improve
                    </h4>
                    <ul className="space-y-2">
                      {result.feedback.map((fb, i) => (
                        <li key={i} className="text-sm text-slate-700 dark:text-slate-300 border-l-2 border-amber-500 pl-3 py-1 bg-amber-50/50 dark:bg-amber-950/10">{fb}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bullet Optimization Section */}
                {result.bulletOptimizations && result.bulletOptimizations.length > 0 && (
                  <div className="space-y-4 border-t pt-6">
                    <h4 className="font-bold text-base text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      AI Bullet Point Optimizer (JD-Tailored)
                    </h4>
                    <div className="space-y-4">
                      {result.bulletOptimizations.map((opt, i) => (
                        <Card key={i} className="border border-slate-100 shadow-sm overflow-hidden bg-slate-50/20">
                          <div className="grid md:grid-cols-2 gap-4 p-4 text-xs md:text-sm">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Original Bullet</span>
                              <p className="text-slate-500 italic bg-rose-50/20 border border-rose-100/50 rounded-lg p-2.5">
                                "{opt.original}"
                              </p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                                  <TrendingUp className="w-3.5 h-3.5" />
                                  AI-Optimized Bullet
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100" 
                                  onClick={() => handleCopy(opt.improved, i)}
                                >
                                  {copiedIndex === i ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                              <p className="text-slate-800 font-medium bg-emerald-50/20 border border-emerald-100/50 rounded-lg p-2.5">
                                "{opt.improved}"
                              </p>
                            </div>
                          </div>
                          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                            <strong>Why it works:</strong> {opt.reason}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="rounded-2xl border-slate-100 dark:border-slate-800 max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 mb-2">
              <Coins className="h-6 w-6 animate-pulse" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold">Confirm Credit Charge</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
              Analyzing your resume costs <strong className="text-slate-900 dark:text-slate-100 font-semibold">1 credit</strong>. Your current credit balance is <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{user?.credits || 0} credits</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center sm:space-x-3 mt-4">
            <AlertDialogCancel className="rounded-xl border-slate-200" onClick={() => setShowConfirmDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="rounded-xl bg-[#2e5bff] hover:bg-blue-700 text-white"
              onClick={async () => {
                setShowConfirmDialog(false)
                await executeAnalyze()
              }}
            >
              Confirm & Analyze
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

