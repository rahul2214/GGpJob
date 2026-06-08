"use client";

import { useState, useEffect } from "react"
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Copy, Check, Sparkles, TrendingUp, Coins, Share2, Twitter, Linkedin, ArrowRight, ShieldCheck, RefreshCw, X } from "lucide-react"
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

interface SectionScores {
  summary: number;
  experience: number;
  skills: number;
  education: number;
}

interface AtsResult {
  score: number;
  keywordMatch: number;
  formattingSafety: number;
  roleAlignment: number;
  skillsCoverage: number;
  experienceImpact: number;
  recruiterReadability: number;
  sectionScores: SectionScores;
  weakestSection: string;
  missingSkills: string[];
  feedback: string[];
  strengths: string[];
  bulletOptimizations: BulletOptimization[];
}

const LOADING_STEPS = [
  "Parsing resume structure...",
  "Extracting candidate keywords...", 
  "Matching details against job description...",
  "Generating custom AI optimizations..."
]

export function AtsChecker() {
  const { user, refreshUser } = useUser()
  const router = useRouter()
  
  // Modes & Inputs
  const [checkMode, setCheckMode] = useState<'jd' | 'general'>('jd')
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  
  // Loading & Progress states
  const [isUploading, setIsUploading] = useState(false)
  const [activeStepIdx, setActiveStepIdx] = useState(0)
  
  // Results & Errors
  const [result, setResult] = useState<AtsResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [animateProgress, setAnimateProgress] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // Cache Banner State
  const [lastCheck, setLastCheck] = useState<{
    analyzedAt: string;
    score: number;
    resultJson: AtsResult;
  } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedJd = localStorage.getItem('jobsdart_ats_jd')
      if (savedJd) {
        setJobDescription(savedJd)
        setCheckMode('jd')
        localStorage.removeItem('jobsdart_ats_jd')
      }
    }
  }, [])

  // Cycling loader timer
  useEffect(() => {
    let timer: any;
    if (isUploading) {
      setActiveStepIdx(0);
      timer = setInterval(() => {
        setActiveStepIdx(prev => Math.min(prev + 1, LOADING_STEPS.length - 1));
      }, 2500);
    } else {
      setActiveStepIdx(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isUploading]);

  useEffect(() => {
    if (result) {
      setAnimateProgress(false)
      const timer = setTimeout(() => setAnimateProgress(true), 150)
      return () => clearTimeout(timer)
    } else {
      setAnimateProgress(false)
    }
  }, [result])

  // Load the user's latest analysis on mount
  const fetchLastCheck = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/ats-score?userId=${user.uuid}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setLastCheck({
            analyzedAt: data.analyzed_at,
            score: data.score,
            resultJson: data.result_json
          });
        } else {
          setLastCheck(null);
        }
      }
    } catch (err) {
      console.error("Error loading last check:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLastCheck();
    } else {
      setLastCheck(null);
    }
  }, [user]);

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
    if (checkMode === 'jd' && jobDescription) {
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
      setLastCheck({
        analyzedAt: new Date().toISOString(),
        score: data.score,
        resultJson: data
      })
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
    const totalCredits = user.totalCredits ?? 0
    
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

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500"
    if (score >= 60) return "bg-amber-500"
    return "bg-rose-500"
  }

  return (
    <div className="space-y-8">
      {/* Cache Banner display */}
      {lastCheck && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-blue-100 bg-blue-50/40 text-blue-900 dark:border-blue-950/40 dark:bg-blue-950/10 text-sm max-w-5xl mx-auto shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-5 h-5 text-blue-500 shrink-0" />
          <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-slate-700 dark:text-slate-350">
              You have a saved report! Last checked: <strong className="text-slate-900 dark:text-slate-100 font-semibold">{new Date(lastCheck.analyzedAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}</strong> · Score: <strong className="font-extrabold text-blue-600 dark:text-blue-400">{lastCheck.score}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              className="bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 font-bold px-3 py-1 h-auto text-xs rounded-xl shadow-sm hover:bg-blue-50 transition-colors"
              onClick={() => {
                setResult(lastCheck.resultJson);
                setError(null);
              }}
            >
              View Result
            </Button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
        {/* Upload & Form Section - Left Side */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-slate-200/60 dark:border-slate-800/80 shadow-lg rounded-3xl overflow-hidden bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-black">1</span>
                  Upload Resume
                </CardTitle>
                {file && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setFile(null); setResult(null); setError(null); }} 
                    className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 px-2 rounded-xl flex items-center gap-1 font-bold"
                  >
                    <X className="w-3 h-3" /> Clear
                  </Button>
                )}
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">PDF formats only (up to 2MB)</CardDescription>
            </CardHeader>
            <CardContent>
              {file ? (
                <div className="border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl p-6 flex items-center gap-4 shadow-inner">
                  <div className="p-3 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB · PDF Document
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:bg-slate-50/40 dark:hover:bg-slate-950/10 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 relative group">
                  <input
                    type="file"
                    id="resume-upload"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-3">
                    <div className="p-3.5 bg-blue-50 dark:bg-slate-850 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Click to select resume file
                      </p>
                      <p className="text-xs text-slate-400">Drag & drop your PDF here</p>
                    </div>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200/60 dark:border-slate-800/80 shadow-lg rounded-3xl overflow-hidden bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-black">2</span>
                Scan Mode
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Choose scan target for your analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Check Mode Toggle */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-950/40 border border-slate-200/30 dark:border-slate-850 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setCheckMode('general')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                    checkMode === 'general'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  General Check
                </button>
                <button
                  type="button"
                  onClick={() => setCheckMode('jd')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                    checkMode === 'jd'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  Match Job Description
                </button>
              </div>

              {checkMode === 'jd' ? (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Job Description</label>
                  <Textarea
                    placeholder="Paste the target job description details here to scan for missing keywords..."
                    className="min-h-[160px] resize-none border-slate-200/70 dark:border-slate-850 rounded-2xl bg-white/50 focus:bg-white transition-all duration-200 p-4 text-xs sm:text-sm"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-blue-100/60 bg-blue-50/20 text-blue-900 dark:border-blue-950/30 dark:bg-blue-950/5 text-xs sm:text-sm space-y-1.5 animate-in fade-in duration-300">
                  <p className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                    <Sparkles className="w-4 h-4" /> General Check Mode
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
                    Evaluates resume format, alignment, structures, active verbs, readability, and content patterns against general automated ATS scanner protocols.
                  </p>
                </div>
              )}

              {user && (
                <div className="flex items-center justify-between text-xs border rounded-2xl p-3 bg-slate-50/40 dark:bg-slate-950/20 border-slate-200/40 dark:border-slate-850">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                    <Coins className="w-4 h-4 text-indigo-500 shrink-0" />
                    {!user.metadata?.has_used_ats_checker ? (
                      <span>First scan is <strong className="text-indigo-600 dark:text-indigo-400 font-bold">FREE</strong>!</span>
                    ) : (
                      <span>Scan cost: <strong className="font-semibold text-slate-700 dark:text-slate-350">1 Credit</strong></span>
                    )}
                  </div>
                  <span className={`font-bold py-0.5 px-2.5 rounded-full text-[10px] sm:text-xs tracking-wide border shadow-sm ${
                    (user.totalCredits || 0) > 0 
                      ? 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900/30 dark:text-indigo-400' 
                      : 'bg-rose-50 border-rose-100 text-rose-500 dark:bg-rose-950/40 dark:border-rose-900/30 dark:text-rose-400'
                  }`}>
                    Balance: {user.totalCredits || 0} Cr
                  </span>
                </div>
              )}

              {user && user.metadata?.has_used_ats_checker && (user.totalCredits || 0) < 1 && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 dark:bg-rose-950/10 dark:border-rose-900/30 dark:text-rose-400 text-xs flex flex-col gap-2 shadow-sm">
                  <p className="font-medium">You need at least 1 credit to perform this scan.</p>
                  <Link href="/jobseeker/credits" className="text-indigo-600 dark:text-indigo-400 font-bold underline hover:text-indigo-700 flex items-center gap-1">
                    Purchase Credits <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold h-11 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl" 
                size="lg" 
                onClick={handleAnalyze}
                disabled={!file || isUploading || (user && user.metadata?.has_used_ats_checker && (user.totalCredits || 0) < 1)}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Run Match Assessment"
                )}
              </Button>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="rounded-2xl border-rose-200 bg-rose-50/30 text-rose-800 dark:bg-rose-950/10 dark:border-rose-900/30 dark:text-rose-400 shadow-sm animate-in fade-in duration-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <div>
                <AlertTitle className="font-bold">Scan Error</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm mt-0.5 leading-relaxed">{error}</AlertDescription>
              </div>
            </Alert>
          )}
        </div>

        {/* Results Section - Right Side */}
        <div className="lg:col-span-7">
          <Card className="border border-slate-200/60 dark:border-slate-800/80 shadow-lg rounded-3xl overflow-hidden bg-white/70 dark:bg-slate-900/50 backdrop-blur-md min-h-[500px]">
            <CardHeader className="border-b border-slate-100 dark:border-slate-850 pb-4">
              <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                Assessment Results
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                {result ? "Actionable metrics and bullet enhancements generated by AI" : "Submit resume and choose parameters to review feedback details"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isUploading && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-8 animate-in fade-in duration-300">
                  <div className="relative flex items-center justify-center">
                    <Loader2 className="w-16 h-16 animate-spin text-blue-600 dark:text-blue-500" />
                    <div className="absolute text-xs font-black text-blue-600 dark:text-blue-400 tracking-wider">AI</div>
                  </div>
                  
                  {/* Multistep Progress indicator */}
                  <div className="w-full max-w-sm space-y-3.5 bg-slate-50/50 dark:bg-slate-950/30 p-5 rounded-2xl border border-slate-150 dark:border-slate-850">
                    <Progress value={(activeStepIdx + 1) * 25} className="h-1.5 mb-2 bg-slate-150 dark:bg-slate-850" />
                    {LOADING_STEPS.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs text-left">
                        {activeStepIdx > idx ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : activeStepIdx === idx ? (
                          <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                        )}
                        <span className={`transition-all duration-300 ${
                          activeStepIdx === idx 
                            ? 'text-slate-900 dark:text-slate-100 font-bold' 
                            : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isUploading && !result && !error && (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500 space-y-4 max-w-sm mx-auto text-center">
                  <div className="p-4 bg-slate-100 dark:bg-slate-850 rounded-full text-slate-400 dark:text-slate-500 animate-bounce">
                    <FileText className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-200">No Assessment Loaded</h4>
                    <p className="text-xs leading-relaxed">
                      Upload your resume and click the run assessment button to analyze your compatibility.
                    </p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                  
                  {/* Score Circular visualization */}
                  <div className="flex flex-col items-center border-b border-slate-100 dark:border-slate-850 pb-8">
                    <div className="relative flex items-center justify-center w-40 h-40">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                        <circle 
                          cx="64" 
                          cy="64" 
                          r="54" 
                          className="stroke-slate-100 dark:stroke-slate-850" 
                          strokeWidth="7" 
                          fill="transparent" 
                        />
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
                          strokeWidth="7" 
                          fill="transparent" 
                          strokeDasharray={339.292} 
                          strokeDashoffset={animateProgress ? 339.292 - (339.292 * result.score) / 100 : 339.292} 
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className={`text-5xl font-black tracking-tight ${
                          result.score >= 80 
                            ? "text-emerald-600 dark:text-emerald-400" 
                            : result.score >= 60 
                            ? "text-amber-600 dark:text-amber-400" 
                            : "text-rose-600 dark:text-rose-400"
                        }`}>{result.score}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider mt-0.5">Match Score</span>
                      </div>
                    </div>
                    
                    <div className={`mt-4 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border shadow-sm ${
                      result.score >= 80 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30" 
                        : result.score >= 60 
                        ? "bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30" 
                        : "bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                    }`}>
                      {result.score >= 80 ? "Excellent Fit" : result.score >= 60 ? "Good Potential" : "Needs Adjustments"}
                    </div>
                  </div>

                  {/* Impact callouts */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Score Improvement Estimate Callout */}
                    <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/20 dark:border-indigo-950/30 dark:bg-indigo-950/10 flex items-start gap-3 shadow-sm hover:shadow-indigo-500/5 transition-all">
                      <TrendingUp className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-indigo-900 dark:text-indigo-300 leading-relaxed">
                        <strong className="font-bold text-sm block mb-0.5">Potential Improvement</strong>
                        Implementing suggested modifications could increase score by <strong className="font-extrabold text-indigo-600 dark:text-indigo-400">~15 points</strong>.
                      </div>
                    </div>

                    {/* Weakest Section Flag Banner */}
                    {result.weakestSection && (
                      <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/20 dark:border-rose-950/30 dark:bg-rose-950/10 flex items-start gap-3 shadow-sm hover:shadow-rose-500/5 transition-all">
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-rose-900 dark:text-rose-300 leading-relaxed">
                          <strong className="font-bold text-sm block mb-0.5">Focus Area Required</strong>
                          The <strong className="font-extrabold text-rose-600 dark:text-rose-400">{result.weakestSection}</strong> section scored the lowest. Address this section first.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visual Section Scores Breakdown */}
                  {result.sectionScores && (
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Sparkles className="w-4.5 h-4.5 text-blue-500" />
                        Section Breakdown Metrics
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[
                          { name: "Summary / Objective", val: result.sectionScores.summary, key: "Summary" },
                          { name: "Work History", val: result.sectionScores.experience, key: "Experience" },
                          { name: "Skills Assessment", val: result.sectionScores.skills, key: "Skills" },
                          { name: "Education Info", val: result.sectionScores.education, key: "Education" },
                        ].map((sec) => (
                          <div key={sec.name} className={`space-y-2.5 p-4 rounded-2xl border border-slate-150/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/30 transition-all ${
                            result.weakestSection === sec.key ? 'ring-1 ring-rose-200 border-rose-200 bg-rose-50/10 dark:bg-rose-950/5' : ''
                          }`}>
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                {sec.name}
                                {result.weakestSection === sec.key && <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 border-rose-200 text-rose-600 bg-rose-50 font-extrabold uppercase rounded-lg shadow-sm">Weakest</Badge>}
                              </span>
                              <span className={`font-extrabold ${
                                sec.val >= 80 ? "text-emerald-600" : sec.val >= 60 ? "text-amber-600" : "text-rose-600"
                              }`}>{sec.val}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${getProgressBarColor(sec.val)} transition-all duration-1000`} 
                                style={{ width: animateProgress ? `${sec.val}%` : '0%' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Granular Sub-Scores Grid */}
                  <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                    {[
                      { label: "Keyword Match", val: result.keywordMatch },
                      { label: "Formatting Safety", val: result.formattingSafety },
                      { label: "Role Alignment", val: result.roleAlignment },
                      { label: "Skills Coverage", val: result.skillsCoverage },
                      { label: "Experience Impact", val: result.experienceImpact },
                      { label: "Recruiter Readability", val: result.recruiterReadability },
                    ].map((sub, idx) => (
                      <div key={idx} className="space-y-2 p-3.5 rounded-2xl border border-slate-150/40 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-900/10">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">{sub.label}</span>
                          <span className={`font-bold ${
                            sub.val >= 80 
                              ? "text-emerald-600 dark:text-emerald-400" 
                              : sub.val >= 60 
                              ? "text-amber-600 dark:text-amber-400" 
                              : "text-rose-600 dark:text-rose-400"
                          }`}>{sub.val}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getProgressBarColor(sub.val)} transition-all duration-1000 ease-out`} 
                            style={{ width: animateProgress ? `${sub.val}%` : '0%' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shareable OG Image Result Card */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-4">
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Share2 className="w-4.5 h-4.5 text-blue-500" />
                      Verify & Share Compatibility Score
                    </h4>
                    <Card className="border border-slate-200/60 dark:border-slate-800/80 shadow-md overflow-hidden bg-[#0a0e1a] text-white rounded-2xl">
                      <div className="p-4 flex justify-between items-center bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border-b border-white/5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] uppercase font-bold text-blue-400 tracking-wider">JobsDart Certified Report</span>
                          <span className="text-sm font-bold">My Resume matched {result.score}/100</span>
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-1 bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-full">{result.score}% Match</span>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Share this verified assessment preview with your network or hiring managers on LinkedIn & X.
                        </p>
                        <div className="flex gap-2">
                          <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                              `I scored ${result.score}/100 on @JobsDart's AI ATS Resume Checker! Scan your resume for free to get an instant match score and optimizations: `
                            )}&url=${encodeURIComponent(`https://www.jobsdart.in/ats-score`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white text-black hover:bg-slate-150 transition-colors text-xs font-bold rounded-xl shadow"
                          >
                            <Twitter className="w-3.5 h-3.5 fill-black" />
                            Share on X
                          </a>
                          <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                              `https://www.jobsdart.in/ats-score`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#0077b5] text-white hover:bg-[#006297] transition-colors text-xs font-bold rounded-xl shadow"
                          >
                            <Linkedin className="w-3.5 h-3.5 fill-white" />
                            Share on LinkedIn
                          </a>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Missing Skills Section */}
                  {result.missingSkills && result.missingSkills.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <AlertCircle className="w-4.5 h-4.5 text-rose-500" />
                        Missing Required Skills (High Priority)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.missingSkills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 font-bold px-3 py-1 rounded-xl shadow-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                    <div>
                      <h4 className="flex items-center gap-2 font-extrabold text-sm text-emerald-600 dark:text-emerald-400 mb-3">
                        <CheckCircle className="w-4.5 h-4.5" />
                        Core Strengths
                      </h4>
                      <ul className="space-y-2">
                        {result.strengths.map((str, i) => (
                          <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-350 border-l-3 border-emerald-500 pl-3.5 py-1 bg-emerald-50/30 dark:bg-emerald-950/5 rounded-r-xl font-medium">{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="flex items-center gap-2 font-extrabold text-sm text-amber-600 dark:text-amber-400 mb-3">
                        <AlertCircle className="w-4.5 h-4.5" />
                        Areas for Optimization
                      </h4>
                      <ul className="space-y-2">
                        {result.feedback.map((fb, i) => (
                          <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-350 border-l-3 border-amber-500 pl-3.5 py-1 bg-amber-50/30 dark:bg-amber-950/5 rounded-r-xl font-medium">{fb}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Bullet Optimization Section */}
                  {result.bulletOptimizations && result.bulletOptimizations.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-850">
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Sparkles className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
                        AI Resume Bullet Optimizer (JD-Tailored)
                      </h4>
                      
                      <div className="space-y-5">
                        {result.bulletOptimizations.map((opt, i) => (
                          <Card key={i} className="border border-slate-200/50 dark:border-slate-800/80 shadow-sm overflow-hidden bg-slate-50/20 rounded-2xl">
                            <div className="flex flex-col md:grid md:grid-cols-2 gap-4 p-4 text-xs sm:text-sm">
                              
                              {/* Original Column */}
                              <div className="space-y-2">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  Original
                                </span>
                                <p className="text-slate-500 dark:text-slate-400 italic bg-rose-50/10 dark:bg-rose-950/5 border border-rose-100/50 dark:border-rose-900/20 rounded-xl p-3 leading-relaxed min-h-[75px]">
                                  "{opt.original}"
                                </p>
                              </div>

                              {/* Optimized Column */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Optimized
                                  </span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" 
                                    onClick={() => handleCopy(opt.improved, i)}
                                  >
                                    {copiedIndex === i ? (
                                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </div>
                                <p className="text-slate-800 dark:text-slate-200 font-bold bg-emerald-50/15 dark:bg-emerald-950/5 border border-emerald-100/50 dark:border-emerald-900/20 rounded-xl p-3 leading-relaxed min-h-[75px]">
                                  "{opt.improved}"
                                </p>
                              </div>
                            </div>

                            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-150/60 dark:border-slate-850/60 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              <strong className="font-bold text-slate-700 dark:text-slate-300">Why it works:</strong> {opt.reason}
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
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="rounded-2xl border border-slate-100 dark:border-slate-850 max-w-md bg-white dark:bg-slate-900 shadow-2xl backdrop-blur-lg">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-2">
              <Coins className="h-6 w-6 animate-pulse" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold text-slate-900 dark:text-white">Confirm Credit Charge</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Running this match assessment costs <strong className="text-slate-900 dark:text-slate-200 font-extrabold">1 credit</strong>. Your current credit balance is <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">{user?.totalCredits || 0} credits</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center sm:space-x-3 mt-4">
            <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold" onClick={() => setShowConfirmDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md"
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
