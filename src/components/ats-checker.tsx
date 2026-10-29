"use client";

import { useState, useEffect, useRef } from "react"
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Copy, Check, TrendingUp, Coins, Share2, Twitter, Linkedin, ArrowRight, ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, ListChecks, X, ClipboardType, Target, ScanSearch, RotateCcw, LogIn, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
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
  reason?: string;
}

interface SectionScores {
  summary: number;
  experience: number;
  skills: number;
  education: number;
}

export interface AtsComplianceCheck {
  category: "contact" | "structure" | "verbs" | "metrics" | "length" | "integrity";
  label: string;
  status: "pass" | "warning" | "fail";
  details: string;
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
  manipulationDetected?: boolean;
  integrityWarnings?: string[];
  complianceChecks?: AtsComplianceCheck[];
}

type ResumeSource = "upload" | "paste"
type CheckMode = "jd" | "general"

interface ScanError {
  title: string;
  message: string;
  action?: "credits" | "login" | "retry";
}

const LOADING_STEPS = [
  "Reading your resume",
  "Extracting skills and keywords",
  "Comparing against ATS rules",
  "Writing tailored suggestions",
]

// Keep in sync with /api/ats-score.
const MAX_FILE_BYTES = 5 * 1024 * 1024
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"]
const MIN_RESUME_CHARS = 200
const MAX_RESUME_CHARS = 30000
const MIN_JD_CHARS = 100
const MAX_JD_CHARS = 20000
const REQUEST_TIMEOUT_MS = 120_000
const SKILLS_PREVIEW_COUNT = 12

const labelClass = "text-xs font-semibold text-slate-600 dark:text-slate-300"
const cardClass = "rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"

function scoreTone(score: number) {
  if (score >= 80) return { text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", stroke: "text-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50" }
  if (score >= 60) return { text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500", stroke: "text-amber-500", chip: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/50" }
  return { text: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500", stroke: "text-rose-500", chip: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/50" }
}

function scoreVerdict(score: number) {
  if (score >= 85) return { label: "Excellent", summary: "Your resume is well optimised for ATS screening." }
  if (score >= 70) return { label: "Strong", summary: "A solid resume. A few targeted fixes will push it higher." }
  if (score >= 55) return { label: "Fair", summary: "It should parse, but key improvements are needed to rank well." }
  if (score >= 40) return { label: "Needs work", summary: "Several issues are likely to filter this resume out." }
  return { label: "Low", summary: "Major changes are needed before this resume passes ATS filters." }
}

function fileExtension(name: string) {
  const idx = name.lastIndexOf(".")
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : ""
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Job descriptions handed over from a job page may contain HTML.
function toPlainText(value: string) {
  return value
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function ScoreBar({ label, value, animate, highlight }: { label: string; value: number; animate: boolean; highlight?: boolean }) {
  const tone = scoreTone(value)
  return (
    <div className={`space-y-2 rounded-xl border p-3.5 ${highlight ? "border-rose-200 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/10" : "border-slate-200/70 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30"}`}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
          {label}
          {highlight && (
            <span className="rounded-md border border-rose-200 bg-white px-1.5 py-px text-[10px] font-bold uppercase text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">Weakest</span>
          )}
        </span>
        <span className={`font-bold tabular-nums ${tone.text}`}>{value}%</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div className={`h-full ${tone.bar} transition-all duration-1000 ease-out`} style={{ width: animate ? `${value}%` : "0%" }} />
      </div>
    </div>
  )
}

function SectionHeading({ icon: Icon, children, aside }: { icon?: React.ElementType; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
        {Icon && <Icon className="h-4 w-4 text-indigo-500" aria-hidden="true" />}
        {children}
      </h3>
      {aside}
    </div>
  )
}

export function AtsChecker() {
  const { user, loading: userLoading, refreshUser } = useUser()
  const router = useRouter()

  // Inputs
  const [resumeSource, setResumeSource] = useState<ResumeSource>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState("")
  const [checkMode, setCheckMode] = useState<CheckMode>("jd")
  const [jobDescription, setJobDescription] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  // Inline validation
  const [resumeError, setResumeError] = useState<string | null>(null)
  const [jdError, setJdError] = useState<string | null>(null)

  // Request state
  const [isUploading, setIsUploading] = useState(false)
  const [activeStepIdx, setActiveStepIdx] = useState(0)
  const [result, setResult] = useState<AtsResult | null>(null)
  const [resultMode, setResultMode] = useState<CheckMode>("jd")
  const [error, setError] = useState<ScanError | null>(null)
  const [animateProgress, setAnimateProgress] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [showAllSkills, setShowAllSkills] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const [lastCheck, setLastCheck] = useState<{
    analyzedAt: string;
    score: number;
    resultJson: AtsResult;
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const hasUsedAts = !!user && (user.has_used_ats_checker === true || user.hasUsedAtsChecker === true || user.metadata?.has_used_ats_checker === true)
  const totalCredits = user?.totalCredits ?? 0
  const lacksCredits = !!user && hasUsedAts && totalCredits < 2
  const hasResume = resumeSource === "upload" ? !!file : resumeText.trim().length > 0

  // A job page can hand over its description via localStorage.
  useEffect(() => {
    try {
      const savedJd = localStorage.getItem("jobsdart_ats_jd")
      if (savedJd) {
        setJobDescription(toPlainText(savedJd).slice(0, MAX_JD_CHARS))
        setCheckMode("jd")
        localStorage.removeItem("jobsdart_ats_jd")
      }
    } catch {
      // Storage can be unavailable (private mode); the form still works.
    }
  }, [])

  // Abort an in-flight scan if the user leaves the page.
  useEffect(() => () => abortRef.current?.abort(), [])

  useEffect(() => {
    if (!isUploading) {
      setActiveStepIdx(0)
      return
    }
    setActiveStepIdx(0)
    const timer = setInterval(() => {
      setActiveStepIdx((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1))
    }, 3500)
    return () => clearInterval(timer)
  }, [isUploading])

  useEffect(() => {
    if (!result) {
      setAnimateProgress(false)
      return
    }
    setAnimateProgress(false)
    setShowAllSkills(false)
    const timer = setTimeout(() => setAnimateProgress(true), 150)
    return () => clearTimeout(timer)
  }, [result])

  useEffect(() => {
    if (!user?.uuid) {
      setLastCheck(null)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/ats-score?userId=${user.uuid}`)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        if (data && data.result_json && typeof data.score === "number") {
          setLastCheck({ analyzedAt: data.analyzed_at, score: data.score, resultJson: data.result_json })
        } else {
          setLastCheck(null)
        }
      } catch (err) {
        console.error("Error loading last check:", err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.uuid])

  // On small screens the results sit below the form, so bring them into view.
  const revealResults = () => {
    requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    })
  }

  const selectFile = (selected: File | undefined | null) => {
    if (!selected) return
    if (!ALLOWED_EXTENSIONS.includes(fileExtension(selected.name))) {
      setResumeError(`"${selected.name}" isn't supported. Please upload a PDF, DOC or DOCX file.`)
      return
    }
    if (selected.size === 0) {
      setResumeError("This file is empty. Please choose another file.")
      return
    }
    if (selected.size > MAX_FILE_BYTES) {
      setResumeError(`This file is ${formatBytes(selected.size)}. The maximum size is 5 MB.`)
      return
    }
    setFile(selected)
    setResumeError(null)
    setError(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    selectFile(e.target.files?.[0])
    // Reset so selecting the same file again still fires onChange.
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (isUploading) return
    selectFile(e.dataTransfer.files?.[0])
  }

  const clearFile = () => {
    setFile(null)
    setResumeError(null)
  }

  const validate = () => {
    let ok = true
    if (resumeSource === "upload") {
      if (!file) {
        setResumeError("Please upload your resume to continue.")
        ok = false
      }
    } else {
      const len = resumeText.trim().length
      if (len === 0) {
        setResumeError("Please paste your resume text to continue.")
        ok = false
      } else if (len < MIN_RESUME_CHARS) {
        setResumeError(`That looks too short for a full resume. Paste at least ${MIN_RESUME_CHARS} characters.`)
        ok = false
      } else if (len > MAX_RESUME_CHARS) {
        setResumeError("Resume text is too long. Please keep it under 30,000 characters.")
        ok = false
      }
    }

    if (checkMode === "jd") {
      const len = jobDescription.trim().length
      if (len === 0) {
        setJdError("Paste the job description, or switch to General check.")
        ok = false
      } else if (len < MIN_JD_CHARS) {
        setJdError(`Add a bit more of the job description (at least ${MIN_JD_CHARS} characters) for an accurate match.`)
        ok = false
      } else if (len > MAX_JD_CHARS) {
        setJdError("Job description is too long. Please keep it under 20,000 characters.")
        ok = false
      }
    }
    return ok
  }

  const executeAnalyze = async () => {
    if (!user) return
    setIsUploading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    if (resumeSource === "upload" && file) {
      formData.append("file", file)
    } else {
      formData.append("resumeText", resumeText.trim())
    }
    formData.append("userId", user.uuid)
    const mode = checkMode
    if (mode === "jd") {
      formData.append("jobDescription", jobDescription.trim())
    }

    const controller = new AbortController()
    abortRef.current = controller
    let timedOut = false
    const timeout = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch("/api/ats-score", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })

      // Proxies and body-size limits can return non-JSON bodies.
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const serverMessage: string | undefined = data?.error
        if (response.status === 401) {
          setError({ title: "Session expired", message: "Please sign in again to run the scan.", action: "login" })
        } else if (response.status === 402 || data?.code === "INSUFFICIENT_CREDITS") {
          setError({ title: "Not enough credits", message: "Each scan after your free one costs 2 credits.", action: "credits" })
        } else if (response.status === 413) {
          setError({ title: "File too large", message: "The maximum file size is 5 MB." })
        } else if (response.status === 429) {
          setError({ title: "Too many scans", message: "Please wait a minute before trying again.", action: "retry" })
        } else if (response.status >= 500) {
          setError({ title: "Analysis failed", message: serverMessage || "Something went wrong on our side. Please try again.", action: "retry" })
        } else {
          setError({ title: "We couldn't analyse this resume", message: serverMessage || "Please check your resume and try again." })
        }
        return
      }

      if (!data || typeof data.score !== "number") {
        setError({ title: "Analysis failed", message: "We received an incomplete report. Please try again.", action: "retry" })
        return
      }

      setResult(data)
      setResultMode(mode)
      setLastCheck({ analyzedAt: new Date().toISOString(), score: data.score, resultJson: data })
      revealResults()
      refreshUser().catch(() => {})
    } catch (err: any) {
      if (controller.signal.aborted) {
        // Aborts from leaving the page need no message; timeouts do.
        if (timedOut) {
          setError({ title: "This is taking too long", message: "The analysis timed out. Please try again in a moment.", action: "retry" })
        }
      } else {
        console.error(err)
        setError({ title: "Connection problem", message: "We couldn't reach the server. Check your connection and try again.", action: "retry" })
      }
    } finally {
      clearTimeout(timeout)
      if (abortRef.current === controller) abortRef.current = null
      setIsUploading(false)
    }
  }

  const handleAnalyze = async () => {
    if (isUploading) return
    setError(null)

    if (!user) {
      // Carry the job description through the sign-in redirect.
      try {
        if (checkMode === "jd" && jobDescription.trim()) {
          localStorage.setItem("jobsdart_ats_jd", jobDescription.trim())
        }
      } catch {}
      router.push("/login?redirect=/ats-score")
      return
    }

    if (!validate()) return

    if (lacksCredits) {
      setError({ title: "Not enough credits", message: "Each scan after your free one costs 2 credits.", action: "credits" })
      return
    }

    if (hasUsedAts) {
      setShowConfirmDialog(true)
    } else {
      await executeAnalyze()
    }
  }

  const startNewScan = () => {
    setResult(null)
    setError(null)
    requestAnimationFrame(() => {
      document.getElementById("ats-form")?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex((cur) => (cur === index ? null : cur)), 2000)
    } catch {
      setCopiedIndex(null)
    }
  }

  const resumeLen = resumeText.trim().length
  const jdLen = jobDescription.trim().length
  const ctaLabel = !user
    ? userLoading ? "Loading…" : "Sign in to analyse"
    : !hasUsedAts
      ? "Analyse resume (free)"
      : "Analyse resume · 2 credits"

  const lastCheckDate = lastCheck ? new Date(lastCheck.analyzedAt) : null
  const lastCheckLabel = lastCheckDate && !isNaN(lastCheckDate.getTime())
    ? lastCheckDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(lastCheckDate.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}),
      })
    : null

  const segmentBtn = (active: boolean) =>
    `flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${focusRing} ${
      active
        ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-indigo-300 dark:ring-slate-700"
        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
    }`

  return (
    <div className="space-y-6">
      {lastCheck && !result && !isUploading && (
        <div className="mx-auto flex max-w-6xl flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-indigo-900/50 dark:bg-indigo-950/20">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white text-sm font-black tabular-nums dark:bg-slate-900 ${scoreTone(lastCheck.score).text} border-indigo-100 dark:border-indigo-900/50`}>
              {lastCheck.score}
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">Your last report</span>
              {lastCheckLabel && <> · scanned {lastCheckLabel}</>}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-indigo-200 bg-white font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-slate-800"
            onClick={() => {
              setResult(lastCheck.resultJson)
              setResultMode(lastCheck.resultJson.missingSkills?.length ? "jd" : "general")
              setError(null)
              revealResults()
            }}
          >
            View report
          </Button>
        </div>
      )}

      <div className="mx-auto grid max-w-6xl items-start gap-6 lg:grid-cols-12">
        {/* ── Form ── */}
        <div id="ats-form" className="min-w-0 scroll-mt-24 space-y-6 lg:col-span-5">
          <section className={`${cardClass} p-5 sm:p-6`} aria-labelledby="ats-resume-heading">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="ats-resume-heading" className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">1</span>
                  Your resume <span className="text-rose-500" aria-hidden="true">*</span>
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Upload a file or paste the text.</p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-950/60" role="radiogroup" aria-label="Resume input method">
              <button
                type="button"
                role="radio"
                aria-checked={resumeSource === "upload"}
                disabled={isUploading}
                onClick={() => { setResumeSource("upload"); setResumeError(null) }}
                className={segmentBtn(resumeSource === "upload")}
              >
                <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" /> Upload file
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={resumeSource === "paste"}
                disabled={isUploading}
                onClick={() => { setResumeSource("paste"); setResumeError(null) }}
                className={segmentBtn(resumeSource === "paste")}
              >
                <ClipboardType className="h-3.5 w-3.5" aria-hidden="true" /> Paste text
              </button>
            </div>

            {resumeSource === "upload" ? (
              file ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/40">
                  <div className="rounded-lg bg-indigo-100 p-2.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white" title={file.name}>{file.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {fileExtension(file.name).toUpperCase()} · {formatBytes(file.size)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 rounded-lg px-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-slate-800"
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isUploading}
                      onClick={clearFile}
                      aria-label="Remove file"
                      className="h-8 w-8 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="resume-upload"
                  onDragOver={(e) => { e.preventDefault(); if (!isUploading) setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`group flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900 ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30"
                      : resumeError
                        ? "border-rose-300 bg-rose-50/30 dark:border-rose-900/60 dark:bg-rose-950/10"
                        : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-indigo-600 dark:hover:bg-slate-950/40"
                  }`}
                >
                  <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 transition-transform group-hover:scale-105 dark:bg-slate-800 dark:text-indigo-300">
                    <UploadCloud className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      <span className="text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">PDF, DOC or DOCX · up to 5 MB</p>
                  </div>
                </label>
              )
            ) : (
              <div className="space-y-1.5">
                <label htmlFor="resume-text" className={labelClass}>
                  Resume text <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  id="resume-text"
                  value={resumeText}
                  disabled={isUploading}
                  onChange={(e) => { setResumeText(e.target.value); if (resumeError) setResumeError(null) }}
                  placeholder="Paste the full text of your resume: summary, experience, education and skills…"
                  aria-invalid={!!resumeError}
                  aria-describedby="resume-text-hint"
                  className={`min-h-[180px] resize-y rounded-xl text-sm ${resumeError ? "border-rose-400 focus-visible:ring-rose-400" : "border-slate-200 dark:border-slate-700"}`}
                />
                <p id="resume-text-hint" className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Minimum {MIN_RESUME_CHARS} characters</span>
                  <span className={`tabular-nums ${resumeLen > MAX_RESUME_CHARS ? "font-semibold text-rose-600" : ""}`}>
                    {resumeLen.toLocaleString()} / {MAX_RESUME_CHARS.toLocaleString()}
                  </span>
                </p>
              </div>
            )}

            {/* Kept mounted so "Replace" works while a file is selected. */}
            <input
              ref={fileInputRef}
              type="file"
              id="resume-upload"
              className="sr-only"
              disabled={isUploading}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              aria-describedby={resumeError ? "resume-error" : undefined}
            />

            {resumeError && (
              <p id="resume-error" role="alert" className="mt-2 flex items-start gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {resumeError}
              </p>
            )}
          </section>

          <section className={`${cardClass} space-y-4 p-5 sm:p-6`} aria-labelledby="ats-target-heading">
            <div>
              <h2 id="ats-target-heading" className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">2</span>
                What to check against
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Matching a job description gives the most useful keyword feedback.</p>
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-950/60" role="radiogroup" aria-label="Scan mode">
              <button
                type="button"
                role="radio"
                aria-checked={checkMode === "jd"}
                disabled={isUploading}
                onClick={() => setCheckMode("jd")}
                className={segmentBtn(checkMode === "jd")}
              >
                <Target className="h-3.5 w-3.5" aria-hidden="true" /> Job description
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={checkMode === "general"}
                disabled={isUploading}
                onClick={() => { setCheckMode("general"); setJdError(null) }}
                className={segmentBtn(checkMode === "general")}
              >
                <ScanSearch className="h-3.5 w-3.5" aria-hidden="true" /> General check
              </button>
            </div>

            {checkMode === "jd" ? (
              <div className="space-y-1.5">
                <label htmlFor="job-description" className={labelClass}>
                  Job description <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  id="job-description"
                  value={jobDescription}
                  disabled={isUploading}
                  onChange={(e) => { setJobDescription(e.target.value); if (jdError) setJdError(null) }}
                  placeholder="Paste the job title, responsibilities and requirements from the posting…"
                  aria-invalid={!!jdError}
                  aria-describedby={jdError ? "jd-hint jd-error" : "jd-hint"}
                  className={`min-h-[160px] resize-y rounded-xl text-sm ${jdError ? "border-rose-400 focus-visible:ring-rose-400" : "border-slate-200 dark:border-slate-700"}`}
                />
                <p id="jd-hint" className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Include the requirements section</span>
                  <span className={`tabular-nums ${jdLen > MAX_JD_CHARS ? "font-semibold text-rose-600" : ""}`}>
                    {jdLen.toLocaleString()} / {MAX_JD_CHARS.toLocaleString()}
                  </span>
                </p>
                {jdError && (
                  <p id="jd-error" role="alert" className="flex items-start gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {jdError}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
                <p className="mb-1 font-semibold text-slate-800 dark:text-slate-200">General ATS check</p>
                Checks formatting, section structure, action verbs, measurable impact and readability against common ATS rules, without a specific job in mind.
              </div>
            )}

            {/* Access & credits */}
            {!user && !userLoading && (
              <div className="flex items-start gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-slate-700 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-slate-300">
                <Sparkles className="mt-px h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />
                <span>Sign in with a free account to run the scan. <strong className="font-semibold text-slate-900 dark:text-white">Your first scan is free.</strong></span>
              </div>
            )}

            {user && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/40">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Coins className="h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />
                  {hasUsedAts ? (
                    <>Scan cost: <strong className="font-semibold text-slate-900 dark:text-slate-100">2 credits</strong></>
                  ) : (
                    <>Your first scan is <strong className="font-semibold text-indigo-700 dark:text-indigo-300">free</strong></>
                  )}
                </span>
                <span className={`rounded-full border px-2.5 py-0.5 font-semibold tabular-nums ${
                  lacksCredits
                    ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
                    : "border-indigo-200 bg-white text-indigo-700 dark:border-indigo-900/50 dark:bg-slate-900 dark:text-indigo-300"
                }`}>
                  Balance: {totalCredits} {totalCredits === 1 ? "credit" : "credits"}
                </span>
              </div>
            )}

            {lacksCredits && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
                <span className="font-medium">You need at least 2 credits for another scan.</span>
                <Link href="/jobseeker/credits" className={`inline-flex items-center gap-1 rounded font-semibold text-indigo-700 underline-offset-2 hover:underline dark:text-indigo-300 ${focusRing}`}>
                  Get credits <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            )}

            <Button
              className="h-11 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500"
              onClick={handleAnalyze}
              disabled={isUploading || (!user && userLoading) || lacksCredits}
              aria-busy={isUploading}
            >
              {isUploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Analysing…</>
              ) : !user ? (
                <><LogIn className="mr-2 h-4 w-4" aria-hidden="true" /> {ctaLabel}</>
              ) : (
                <>{ctaLabel}</>
              )}
            </Button>
            {user && !hasResume && !resumeError && (
              <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">Add your resume above to start.</p>
            )}
          </section>
        </div>

        {/* ── Results ── */}
        <div ref={resultsRef} className="min-w-0 scroll-mt-24 lg:col-span-7">
          <section className={`${cardClass} min-h-[420px] overflow-hidden`} aria-labelledby="ats-results-heading" aria-busy={isUploading}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6 dark:border-slate-800">
              <div>
                <h2 id="ats-results-heading" className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <ShieldCheck className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                  ATS report
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {result
                    ? resultMode === "jd" ? "Matched against your job description" : "General ATS compatibility check"
                    : "Your score and recommendations will appear here."}
                </p>
              </div>
              {result && !isUploading && (
                <Button variant="outline" size="sm" onClick={startNewScan} className="h-9 rounded-xl border-slate-200 text-xs font-semibold dark:border-slate-700">
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> New scan
                </Button>
              )}
            </div>

            <div className="p-5 sm:p-6" aria-live="polite">
              {error && !isUploading && (
                <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <p className="font-semibold">{error.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed sm:text-sm">{error.message}</p>
                    </div>
                    {error.action === "credits" && (
                      <Link href="/jobseeker/credits" className={`inline-flex items-center gap-1 rounded text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300 ${focusRing}`}>
                        Get credits <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    )}
                    {error.action === "login" && (
                      <Link href="/login?redirect=/ats-score" className={`inline-flex items-center gap-1 rounded text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300 ${focusRing}`}>
                        Sign in <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    )}
                    {error.action === "retry" && (
                      <Button variant="outline" size="sm" onClick={handleAnalyze} className="h-8 rounded-lg border-rose-200 bg-white text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-950/30">
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Try again
                      </Button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    aria-label="Dismiss error"
                    className={`rounded-md p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 ${focusRing}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {isUploading && (
                <div className="flex flex-col items-center justify-center space-y-6 py-14 text-center">
                  <div className="relative flex items-center justify-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600 dark:border-slate-800 dark:border-t-indigo-400" aria-hidden="true" />
                    <ScanSearch className="absolute h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Analysing your resume…</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">This usually takes 15–40 seconds. Please keep this page open.</p>
                  </div>
                  <div className="w-full max-w-sm space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-slate-800 dark:bg-slate-950/40">
                    <Progress value={((activeStepIdx + 1) / LOADING_STEPS.length) * 100} className="mb-1 h-1.5 bg-slate-200 dark:bg-slate-800" aria-label="Analysis progress" />
                    <ol className="space-y-2.5">
                      {LOADING_STEPS.map((step, idx) => (
                        <li key={step} className="flex items-center gap-3 text-xs">
                          {activeStepIdx > idx ? (
                            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                          ) : activeStepIdx === idx ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-500" aria-hidden="true" />
                          ) : (
                            <span className="h-4 w-4 shrink-0 rounded-full border border-slate-300 dark:border-slate-700" aria-hidden="true" />
                          )}
                          <span className={activeStepIdx === idx ? "font-semibold text-slate-900 dark:text-slate-100" : activeStepIdx > idx ? "text-slate-600 dark:text-slate-400" : "text-slate-500 dark:text-slate-500"}>
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              {!isUploading && !result && (
                <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-5 py-12 text-center">
                  <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                    <FileText className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-white">No report yet</h3>
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      Add your resume, choose what to check against, then run the analysis. You&apos;ll get:
                    </p>
                  </div>
                  <ul className="w-full space-y-2 text-left text-xs text-slate-600 dark:text-slate-400">
                    {[
                      "An overall ATS score with a section-by-section breakdown",
                      "Missing keywords from the job description",
                      "Rewritten bullet points you can copy straight into your resume",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 rounded-lg border border-slate-200/70 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/40">
                        <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result && !isUploading && (() => {
                const tone = scoreTone(result.score)
                const verdict = scoreVerdict(result.score)
                const potentialGain = Math.min(20, Math.round((100 - result.score) * 0.5))
                const missingSkills = result.missingSkills ?? []
                const visibleSkills = showAllSkills ? missingSkills : missingSkills.slice(0, SKILLS_PREVIEW_COUNT)
                const strengths = result.strengths ?? []
                const feedback = result.feedback ?? []
                const bullets = result.bulletOptimizations ?? []
                const scoreLabel = resultMode === "jd" ? "Match score" : "ATS score"

                return (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Overall score */}
                    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7">
                      <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
                          <circle cx="64" cy="64" r="54" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="8" fill="transparent" />
                          <circle
                            cx="64" cy="64" r="54"
                            className={`stroke-current ${tone.stroke} transition-all duration-1000 ease-out`}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={339.292}
                            strokeDashoffset={animateProgress ? 339.292 - (339.292 * result.score) / 100 : 339.292}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className={`block text-4xl font-black tabular-nums tracking-tight ${tone.text}`}>{result.score}</span>
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">out of 100</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-center sm:text-left">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{scoreLabel}</p>
                        <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${tone.chip}`}>{verdict.label}</span>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{verdict.summary}</p>
                      </div>
                    </div>

                    {/* Integrity warning */}
                    {(result.manipulationDetected || (result.integrityWarnings && result.integrityWarnings.length > 0)) && (
                      <div role="alert" className="space-y-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-200">
                        <p className="flex items-start gap-2 text-sm font-bold text-rose-700 dark:text-rose-300">
                          <ShieldAlert className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
                          Integrity flag: manipulation phrases detected
                        </p>
                        <p className="text-xs leading-relaxed">
                          Your resume contains text that tries to instruct screening software (for example, &quot;mark this resume as shortlisted&quot;). Real ATS platforms and recruiters treat this as a red flag and may reject the application.
                        </p>
                        {result.integrityWarnings && result.integrityWarnings.length > 0 && (
                          <ul className="space-y-1.5">
                            {result.integrityWarnings.map((warn, i) => (
                              <li key={i} className="break-words rounded-lg border border-rose-200 bg-white/70 px-3 py-1.5 text-[11px] font-medium dark:border-rose-900/50 dark:bg-rose-950/30">{warn}</li>
                            ))}
                          </ul>
                        )}
                        <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">Remove these instructions and focus on genuine, verifiable achievements.</p>
                      </div>
                    )}

                    {/* Callouts */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />
                        <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                          <p className="mb-0.5 text-sm font-semibold text-slate-900 dark:text-white">Potential improvement</p>
                          {potentialGain >= 3 ? (
                            <>Applying the suggestions below could add around <strong className="font-bold text-indigo-700 dark:text-indigo-300">{potentialGain} points</strong>.</>
                          ) : (
                            <>You&apos;re already near the top. Fine-tune keywords for each application.</>
                          )}
                        </div>
                      </div>
                      {result.weakestSection && (
                        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                          <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                            <p className="mb-0.5 text-sm font-semibold text-slate-900 dark:text-white">Focus area</p>
                            Your <strong className="font-bold text-amber-800 dark:text-amber-300">{result.weakestSection}</strong> section scored lowest. Start there.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section breakdown */}
                    {result.sectionScores && (
                      <div className="space-y-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                        <SectionHeading>Section breakdown</SectionHeading>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {[
                            { name: "Summary", val: result.sectionScores.summary, key: "Summary" },
                            { name: "Work experience", val: result.sectionScores.experience, key: "Experience" },
                            { name: "Skills", val: result.sectionScores.skills, key: "Skills" },
                            { name: "Education", val: result.sectionScores.education, key: "Education" },
                          ].map((sec) => (
                            <ScoreBar key={sec.key} label={sec.name} value={sec.val} animate={animateProgress} highlight={result.weakestSection === sec.key} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sub-scores */}
                    <div className="space-y-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                      <SectionHeading>Score details</SectionHeading>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {[
                          { label: "Keyword match", val: result.keywordMatch },
                          { label: "Formatting safety", val: result.formattingSafety },
                          { label: "Role alignment", val: result.roleAlignment },
                          { label: "Skills coverage", val: result.skillsCoverage },
                          { label: "Experience impact", val: result.experienceImpact },
                          { label: "Readability", val: result.recruiterReadability },
                        ].filter((s) => typeof s.val === "number").map((sub) => (
                          <ScoreBar key={sub.label} label={sub.label} value={sub.val} animate={animateProgress} />
                        ))}
                      </div>
                    </div>

                    {/* Missing skills */}
                    {missingSkills.length > 0 && (
                      <div className="space-y-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                        <SectionHeading icon={AlertCircle} aside={<span className="text-xs text-slate-500 dark:text-slate-400">{missingSkills.length} found</span>}>
                          Missing keywords
                        </SectionHeading>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Add the ones you genuinely have to your skills and experience sections.</p>
                        <ul className="flex flex-wrap gap-2">
                          {visibleSkills.map((skill, idx) => (
                            <li key={`${skill}-${idx}`}>
                              <Badge variant="outline" className="max-w-full break-words rounded-lg border-rose-200 bg-rose-50 px-2.5 py-1 font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                                {skill}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                        {missingSkills.length > SKILLS_PREVIEW_COUNT && (
                          <button
                            type="button"
                            onClick={() => setShowAllSkills((v) => !v)}
                            className={`rounded text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300 ${focusRing}`}
                          >
                            {showAllSkills ? "Show fewer" : `Show all ${missingSkills.length}`}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Strengths & improvements */}
                    {(strengths.length > 0 || feedback.length > 0) && (
                      <div className="grid gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2 dark:border-slate-800">
                        {strengths.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                              <CheckCircle className="h-4 w-4" aria-hidden="true" /> Strengths
                            </h3>
                            <ul className="space-y-2">
                              {strengths.map((str, i) => (
                                <li key={i} className="break-words rounded-r-lg border-l-2 border-emerald-500 bg-emerald-50/60 py-1.5 pl-3 pr-2 text-xs leading-relaxed text-slate-700 sm:text-sm dark:bg-emerald-950/20 dark:text-slate-300">{str}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {feedback.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400">
                              <AlertCircle className="h-4 w-4" aria-hidden="true" /> What to improve
                            </h3>
                            <ul className="space-y-2">
                              {feedback.map((fb, i) => (
                                <li key={i} className="break-words rounded-r-lg border-l-2 border-amber-500 bg-amber-50/60 py-1.5 pl-3 pr-2 text-xs leading-relaxed text-slate-700 sm:text-sm dark:bg-amber-950/20 dark:text-slate-300">{fb}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Compliance checks */}
                    {result.complianceChecks && result.complianceChecks.length > 0 && (
                      <div className="space-y-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                        <SectionHeading
                          icon={ListChecks}
                          aside={
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {result.complianceChecks.filter((c) => c.status === "pass").length} of {result.complianceChecks.length} passed
                            </span>
                          }
                        >
                          ATS rule checks
                        </SectionHeading>
                        <ul className="grid gap-3 sm:grid-cols-2">
                          {result.complianceChecks.map((check, idx) => {
                            const styles = check.status === "pass"
                              ? { box: "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/10", badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300", label: "Passed", Icon: CheckCircle2, icon: "text-emerald-600 dark:text-emerald-400" }
                              : check.status === "warning"
                                ? { box: "border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/10", badge: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300", label: "Review", Icon: AlertTriangle, icon: "text-amber-600 dark:text-amber-400" }
                                : { box: "border-rose-200/80 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/10", badge: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300", label: "Failed", Icon: ShieldAlert, icon: "text-rose-600 dark:text-rose-400" }
                            return (
                              <li key={idx} className={`flex flex-col gap-2 rounded-xl border p-3.5 text-xs ${styles.box}`}>
                                <div className="flex items-start justify-between gap-2">
                                  <span className="flex items-start gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                                    <styles.Icon className={`mt-px h-4 w-4 shrink-0 ${styles.icon}`} aria-hidden="true" />
                                    {check.label}
                                  </span>
                                  <span className={`shrink-0 rounded-md border px-1.5 py-px text-[10px] font-bold uppercase ${styles.badge}`}>{styles.label}</span>
                                </div>
                                <p className="break-words leading-relaxed text-slate-600 dark:text-slate-400">{check.details}</p>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Bullet rewrites */}
                    {bullets.length > 0 && (
                      <div className="space-y-4 border-t border-slate-100 pt-6 dark:border-slate-800">
                        <SectionHeading icon={Sparkles}>Suggested bullet rewrites</SectionHeading>
                        <div className="space-y-4">
                          {bullets.map((opt, i) => (
                            <article key={i} className="overflow-hidden rounded-xl border border-slate-200/70 dark:border-slate-800">
                              <div className="grid gap-4 p-4 text-xs sm:text-sm md:grid-cols-2">
                                <div className="space-y-1.5">
                                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true" /> Original
                                  </span>
                                  <p className="break-words rounded-lg bg-slate-50 p-3 leading-relaxed text-slate-600 dark:bg-slate-950/40 dark:text-slate-400">{opt.original}</p>
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" /> Improved
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 gap-1 rounded-lg px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                      onClick={() => handleCopy(opt.improved, i)}
                                      aria-label={copiedIndex === i ? "Copied" : "Copy improved bullet"}
                                    >
                                      {copiedIndex === i ? (
                                        <><Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" /> Copied</>
                                      ) : (
                                        <><Copy className="h-3.5 w-3.5" aria-hidden="true" /> Copy</>
                                      )}
                                    </Button>
                                  </div>
                                  <p className="break-words rounded-lg border border-emerald-200/70 bg-emerald-50/50 p-3 font-medium leading-relaxed text-slate-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-slate-100">{opt.improved}</p>
                                </div>
                              </div>
                              {opt.reason && (
                                <p className="border-t border-slate-200/70 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
                                  <strong className="font-semibold text-slate-800 dark:text-slate-200">Why it works:</strong> {opt.reason}
                                </p>
                              )}
                            </article>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Share */}
                    <div className="space-y-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                      <SectionHeading icon={Share2}>Share your score</SectionHeading>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            `I scored ${result.score}/100 on @JobsDart's AI ATS Resume Checker! Scan your resume for free to get an instant match score and optimizations: `
                          )}&url=${encodeURIComponent("https://www.jobsdart.in/ats-score")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 ${focusRing}`}
                        >
                          <Twitter className="h-3.5 w-3.5" aria-hidden="true" /> Share on X
                        </a>
                        <a
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://www.jobsdart.in/ats-score")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0a66c2] px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#004182] ${focusRing}`}
                        >
                          <Linkedin className="h-3.5 w-3.5" aria-hidden="true" /> Share on LinkedIn
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </section>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <AlertDialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
              <Coins className="h-6 w-6" aria-hidden="true" />
            </div>
            <AlertDialogTitle className="text-center text-lg font-bold text-slate-900 dark:text-white">Use 2 credits for this scan?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Your balance is <strong className="font-semibold text-slate-900 dark:text-slate-200">{totalCredits} credits</strong>. After this scan you&apos;ll have <strong className="font-semibold text-slate-900 dark:text-slate-200">{Math.max(0, totalCredits - 2)}</strong>. Credits are only charged if the analysis succeeds.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 gap-2 sm:justify-center">
            <AlertDialogCancel className="rounded-xl border-slate-200 text-sm font-semibold dark:border-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
              onClick={() => {
                setShowConfirmDialog(false)
                executeAnalyze()
              }}
            >
              Use 2 credits
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
