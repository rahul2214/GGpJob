"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@/contexts/user-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  Loader2, Sparkles, Plus, Trash2, Printer, Copy, Check, Briefcase,
  Code, GraduationCap, User, FileText, ChevronRight, Settings, Coins,
  Award, Download, ShieldCheck, Info, RefreshCw, Layers, ArrowRight, Sparkle,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
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

interface JobInput {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  location: string;
  points: string[];
  currentlyWorkHere?: boolean;
}

interface ProjectInput {
  name: string;
  techStack: string;
  projectLink?: string;
  points: string[];
}

interface EducationInput {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  year: string;
  grade?: string;
}

interface SkillCategory {
  category: string;
  skills: string[];
}

interface ResumeData {
  name: string;
  role?: string;
  contact: {
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    portfolio?: string;
    location?: string;
  };
  summary: string;
  skills: SkillCategory[];
  languages?: string[];
  achievements?: string[];
  experience: {
    company: string;
    role: string;
    dates: string;
    location?: string;
    bullets: string[];
  }[];
  projects: {
    name: string;
    techStack: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    dates: string;
    grade?: string;
  }[];
  referralCard?: string;
}

interface Draft {
  id: string;
  title: string;
  template_type: string;
  updated_at: string;
  resume_data: any;
}

interface GapAnalysisResult {
  score: number;
  keywordMatch: number;
  missingKeywords: string[];
  suggestedAdditions: { keyword: string; suggestion: string }[];
}

type EditorSection = 'personal' | 'summary' | 'experience' | 'projects' | 'skills' | 'education' | 'achievements';

const formatUrl = (url?: string) => {
  if (!url) return ""
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed}`
}

function normalizeSkills(skills: any): SkillCategory[] {
  const defaultSkills: SkillCategory[] = [
    { category: "Languages", skills: [""] },
    { category: "Frameworks/Libraries", skills: [""] },
    { category: "Databases", skills: [""] },
    { category: "Tools/DevOps", skills: [""] }
  ];
  if (!skills) return defaultSkills;
  if (Array.isArray(skills)) {
    if (skills.length === 0) return defaultSkills;
    if (typeof skills[0] === 'string') {
      return [{ category: "Skills", skills: skills }];
    }
    return skills.map((cat: any) => ({
      category: typeof cat.category === 'string' && cat.category.trim() !== "" ? cat.category : "Skills",
      skills: Array.isArray(cat.skills) ? cat.skills.map((s: any) => typeof s === 'string' ? s : "") : [""]
    }));
  }
  return defaultSkills;
}

export default function ResumeBuilderPage() {
  const { user, refreshUser } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  // App States
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)

  // Section Navigation State
  const [activeSection, setActiveSection] = useState<EditorSection>('personal')

  // Version History / Drafts State
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [selectedDraftId, setSelectedDraftId] = useState<string>("new")
  const [draftTitle, setDraftTitle] = useState("My Resume")
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [visualTemplate, setVisualTemplate] = useState<string>("classic-serif")

  // AI Assist State
  const [showAiAssist, setShowAiAssist] = useState(false)
  const [aiAssistSection, setAiAssistSection] = useState<'experience' | 'summary'>('experience')
  const [aiAssistJobIndex, setAiAssistJobIndex] = useState<number>(0)
  const [aiAssistPointIndex, setAiAssistPointIndex] = useState<number>(0)
  const [isAiAssisting, setIsAiAssisting] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [aiVerbs, setAiVerbs] = useState<string[]>([])

  // ATS Gap Analysis State
  const [targetJd, setTargetJd] = useState("")
  const [isAnalyzingJd, setIsAnalyzingJd] = useState(false)
  const [gapResult, setGapResult] = useState<GapAnalysisResult | null>(null)

  // Form States
  const [templateType, setTemplateType] = useState("Software Engineer")
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [location, setLocation] = useState("")
  const [skills, setSkills] = useState<SkillCategory[]>([
    { category: "Languages", skills: [""] },
    { category: "Frameworks/Libraries", skills: [""] },
    { category: "Databases", skills: [""] },
    { category: "Tools/DevOps", skills: [""] }
  ])
  const [professionalSummary, setProfessionalSummary] = useState("")
  const [languages, setLanguages] = useState<string[]>([""])
  const [achievements, setAchievements] = useState<string[]>([""])

  const [jobs, setJobs] = useState<JobInput[]>([
    { company: "", role: "", startDate: "", endDate: "", location: "", points: [""], currentlyWorkHere: false }
  ])
  const [projects, setProjects] = useState<ProjectInput[]>([
    { name: "", techStack: "", projectLink: "", points: [""] }
  ])
  const [education, setEducation] = useState<EducationInput[]>([
    { institution: "", degree: "", fieldOfStudy: "", year: "", grade: "" }
  ])

  // Result State
  const [generatedResume, setGeneratedResume] = useState<ResumeData | null>(null)

  const isLoadedRef = useRef(false)

  // 1. Load work-in-progress data from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem("jobsdart_resume_builder_wip")
      if (saved) {
        const data = JSON.parse(saved)
        if (data.selectedDraftId) setSelectedDraftId(data.selectedDraftId)
        if (data.draftTitle) setDraftTitle(data.draftTitle)
        if (data.templateType) setTemplateType(data.templateType)
        if (data.visualTemplate) setVisualTemplate(data.visualTemplate)
        if (data.name !== undefined) setName(data.name)
        if (data.role !== undefined) setRole(data.role)
        if (data.email !== undefined) setEmail(data.email)
        if (data.phone !== undefined) setPhone(data.phone)
        if (data.linkedinUrl !== undefined) setLinkedinUrl(data.linkedinUrl)
        if (data.githubUrl !== undefined) setGithubUrl(data.githubUrl)
        if (data.portfolioUrl !== undefined) setPortfolioUrl(data.portfolioUrl)
        if (data.location !== undefined) setLocation(data.location)
        if (data.skills !== undefined) setSkills(normalizeSkills(data.skills))
        if (data.professionalSummary !== undefined) setProfessionalSummary(data.professionalSummary)
        if (data.languages !== undefined) setLanguages(data.languages)
        if (data.achievements !== undefined) setAchievements(data.achievements)
        if (data.jobs !== undefined) setJobs(data.jobs)
        if (data.projects !== undefined) setProjects(data.projects)
        if (data.education !== undefined) setEducation(data.education)
        if (data.generatedResume !== undefined) setGeneratedResume(data.generatedResume)
      }
    } catch (e) {
      console.error("Error loading WIP from localStorage:", e)
    } finally {
      isLoadedRef.current = true
    }
  }, [])

  // 2. Save work-in-progress data to localStorage on change
  useEffect(() => {
    if (!isLoadedRef.current) return
    try {
      const wipData = {
        selectedDraftId,
        draftTitle,
        templateType,
        visualTemplate,
        name,
        role,
        email,
        phone,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        location,
        skills,
        professionalSummary,
        languages,
        achievements,
        jobs,
        projects,
        education,
        generatedResume
      }
      localStorage.setItem("jobsdart_resume_builder_wip", JSON.stringify(wipData))
    } catch (e) {
      console.error("Error saving WIP to localStorage:", e)
    }
  }, [
    selectedDraftId,
    draftTitle,
    templateType,
    visualTemplate,
    name,
    role,
    email,
    phone,
    linkedinUrl,
    githubUrl,
    portfolioUrl,
    location,
    skills,
    professionalSummary,
    languages,
    achievements,
    jobs,
    projects,
    education,
    generatedResume
  ])

  // Set initial contact details from user profile
  useEffect(() => {
    if (user && selectedDraftId === 'new') {
      // Avoid overwriting work-in-progress inputs loaded from localStorage
      const savedWip = localStorage.getItem("jobsdart_resume_builder_wip")
      if (savedWip) {
        try {
          const parsed = JSON.parse(savedWip)
          // If name, email, or phone has already been entered/restored, do not overwrite with profile
          if (parsed.name || parsed.email || parsed.phone) {
            return
          }
        } catch (e) {
          console.error("Error parsing WIP during profile initialization:", e)
        }
      }

      setName(user.name || "")
      setRole(user.headline || "")
      setEmail(user.email || "")
      setPhone(user.phone || "")
      setLinkedinUrl(user.linkedinUrl || "")
      setGithubUrl(user.githubUrl || "")
      setPortfolioUrl(user.portfolioUrl || "")
      setLocation(user.location || "")
      if (user.skills && user.skills.length > 0) {
        setSkills(normalizeSkills(user.skills.map(s => s.name)))
      }
    }
  }, [user, selectedDraftId])

  // Fetch drafts on mount / user change
  const fetchDrafts = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/resume/drafts?userId=${user.uuid}`)
      if (res.ok) {
        const data = await res.json()
        setDrafts(data)
      }
    } catch (e) {
      console.error("Error loading drafts:", e)
    }
  }

  useEffect(() => {
    if (user) {
      fetchDrafts()
    }
  }, [user])

  // Load a selected draft
  const handleLoadDraft = (draftId: string) => {
    setSelectedDraftId(draftId)
    if (draftId === 'new') {
      // Reset form states
      setDraftTitle("My Resume")
      setTemplateType("Software Engineer")
      setName(user?.name || "")
      setRole(user?.headline || "")
      setEmail(user?.email || "")
      setPhone(user?.phone || "")
      setLinkedinUrl(user?.linkedinUrl || "")
      setGithubUrl(user?.githubUrl || "")
      setPortfolioUrl(user?.portfolioUrl || "")
      setLocation(user?.location || "")
      setSkills(user?.skills && user.skills.length > 0 ? normalizeSkills(user.skills.map(s => s.name)) : [
        { category: "Languages", skills: [""] },
        { category: "Frameworks/Libraries", skills: [""] },
        { category: "Databases", skills: [""] },
        { category: "Tools/DevOps", skills: [""] }
      ])
      setProfessionalSummary("")
      setLanguages([""])
      setAchievements([""])
      setJobs([{ company: "", role: "", startDate: "", endDate: "", location: "", points: [""], currentlyWorkHere: false }])
      setProjects([{ name: "", techStack: "", points: [""] }])
      setEducation([{ institution: "", degree: "", fieldOfStudy: "", year: "", grade: "" }])
      setGeneratedResume(null)
      setGapResult(null)
      setVisualTemplate("classic-serif")
      return
    }

    const draft = drafts.find(d => d.id === draftId)
    if (!draft) return

    setDraftTitle(draft.title)
    setTemplateType(draft.template_type)

    const data = draft.resume_data
    setName(data.name || "")
    setRole(data.role || "")
    setEmail(data.contact?.email || "")
    setPhone(data.contact?.phone || "")
    setLinkedinUrl(data.contact?.linkedin || "")
    setGithubUrl(data.contact?.github || "")
    setPortfolioUrl(data.contact?.portfolio || "")
    setLocation(data.contact?.location || "")
    setSkills(normalizeSkills(data.skills))
    setProfessionalSummary(data.summary || "")
    setLanguages(data.languages && data.languages.length > 0 ? data.languages : [""])
    setAchievements(data.achievements && data.achievements.length > 0 ? data.achievements : [""])

    // Parse jobs
    if (data.experience && data.experience.length > 0) {
      setJobs(data.experience.map((exp: any) => {
        const dates = exp.dates || ""
        let startDate = ""
        let endDate = ""
        let currentlyWorkHere = false

        if (dates.includes(" - ")) {
          const parts = dates.split(" - ")
          startDate = parts[0]
          endDate = parts[1]
          if (endDate.toLowerCase() === 'present') {
            currentlyWorkHere = true
            endDate = ""
          }
        } else {
          startDate = dates
        }

        return {
          company: exp.company || "",
          role: exp.role || "",
          startDate: startDate,
          endDate: endDate,
          location: exp.location || "",
          points: exp.bullets && exp.bullets.length > 0 ? exp.bullets : [""],
          currentlyWorkHere
        }
      }))
    } else {
      setJobs([{ company: "", role: "", startDate: "", endDate: "", location: "", points: [""], currentlyWorkHere: false }])
    }

    // Parse projects
    if (data.projects && data.projects.length > 0) {
      setProjects(data.projects.map((proj: any) => ({
        name: proj.name || "",
        techStack: proj.techStack || "",
        projectLink: proj.projectLink || "",
        points: proj.bullets && proj.bullets.length > 0 ? proj.bullets : [""]
      })))
    } else {
      setProjects([{ name: "", techStack: "", projectLink: "", points: [""] }])
    }

    // Parse education
    if (data.education && data.education.length > 0) {
      setEducation(data.education.map((edu: any) => ({
        institution: edu.institution || "",
        degree: edu.degree || "",
        fieldOfStudy: edu.fieldOfStudy || "",
        year: edu.dates || "",
        grade: edu.grade || ""
      })))
    } else {
      setEducation([{ institution: "", degree: "", fieldOfStudy: "", year: "", grade: "" }])
    }

    // If it was already synthesized, set the preview
    if (data.isGenerated) {
      setGeneratedResume(data)
    } else {
      setGeneratedResume(null)
    }
    setVisualTemplate(data.visualTemplate || "classic-serif")
    setGapResult(null)
  }

  // Save active form as a draft
  const handleSaveDraft = async () => {
    if (!user) {
      toast({ title: "Please Login", description: "You must be signed in to save resume drafts.", variant: "destructive" })
      return
    }

    setIsSavingDraft(true)
    try {
      const resumePayload = {
        name,
        role,
        contact: { email, phone, linkedin: linkedinUrl, github: githubUrl, portfolio: portfolioUrl, location },
        summary: professionalSummary,
        skills: skills.map(cat => ({
          category: cat.category.trim(),
          skills: cat.skills.map(s => s.trim()).filter(Boolean)
        })).filter(cat => cat.category || cat.skills.length > 0),
        languages: languages.map(l => l.trim()).filter(Boolean),
        achievements: achievements.map(a => a.trim()).filter(Boolean),
        experience: jobs.filter(j => j.company).map(j => ({
          company: j.company,
          role: j.role,
          dates: `${j.startDate} - ${j.currentlyWorkHere ? 'Present' : j.endDate}`,
          location: j.location,
          bullets: j.points.filter(Boolean)
        })),
        projects: projects.filter(p => p.name).map(p => ({
          name: p.name,
          techStack: p.techStack,
          projectLink: p.projectLink || "",
          bullets: p.points.filter(Boolean)
        })),
        education: education.filter(e => e.institution).map(e => ({
          institution: e.institution,
          degree: e.degree,
          fieldOfStudy: e.fieldOfStudy,
          dates: e.year,
          grade: e.grade
        })),
        visualTemplate,
        isGenerated: !!generatedResume,
        referralCard: generatedResume?.referralCard
      }

      const res = await fetch('/api/resume/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedDraftId === 'new' ? undefined : selectedDraftId,
          userId: user.uuid,
          title: draftTitle || 'Untitled Resume',
          templateType,
          resumeData: resumePayload
        })
      })

      if (!res.ok) {
        throw new Error("Failed to save draft to database.")
      }

      const savedData = await res.json()
      toast({ title: "Resume Saved! 💾", description: `"${draftTitle}" saved successfully.` })

      // Update local state
      if (selectedDraftId === 'new') {
        setSelectedDraftId(savedData.id)
      }
      await fetchDrafts()
    } catch (e: any) {
      console.error(e)
      toast({ title: "Save Failed", description: e.message || "An error occurred.", variant: "destructive" })
    } finally {
      setIsSavingDraft(false)
    }
  }

  // Delete a draft version
  const handleDeleteDraft = async () => {
    if (selectedDraftId === 'new' || !user) return
    try {
      const res = await fetch(`/api/resume/drafts?id=${selectedDraftId}&userId=${user.uuid}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast({ title: "Resume Deleted", description: "Version deleted successfully." })
        handleLoadDraft('new')
        await fetchDrafts()
      } else {
        throw new Error("Failed to delete draft.")
      }
    } catch (e: any) {
      console.error(e)
      toast({ title: "Delete Failed", description: e.message || "Could not delete.", variant: "destructive" })
    }
  }

  // Open inline AI Assist suggestions panel
  const handleOpenAiAssist = async (sec: 'experience' | 'summary', jobIdx = 0, pIdx = 0) => {
    setAiAssistSection(sec)
    setAiAssistJobIndex(jobIdx)
    setAiAssistPointIndex(pIdx)
    setShowAiAssist(true)
    setIsAiAssisting(true)
    setAiSuggestions([])
    setAiVerbs([])

    try {
      const skillsList = skills.flatMap(cat => cat.skills.map(s => s.trim()).filter(Boolean)).join(", ")
      const activeRole = role || templateType
      const textContext = sec === 'experience' ? jobs[jobIdx].points[pIdx] : professionalSummary

      const res = await fetch('/api/resume/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: sec,
          role: activeRole,
          skills: skillsList,
          rawText: textContext
        })
      })

      if (!res.ok) {
        throw new Error("Failed to fetch suggestions from Groq.")
      }

      const data = await res.json()
      setAiSuggestions(data.suggestions || [])
      setAiVerbs(data.actionVerbs || [])
    } catch (e: any) {
      console.error(e)
      toast({ title: "AI Assist Failed", description: "Could not generate suggestions at this time.", variant: "destructive" })
      setShowAiAssist(false)
    } finally {
      setIsAiAssisting(false)
    }
  }

  // Apply chosen AI recommendation
  const handleApplyAiSuggestion = (suggestionText: string) => {
    if (aiAssistSection === 'summary') {
      setProfessionalSummary(suggestionText)
    } else {
      const updated = [...jobs]
      updated[aiAssistJobIndex].points[aiAssistPointIndex] = suggestionText
      setJobs(updated)
    }
    setShowAiAssist(false)
    toast({ title: "Applied! ✨", description: "Suggestion inserted successfully." })
  }

  // Run ATS Gap Analysis
  const handleRunGapAnalysis = async () => {
    if (!targetJd) {
      toast({ title: "Job Description Required", description: "Please paste a job description first.", variant: "destructive" })
      return
    }

    setIsAnalyzingJd(true)
    setGapResult(null)
    try {
      const activeResumeData = {
        name,
        role,
        summary: professionalSummary,
        skills: skills.flatMap(cat => cat.skills.map(s => s.trim()).filter(Boolean)),
        experience: jobs.filter(j => j.company).map(j => ({
          company: j.company,
          role: j.role,
          bullets: j.points.filter(Boolean)
        })),
        projects: projects.filter(p => p.name).map(p => ({
          name: p.name,
          techStack: p.techStack,
          projectLink: p.projectLink || "",
          bullets: p.points.filter(Boolean)
        }))
      }

      const res = await fetch('/api/resume/gap-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData: activeResumeData,
          jobDescription: targetJd
        })
      })

      if (!res.ok) {
        throw new Error("Gap analysis request failed.")
      }

      const data = await res.json()
      setGapResult(data)
      toast({ title: "Analysis Complete! 📈", description: `Pasted job description match rate: ${data.score}%` })
    } catch (e: any) {
      console.error(e)
      toast({ title: "Analysis Failed", description: e.message || "An error occurred.", variant: "destructive" })
    } finally {
      setIsAnalyzingJd(false)
    }
  }

  // Dynamic Array Modifiers
  const addJob = () => setJobs([...jobs, { company: "", role: "", startDate: "", endDate: "", location: "", points: [""], currentlyWorkHere: false }])
  const removeJob = (index: number) => setJobs(jobs.filter((_, i) => i !== index))
  const updateJob = (index: number, field: keyof JobInput, val: any) => {
    const updated = [...jobs]
      ; (updated[index] as any)[field] = val
    setJobs(updated)
  }

  const addProject = () => setProjects([...projects, { name: "", techStack: "", projectLink: "", points: [""] }])
  const removeProject = (index: number) => setProjects(projects.filter((_, i) => i !== index))
  const updateProject = (index: number, field: keyof ProjectInput, val: any) => {
    const updated = [...projects]
      ; (updated[index] as any)[field] = val
    setProjects(updated)
  }

  const addEducation = () => setEducation([...education, { institution: "", degree: "", fieldOfStudy: "", year: "", grade: "" }])
  const removeEducation = (index: number) => setEducation(education.filter((_, i) => i !== index))
  const updateEducation = (index: number, field: keyof EducationInput, val: string) => {
    const updated = [...education]
    updated[index][field] = val
    setEducation(updated)
  }

  const addLanguage = () => setLanguages([...languages, ""])
  const removeLanguage = (index: number) => setLanguages(languages.filter((_, i) => i !== index))
  const updateLanguage = (index: number, val: string) => {
    const updated = [...languages]
    updated[index] = val
    setLanguages(updated)
  }

  const addAchievement = () => setAchievements([...achievements, ""])
  const removeAchievement = (index: number) => setAchievements(achievements.filter((_, i) => i !== index))
  const updateAchievement = (index: number, val: string) => {
    const updated = [...achievements]
    updated[index] = val
    setAchievements(updated)
  }

  const addSkillCategory = () => setSkills([...skills, { category: "", skills: [""] }])
  const removeSkillCategory = (catIdx: number) => setSkills(skills.filter((_, i) => i !== catIdx))
  const updateCategoryName = (catIdx: number, val: string) => {
    const updated = [...skills]
    updated[catIdx].category = val
    setSkills(updated)
  }
  const addSkillToCategory = (catIdx: number) => {
    const updated = [...skills]
    updated[catIdx].skills = [...updated[catIdx].skills, ""]
    setSkills(updated)
  }
  const removeSkillFromCategory = (catIdx: number, skillIdx: number) => {
    const updated = [...skills]
    updated[catIdx].skills = updated[catIdx].skills.filter((_, i) => i !== skillIdx)
    if (updated[catIdx].skills.length === 0) {
      updated[catIdx].skills = [""]
    }
    setSkills(updated)
  }
  const updateSkillInCategory = (catIdx: number, skillIdx: number, val: string) => {
    const updated = [...skills]
    updated[catIdx].skills[skillIdx] = val
    setSkills(updated)
  }

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const executeGenerate = async () => {
    setIsGenerating(true)
    try {
      const skillsArray = skills.map(cat => ({
        category: cat.category.trim(),
        skills: cat.skills.map(s => s.trim()).filter(Boolean)
      })).filter(cat => cat.category || cat.skills.length > 0)
      const experienceList = jobs.filter(j => j.company && j.role).map(j => ({
        company: j.company,
        role: j.role,
        startDate: j.startDate,
        endDate: j.currentlyWorkHere ? "Present" : j.endDate,
        location: j.location,
        description: j.points ? j.points.filter(Boolean).join("\n") : ""
      }))
      const projectsList = projects.filter(p => p.name).map(p => ({
        name: p.name,
        techStack: p.techStack,
        projectLink: p.projectLink || "",
        description: p.points ? p.points.filter(Boolean).join("\n") : ""
      }))
      const educationList = education.filter(e => e.institution).map(e => ({
        institution: e.institution,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy,
        year: e.year,
        grade: e.grade
      }))

      const languagesArray = languages.map(l => l.trim()).filter(Boolean)
      const achievementsArray = achievements.map(a => a.trim()).filter(Boolean)
      const response = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactInfo: { name, email, phone, linkedinUrl, githubUrl, portfolioUrl, location, role },
          templateType,
          experience: experienceList,
          projects: projectsList,
          skills: skillsArray,
          education: educationList,
          professionalSummary,
          languages: languagesArray,
          achievements: achievementsArray,
          userId: user?.uuid
        })
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "Failed to generate resume")
      }

      const data = await response.json()
      setGeneratedResume(data)

      // Load AI optimized values back into the input form fields so they are editable in real-time
      if (data.name) setName(data.name)
      if (data.role) setRole(data.role)
      if (data.contact) {
        if (data.contact.email) setEmail(data.contact.email)
        if (data.contact.phone) setPhone(data.contact.phone)
        if (data.contact.linkedin) setLinkedinUrl(data.contact.linkedin)
        if (data.contact.github) setGithubUrl(data.contact.github)
        if (data.contact.portfolio) setPortfolioUrl(data.contact.portfolio)
        if (data.contact.location) setLocation(data.contact.location)
      }
      if (data.summary) setProfessionalSummary(data.summary)
      if (data.skills && data.skills.length > 0) setSkills(normalizeSkills(data.skills))
      if (data.languages && data.languages.length > 0) setLanguages(data.languages)
      if (data.achievements && data.achievements.length > 0) setAchievements(data.achievements)

      if (data.experience && data.experience.length > 0) {
        setJobs(data.experience.map((exp: any) => {
          const dates = exp.dates || ""
          let startDate = ""
          let endDate = ""
          let currentlyWorkHere = false

          if (dates.includes(" - ")) {
            const parts = dates.split(" - ")
            startDate = parts[0]
            endDate = parts[1]
            if (endDate.toLowerCase() === 'present') {
              currentlyWorkHere = true
              endDate = ""
            }
          } else {
            startDate = dates
          }

          return {
            company: exp.company || "",
            role: exp.role || "",
            startDate,
            endDate,
            location: exp.location || "",
            points: exp.bullets && exp.bullets.length > 0 ? exp.bullets : [""],
            currentlyWorkHere
          }
        }))
      }

      if (data.projects && data.projects.length > 0) {
        setProjects(data.projects.map((proj: any) => ({
          name: proj.name || "",
          techStack: proj.techStack || "",
          projectLink: proj.projectLink || "",
          points: proj.bullets && proj.bullets.length > 0 ? proj.bullets : [""]
        })))
      }

      if (data.education && data.education.length > 0) {
        setEducation(data.education.map((edu: any) => ({
          institution: edu.institution || "",
          degree: edu.degree || "",
          fieldOfStudy: edu.fieldOfStudy || "",
          year: edu.dates || "",
          grade: edu.grade || ""
        })))
      }

      setActiveTab("preview")
      toast({ title: "Resume Generated! ✨", description: "Your ATS-safe resume is ready to print or copy." })
      await refreshUser()
    } catch (err: any) {
      console.error(err)
      toast({ title: "Generation Failed", description: err.message || "An error occurred.", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerate = async () => {
    if (!name || !email) {
      toast({ title: "Name & Email Required", description: "Please enter your name and email.", variant: "destructive" })
      return
    }

    if (!user) {
      router.push("/login?redirect=/resume-builder")
      return
    }

    const hasUsedBuilder = user.metadata?.has_used_resume_builder === true
    const totalCredits = user.totalCredits ?? 0

    if (hasUsedBuilder && totalCredits < 1) {
      toast({ title: "Insufficient Credits", description: "Generating resumes costs 1 credit. Please buy more credits.", variant: "destructive" })
      return
    }

    if (!hasUsedBuilder) {
      await executeGenerate()
    } else {
      setShowConfirmDialog(true)
    }
  }

  const handleDownloadPdf = async () => {
    // Construct current state snapshot of candidate data
    const currentResumeData = {
      name: name || "Your Name",
      role: role || "",
      contact: {
        email: email || "",
        phone: phone || "",
        linkedin: linkedinUrl || "",
        github: githubUrl || "",
        portfolio: portfolioUrl || "",
        location: location || ""
      },
      summary: professionalSummary || "",
      skills: skills.map(cat => ({
        category: cat.category.trim(),
        skills: cat.skills.map(s => s.trim()).filter(Boolean)
      })).filter(cat => cat.category || cat.skills.length > 0),
      languages: languages.map(l => l.trim()).filter(Boolean),
      achievements: achievements.map(a => a.trim()).filter(Boolean),
      experience: jobs.filter(j => j.company || j.role).map(j => ({
        company: j.company || "",
        role: j.role || "",
        dates: j.currentlyWorkHere
          ? `${j.startDate || ""} - Present`
          : `${j.startDate || ""}${j.endDate ? ` - ${j.endDate}` : ""}`,
        location: j.location || "",
        bullets: j.points.filter(Boolean)
      })),
      projects: projects.filter(p => p.name).map(p => ({
        name: p.name || "",
        techStack: p.techStack || "",
        projectLink: p.projectLink || "",
        bullets: p.points.filter(Boolean)
      })),
      education: education.filter(e => e.institution || e.degree).map(e => ({
        institution: e.institution || "",
        degree: e.degree || "",
        fieldOfStudy: e.fieldOfStudy || "",
        dates: e.year || "",
        grade: e.grade || ""
      }))
    }

    setIsDownloadingPdf(true)
    try {
      const { pdf } = await import("@react-pdf/renderer")
      const { ResumePdfDocument } = await import("@/components/resume/ResumePdfDocument")

      const blob = await pdf(<ResumePdfDocument data={currentResumeData} template={visualTemplate} />).toBlob()

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${currentResumeData.name.replace(/\s+/g, "_") || "resume"}_ATS_Optimized.pdf`
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "PDF Saved! 📄",
        description: "Your ATS-optimized text-selectable PDF has been downloaded directly."
      })
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Download Failed",
        description: err.message || "An error occurred while generating PDF.",
        variant: "destructive"
      })
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  const getMarkdownFormat = () => {
    const contactParts = [
      email,
      phone,
      location,
      linkedinUrl ? `LinkedIn: ${linkedinUrl}` : "",
      githubUrl ? `GitHub: ${githubUrl}` : "",
      portfolioUrl ? `Portfolio: ${portfolioUrl}` : ""
    ].filter(Boolean).join(" | ")

    const formattedEdu = education.filter(e => e.institution).map(edu => `### ${edu.degree || "Degree"}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""} — ${edu.institution}
*${edu.year || ""}*${edu.grade ? `\n*Grade: ${edu.grade}*` : ""}
`).join("\n")

    const formattedExp = jobs.filter(j => j.company).map(exp => `### ${exp.role || "Role"} - ${exp.company}${exp.location ? ` (${exp.location})` : ""}
*${exp.startDate || ""}${exp.currentlyWorkHere ? " - Present" : exp.endDate ? ` - ${exp.endDate}` : ""}*
${exp.points ? exp.points.filter(Boolean).map(b => `* ${b}`).join("\n") : ""}
`).join("\n")

    const formattedProj = projects.filter(p => p.name).map(proj => `### ${proj.projectLink ? `[${proj.name}](${proj.projectLink})` : proj.name}
*Technologies: ${proj.techStack || ""}*
${proj.points ? proj.points.filter(Boolean).map(b => `* ${b}`).join("\n") : ""}
`).join("\n")

    const skillsStr = typeof skills[0] === 'string'
      ? (skills as any).filter(Boolean).join(", ")
      : skills.map(cat => `* **${cat.category}**: ${cat.skills.filter(Boolean).join(", ")}`).join("\n")
    const achList = achievements.filter(Boolean).map(a => `* ${a}`).join("\n")
    const langStr = languages.filter(Boolean).join(", ")

    return `# ${name || "Your Name"}
${role ? `${role}\n` : ""}${contactParts}

${professionalSummary ? `## Professional Summary\n${professionalSummary}\n\n` : ""}${skillsStr ? `## Skills\n${skillsStr}\n\n` : ""}${formattedEdu ? `## Education\n${formattedEdu}\n\n` : ""}${formattedExp ? `## Experience\n${formattedExp}\n\n` : ""}${formattedProj ? `## Projects\n${formattedProj}\n\n` : ""}${achList ? `## Achievements\n${achList}\n\n` : ""}${langStr ? `## Languages\n${langStr}\n\n` : ""}`
  }

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(getMarkdownFormat())
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2000)
    toast({ title: "Copied!", description: "Markdown copy saved to clipboard." })
  }

  return (
    <div className="container max-w-7xl py-12 px-4 md:px-8">
      {/* CSS print override */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-resume-area, #printable-resume-area * {
            visibility: visible;
          }
          #printable-resume-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Hero Section */}
      <div className="mb-8 text-center space-y-4 print:hidden">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
          AI Resume Builder
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto font-medium">
          Create structured, ATS-safe resumes with inline AI helpers, instant match scoring, and automatic referral blurbs.
        </p>
      </div>

      {/* Toolbar: Draft Naming & Saving Options */}
      <div className="mb-6 p-4 bg-white/60 dark:bg-slate-900/50 backdrop-blur border border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm print:hidden">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-indigo-500 shrink-0" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Version:</span>
              <Select value={selectedDraftId} onValueChange={handleLoadDraft}>
                <SelectTrigger className="w-[180px] h-9 rounded-xl border-slate-250 text-xs font-semibold bg-slate-50/50">
                  <SelectValue placeholder="Select draft" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="new" className="text-xs font-bold text-indigo-600">+ Create New Version</SelectItem>
                  {drafts.map(d => (
                    <SelectItem key={d.id} value={d.id} className="text-xs">
                      {d.title} ({new Date(d.updated_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedDraftId !== 'new' && (
              <Button
                variant="ghost"
                size="icon"
                className="text-rose-500 hover:bg-rose-50 h-8 w-8 rounded-lg shrink-0"
                onClick={handleDeleteDraft}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 border-l border-slate-200/65 dark:border-slate-800/80 pl-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Design Layout:</span>
            <Select value={visualTemplate} onValueChange={setVisualTemplate}>
              <SelectTrigger className="w-[160px] h-9 rounded-xl border-slate-250 text-xs font-semibold bg-slate-50/50">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="classic-serif" className="text-xs">Classic Serif</SelectItem>
                <SelectItem value="modern-minimal" className="text-xs">Modern Minimalist</SelectItem>
                <SelectItem value="executive-navy" className="text-xs">Executive Navy</SelectItem>
                <SelectItem value="compact-tech" className="text-xs">Compact Tech</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 sm:flex-none justify-end">
          <Input
            value={draftTitle}
            onChange={e => setDraftTitle(e.target.value)}
            placeholder="Draft Name"
            className="w-[150px] sm:w-[180px] h-9 rounded-xl border-slate-250 text-xs bg-slate-50/50"
          />
          <Button
            size="sm"
            onClick={handleSaveDraft}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            disabled={isSavingDraft}
          >
            {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
            Save Version
          </Button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl mb-6 shadow-sm max-w-md mx-auto print:hidden">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === "edit"
              ? "bg-[#2e5bff] text-white shadow-md"
              : "text-slate-600 dark:text-slate-400"
            }`}
        >
          <FileText className="w-4 h-4" />
          Edit Sections
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === "preview"
              ? "bg-[#2e5bff] text-white shadow-md"
              : "text-slate-600 dark:text-slate-400"
            }`}
        >
          <Sparkles className="w-4 h-4" />
          Preview & ATS
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Step-by-Step Editor Panel - Left Column */}
        <div className={`lg:col-span-5 space-y-6 print:hidden ${activeTab === "edit" ? "block" : "hidden lg:block"}`}>
          {/* Section Selector Tab lists */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-950/40 border border-slate-200/30 dark:border-slate-850 rounded-2xl">
            {[
              { id: 'personal', label: 'Contact' },
              { id: 'skills', label: 'Skills' },
              { id: 'education', label: 'Education' },
              { id: 'experience', label: 'Experience' },
              { id: 'projects', label: 'Projects' },
              { id: 'summary', label: 'Summary' }
            ].map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as EditorSection)}
                className={`py-1.5 px-3 text-[11px] font-bold rounded-xl transition-all flex-1 ${activeSection === sec.id
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* Section Edit Cards */}
          {activeSection === 'personal' && (
            <Card className="border border-slate-200/60 dark:border-slate-800/80 shadow-md rounded-2xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" />
                  1. Contact Information
                </CardTitle>
                <CardDescription className="text-xs">Select target profile standards & contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Target Profile / Layout Standard</label>
                  <Select value={templateType} onValueChange={setTemplateType}>
                    <SelectTrigger className="rounded-xl border-slate-200 bg-white/50 h-9 text-xs">
                      <SelectValue placeholder="Select target role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Software Engineer" className="text-xs">Software Engineer (Tech Focused)</SelectItem>
                      <SelectItem value="Product Manager" className="text-xs">Product Manager (Impact & Data Focused)</SelectItem>
                      <SelectItem value="Fresher" className="text-xs">Fresher (Projects & Academics Focused)</SelectItem>
                      <SelectItem value="Experienced" className="text-xs">Experienced (Leadership & System Focused)</SelectItem>
                      <SelectItem value="US Format" className="text-xs">US Standard format (No photos, clean grid)</SelectItem>
                      <SelectItem value="India Format" className="text-xs">India Standard format (City headers, structured)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Full Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Amit Kumar" className="rounded-xl h-9 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Role / Headline</label>
                  <Input value={role} onChange={e => setRole(e.target.value)} placeholder="Software Engineer" className="rounded-xl h-9 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Email</label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="amit@gmail.com" className="rounded-xl h-9 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Phone</label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="9876543210" className="rounded-xl h-9 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">LinkedIn URL</label>
                    <Input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="linkedin.com/in/amit" className="rounded-xl h-9 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">GitHub URL</label>
                    <Input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="github.com/amit" className="rounded-xl h-9 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Portfolio Link</label>
                    <Input value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="amit.dev" className="rounded-xl h-9 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Location</label>
                    <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Bengaluru, India" className="rounded-xl h-9 text-xs" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'summary' && (
            <Card className="border border-slate-200/60 dark:border-slate-800/80 shadow-md rounded-2xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    6. Professional Summary
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl h-8 px-2 font-bold flex items-center gap-1 shrink-0"
                    onClick={() => handleOpenAiAssist('summary')}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> AI Assist
                  </Button>
                </CardTitle>
                <CardDescription className="text-xs">Write a brief overview of your professional background</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={professionalSummary}
                  onChange={e => setProfessionalSummary(e.target.value)}
                  placeholder="Experienced software engineer with 5+ years of scaling web apps and leading cloud migrations..."
                  className="rounded-2xl resize-none min-h-[140px] text-xs sm:text-sm p-4 bg-white/50 focus:bg-white"
                />
              </CardContent>
            </Card>
          )}

          {activeSection === 'experience' && (
            <Card className="border border-slate-200/60 dark:border-slate-800/80 shadow-md rounded-2xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-base font-extrabold">4. Experience</CardTitle>
                    <CardDescription className="text-xs">Add your professional work history</CardDescription>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={addJob} className="rounded-xl border-dashed h-8 text-xs font-bold">
                  <Plus className="w-4 h-4 mr-1" /> Add Job
                </Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {jobs.map((job, idx) => (
                  <div key={idx} className="p-4 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl relative space-y-3 bg-slate-50/20 dark:bg-slate-950/5">
                    {jobs.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeJob(idx)}
                        className="absolute right-2 top-2 h-7 w-7 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Company</label>
                        <Input value={job.company} onChange={e => updateJob(idx, "company", e.target.value)} placeholder="Google" className="rounded-xl h-9 text-xs bg-white/50" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Role</label>
                        <Input value={job.role} onChange={e => updateJob(idx, "role", e.target.value)} placeholder="Software Engineer" className="rounded-xl h-9 text-xs bg-white/50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Location</label>
                        <Input value={job.location} onChange={e => updateJob(idx, "location", e.target.value)} placeholder="New York, NY" className="rounded-xl h-9 text-xs bg-white/50" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Start Date</label>
                        <Input type="month" value={job.startDate} onChange={e => updateJob(idx, "startDate", e.target.value)} className="rounded-xl h-9 text-xs bg-white/50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 items-center pt-1">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`currently-work-${idx}`}
                          checked={job.currentlyWorkHere || false}
                          onChange={e => updateJob(idx, "currentlyWorkHere", e.target.checked)}
                          className="rounded border-slate-350 text-indigo-600 h-3.5 w-3.5 accent-indigo-600"
                        />
                        <label htmlFor={`currently-work-${idx}`} className="text-[11px] font-bold text-slate-500 cursor-pointer">
                          I work here now
                        </label>
                      </div>
                      {!job.currentlyWorkHere && (
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-0.5">End Date</label>
                          <Input type="month" value={job.endDate} onChange={e => updateJob(idx, "endDate", e.target.value)} className="rounded-xl h-9 text-xs bg-white/50" />
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-200/50 pt-3 mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key Accomplishments</label>
                        <Button
                          size="sm"
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            const updatedJobs = [...jobs];
                            updatedJobs[idx].points = [...(updatedJobs[idx].points || []), ""];
                            setJobs(updatedJobs);
                          }}
                          className="h-7 rounded-lg text-xs font-bold text-indigo-600 hover:bg-slate-100"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add Point
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(job.points || [""]).map((point, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2 relative group">
                            <span className="text-slate-400 font-black shrink-0 text-xs">•</span>
                            <Input
                              value={point}
                              onChange={e => {
                                const updatedJobs = [...jobs];
                                updatedJobs[idx].points[pIdx] = e.target.value;
                                setJobs(updatedJobs);
                              }}
                              placeholder="e.g. Reduced latency by 20% using Redis caching"
                              className="rounded-xl bg-white h-9 text-xs flex-1 pr-10"
                            />

                            <div className="absolute right-2 flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 rounded-md hover:bg-indigo-50 text-indigo-600"
                                title="AI Assist suggestions"
                                onClick={() => handleOpenAiAssist('experience', idx, pIdx)}
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </Button>
                              {(job.points || [""]).length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  type="button"
                                  onClick={() => {
                                    const updatedJobs = [...jobs];
                                    updatedJobs[idx].points = updatedJobs[idx].points.filter((_, i) => i !== pIdx);
                                    setJobs(updatedJobs);
                                  }}
                                  className="text-rose-500 hover:bg-rose-50 rounded-md h-6 w-6"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeSection === 'projects' && (
            <Card className="border border-slate-200/60 dark:border-slate-800/80 shadow-md rounded-2xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <div>
                    <CardTitle className="text-base font-extrabold">5. Key Projects</CardTitle>
                    <CardDescription className="text-xs">Add development or research projects</CardDescription>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={addProject} className="rounded-xl border-dashed h-8 text-xs font-bold">
                  <Plus className="w-4 h-4 mr-1" /> Add Project
                </Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-4 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl relative space-y-3 bg-slate-50/20 dark:bg-slate-950/5">
                    {projects.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProject(idx)}
                        className="absolute right-2 top-2 h-7 w-7 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Project Name</label>
                        <Input value={proj.name} onChange={e => updateProject(idx, "name", e.target.value)} placeholder="E-Commerce API Service" className="rounded-xl h-9 text-xs bg-white/50" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Tech Stack</label>
                        <Input value={proj.techStack} onChange={e => updateProject(idx, "techStack", e.target.value)} placeholder="React, Node.js, AWS" className="rounded-xl h-9 text-xs bg-white/50" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Project Link (Optional)</label>
                        <Input value={proj.projectLink || ""} onChange={e => updateProject(idx, "projectLink", e.target.value)} placeholder="github.com/user/repo" className="rounded-xl h-9 text-xs bg-white/50" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Accomplishments</label>
                        <Button
                          size="sm"
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            const updatedProjects = [...projects];
                            updatedProjects[idx].points = [...(updatedProjects[idx].points || []), ""];
                            setProjects(updatedProjects);
                          }}
                          className="h-7 rounded-lg text-xs font-bold text-indigo-600 hover:bg-slate-100"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add Point
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(proj.points || [""]).map((point, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2 relative group">
                            <span className="text-slate-400 font-black shrink-0 text-xs">•</span>
                            <Input
                              value={point}
                              onChange={e => {
                                const updatedProjects = [...projects];
                                updatedProjects[idx].points[pIdx] = e.target.value;
                                setProjects(updatedProjects);
                              }}
                              placeholder="e.g. Architected custom caching model to support 10k users"
                              className="rounded-xl bg-white h-9 text-xs flex-1 pr-10"
                            />

                            <div className="absolute right-2 flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              {(proj.points || [""]).length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  type="button"
                                  onClick={() => {
                                    const updatedProjects = [...projects];
                                    updatedProjects[idx].points = updatedProjects[idx].points.filter((_, i) => i !== pIdx);
                                    setProjects(updatedProjects);
                                  }}
                                  className="text-rose-500 hover:bg-rose-50 rounded-md h-6 w-6"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeSection === 'skills' && (
            <Card className="border border-slate-200/60 dark:border-slate-800/80 shadow-md rounded-2xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-amber-500" />
                  <div>
                    <CardTitle className="text-base font-extrabold">2. Skills & Languages</CardTitle>
                    <CardDescription className="text-xs">Organize skills into logical groups (e.g. Languages, Frameworks) for higher ATS scoring</CardDescription>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={addSkillCategory} className="rounded-xl border-dashed h-8 text-xs font-bold">
                  <Plus className="w-4 h-4 mr-1" /> Add Category
                </Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {skills.map((cat, catIdx) => (
                  <div key={catIdx} className="p-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <Input
                        value={cat.category}
                        onChange={e => updateCategoryName(catIdx, e.target.value)}
                        placeholder="Category (e.g., Languages, Frameworks)"
                        className="rounded-xl h-9 text-xs font-bold bg-white w-[60%] shrink-0 border-indigo-100"
                      />
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => addSkillToCategory(catIdx)} className="h-8 text-[10px] font-extrabold text-indigo-600 hover:bg-white rounded-xl">
                          <Plus className="w-3.5 h-3.5 mr-0.5" /> Add Skill
                        </Button>
                        {skills.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSkillCategory(catIdx)}
                            className="text-rose-500 hover:bg-rose-50 hover:dark:bg-rose-950/20 rounded-xl h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {cat.skills.map((skill, skillIdx) => (
                        <div key={skillIdx} className="flex items-center gap-2 relative group">
                          <Input
                            value={skill}
                            onChange={e => updateSkillInCategory(catIdx, skillIdx, e.target.value)}
                            placeholder="e.g. React"
                            className="rounded-xl h-9 text-xs bg-white/70"
                          />
                          {cat.skills.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSkillFromCategory(catIdx, skillIdx)}
                              className="absolute right-1 text-rose-500 hover:bg-rose-50 rounded-lg h-7 w-7 opacity-60 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="border-t border-slate-200/50 pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Languages Spoken</label>
                    <Button size="sm" variant="ghost" onClick={addLanguage} className="h-7 text-xs font-bold text-indigo-600 hover:bg-slate-100">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Language
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {languages.map((lang, idx) => (
                      <div key={idx} className="flex items-center gap-2 relative group">
                        <Input
                          value={lang}
                          onChange={e => updateLanguage(idx, e.target.value)}
                          placeholder="e.g. English (Fluent)"
                          className="rounded-xl h-9 text-xs bg-white/50"
                        />
                        {languages.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLanguage(idx)}
                            className="absolute right-1 text-rose-500 hover:bg-rose-50 rounded-lg h-7 w-7 opacity-60 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'education' && (
            <Card className="border border-slate-200/60 dark:border-slate-800/80 shadow-md rounded-2xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-500" />
                  <div>
                    <CardTitle className="text-base font-extrabold">3. Education & Awards</CardTitle>
                    <CardDescription className="text-xs">Add university and optional accomplishments</CardDescription>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={addEducation} className="rounded-xl border-dashed h-8 text-xs font-bold">
                  <Plus className="w-4 h-4 mr-1" /> Add Edu
                </Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {education.map((edu, idx) => (
                  <div key={idx} className="p-4 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl relative space-y-3 bg-slate-50/20 dark:bg-slate-950/5">
                    {education.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEducation(idx)}
                        className="absolute right-2 top-2 h-7 w-7 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Institution</label>
                        <Input value={edu.institution} onChange={e => updateEducation(idx, "institution", e.target.value)} placeholder="IIT Delhi" className="rounded-xl h-9 text-xs bg-white/50" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Graduation Date</label>
                        <Input type="month" value={edu.year} onChange={e => updateEducation(idx, "year", e.target.value)} className="rounded-xl h-9 text-xs bg-white/50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Degree</label>
                        <Input value={edu.degree} onChange={e => updateEducation(idx, "degree", e.target.value)} placeholder="B.Tech" className="rounded-xl h-9 text-xs bg-white/50" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Field of Study</label>
                        <Input value={edu.fieldOfStudy} onChange={e => updateEducation(idx, "fieldOfStudy", e.target.value)} placeholder="Computer Science" className="rounded-xl h-9 text-xs bg-white/50" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Grade (Optional)</label>
                        <Input value={edu.grade || ""} onChange={e => updateEducation(idx, "grade", e.target.value)} placeholder="9.2 CGPA or 92%" className="rounded-xl h-9 text-xs bg-white/50" />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t border-slate-200/50 pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Award className="w-4 h-4 text-pink-500" />
                      Achievements & Certifications
                    </label>
                    <Button size="sm" variant="ghost" onClick={addAchievement} className="h-7 text-xs font-bold text-indigo-600 hover:bg-slate-100">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Award
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {achievements.map((achievement, idx) => (
                      <div key={idx} className="flex items-center gap-2 relative group">
                        <Input
                          value={achievement}
                          onChange={e => updateAchievement(idx, e.target.value)}
                          placeholder="e.g. Winner of internal Hackathon"
                          className="rounded-xl h-9 text-xs bg-white/50"
                        />
                        {achievements.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAchievement(idx)}
                            className="absolute right-1 text-rose-500 hover:bg-rose-50 rounded-lg h-7 w-7 opacity-60 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {user && (
            <div className="flex items-center justify-between text-[11px] border rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-950/20 border-slate-200/40 dark:border-slate-850 shadow-sm">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                <Coins className="w-4 h-4 text-indigo-500 shrink-0" />
                {!user.metadata?.has_used_resume_builder ? (
                  <span>First generation is <strong className="text-indigo-600 dark:text-indigo-400 font-bold">FREE</strong>!</span>
                ) : (
                  <span>Cost: <strong className="font-bold text-slate-700 dark:text-slate-350">1 Credit</strong></span>
                )}
              </div>
              <span className={`font-bold py-0.5 px-2.5 rounded-full border shadow-sm ${(user.totalCredits || 0) > 0
                  ? 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900/30 dark:text-indigo-400'
                  : 'bg-rose-50 border-rose-100 text-rose-500 dark:bg-rose-950/40 dark:border-rose-900/30 dark:text-rose-400'
                }`}>
                Credits: {user.totalCredits || 0}
              </span>
            </div>
          )}

          {user && user.metadata?.has_used_resume_builder && (user.totalCredits || 0) < 1 && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 dark:bg-rose-950/10 dark:border-rose-900/30 dark:text-rose-400 text-xs flex flex-col gap-1.5 shadow-sm">
              <p className="font-semibold">You need 1 credit to generate your resume with Grok.</p>
              <Link href="/jobseeker/credits" className="text-indigo-600 dark:text-indigo-400 font-bold underline hover:text-indigo-700">
                Buy Credits Now →
              </Link>
            </div>
          )}

          <Button
            className="w-full py-6 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform"
            onClick={handleGenerate}
            disabled={isGenerating || (user && user.metadata?.has_used_resume_builder && (user.totalCredits || 0) < 1)}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Grok is Writing Your Resume...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
                Generate ATS Resume with AI
                <ChevronRight className="w-5 h-5 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Live Resume Preview - Right Column */}
        <div className={`lg:col-span-7 space-y-4 ${activeTab === "preview" ? "block" : "hidden lg:block"}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between print:hidden">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                ATS Layout Preview
              </h2>
              {(name || email) && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs font-bold shadow-sm" onClick={handleCopyMarkdown}>
                    {copiedText ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500 animate-in zoom-in" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    Copy MD
                  </Button>

                  <Button
                    size="sm"
                    className="rounded-xl h-8 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1 shadow-sm"
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                  >
                    {isDownloadingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    Save PDF
                  </Button>
                </div>
              )}
            </div>
            {/* Helper style definitions based on visualTemplate */}
            {(() => {
              const isSerif = visualTemplate === 'classic-serif'
              const isNavy = visualTemplate === 'executive-navy'
              const isCompact = visualTemplate === 'compact-tech'
              const isMinimal = visualTemplate === 'modern-minimal'

              const previewFontClass = isSerif ? "font-serif" : "font-sans"
              const previewTextColor = isMinimal ? "text-slate-700 dark:text-slate-300" : "text-slate-950 dark:text-slate-100"
              const previewPadding = isCompact ? "p-5 sm:p-8" : "p-6 sm:p-10 lg:p-12"
              const previewTextSize = isCompact ? "text-[11px]" : "text-xs"
              const previewHeadlineSize = isCompact ? "text-[10px]" : "text-[11px]"
              const previewTitleSize = isCompact ? "text-2xl" : "text-3xl"
              const previewSectionMargin = isCompact ? "mb-4" : "mb-5"
              const previewSectionHeaderMargin = isCompact ? "mb-1.5" : "mb-2"
              const previewSectionDividerColor = isNavy ? "border-blue-900 dark:border-blue-800 border-b-2" : isMinimal ? "border-slate-200 dark:border-slate-800" : "border-slate-900 dark:border-slate-100"

              return (
                <div
                  id="printable-resume-area"
                  className={`min-h-[800px] w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-3xl ${previewPadding} shadow-xl shadow-slate-100 dark:shadow-none ${previewFontClass} ${previewTextColor} select-text overflow-hidden transition-all duration-350`}
                >
                  <div className="text-left max-w-full animate-in fade-in duration-500">
                    {/* Header */}
                    <div className={`flex flex-col ${(isMinimal || isCompact) ? "text-left mb-4" : "text-center mb-5"} ${isNavy ? "border-blue-900 dark:border-blue-800" : isMinimal ? "border-slate-200 dark:border-slate-800" : "border-slate-900 dark:border-slate-100"}`}>
                      <h1 className={`${previewTitleSize} font-black ${isNavy ? "text-blue-900 dark:text-blue-400" : isMinimal ? "text-slate-800 dark:text-white" : "text-slate-950 dark:text-white"} tracking-tight mb-1`}>{name || "Your Name"}</h1>
                      {role && (
                        <p className={`${previewHeadlineSize} font-bold ${isNavy ? "text-blue-900 dark:text-blue-400" : isMinimal ? "text-slate-600 dark:text-slate-450" : "text-slate-700 dark:text-slate-300"} uppercase tracking-wider mb-1.5`}>{role}</p>
                      )}
                      <div className={`text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium flex flex-wrap ${(isMinimal || isCompact) ? "justify-start" : "justify-center"} gap-x-3 gap-y-1`}>
                        {email && (
                          <a href={`mailto:${email.trim()}`} className="hover:underline">
                            {email}
                          </a>
                        )}
                        {phone && (
                          <>
                            {email && <span>•</span>}
                            <span>{phone}</span>
                          </>
                        )}
                        {location && (
                          <>
                            {(email || phone) && <span>•</span>}
                            <span>{location}</span>
                          </>
                        )}
                        {linkedinUrl && (
                          <>
                            {(email || phone || location) && <span>•</span>}
                            <a href={formatUrl(linkedinUrl)} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold">
                              LinkedIn
                            </a>
                          </>
                        )}
                        {githubUrl && (
                          <>
                            {(email || phone || location || linkedinUrl) && <span>•</span>}
                            <a href={formatUrl(githubUrl)} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold">
                              GitHub
                            </a>
                          </>
                        )}
                        {portfolioUrl && (
                          <>
                            {(email || phone || location || linkedinUrl || githubUrl) && <span>•</span>}
                            <a href={formatUrl(portfolioUrl)} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold">
                              Portfolio
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    {professionalSummary && (
                      <div className={previewSectionMargin}>
                        <h2 className={`${previewTextSize} font-black uppercase tracking-widest ${isNavy ? "text-blue-900 dark:text-blue-400" : isMinimal ? "text-slate-700 dark:text-slate-400" : "text-slate-905 dark:text-white"} border-b ${previewSectionDividerColor} pb-0.5 ${previewSectionHeaderMargin}`}>Professional Summary</h2>
                        <p className={`${previewTextSize} leading-relaxed ${previewTextColor}`}>{professionalSummary}</p>
                      </div>
                    )}

                    {/* Skills */}
                    {skills && skills.length > 0 && (
                      <div className={previewSectionMargin}>
                        <h2 className={`${previewTextSize} font-black uppercase tracking-widest ${isNavy ? "text-blue-900 dark:text-blue-400" : isMinimal ? "text-slate-700 dark:text-slate-400" : "text-slate-905 dark:text-white"} border-b ${previewSectionDividerColor} pb-0.5 ${previewSectionHeaderMargin}`}>Skills & Tech Stack</h2>
                        {typeof (skills as any)[0] === 'string' ? (
                          <p className={`${previewTextSize} leading-relaxed ${previewTextColor} font-medium`}>{(skills as any).filter(Boolean).join(",  ")}</p>
                        ) : (
                          <div className={`${previewTextSize} leading-relaxed ${previewTextColor} font-medium space-y-0.5`}>
                            {(skills as any).map((cat: any, idx: number) => {
                              const skillsList = Array.isArray(cat.skills) ? cat.skills.filter(Boolean) : [];
                              if (skillsList.length === 0) return null;
                              return (
                                <div key={idx}>
                                  <strong className={isNavy ? "text-blue-900 dark:text-blue-400" : isMinimal ? "text-slate-800 dark:text-slate-200" : "text-slate-950 dark:text-white"}>{cat.category}: </strong>
                                  <span>{skillsList.join(",  ")}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Experience */}
                    {jobs.filter(j => j.company || j.role).length > 0 && (
                      <div className={previewSectionMargin}>
                        <h2 className={`${previewTextSize} font-black uppercase tracking-widest ${isNavy ? "text-blue-900 dark:text-blue-400" : isMinimal ? "text-slate-700 dark:text-slate-400" : "text-slate-905 dark:text-white"} border-b ${previewSectionDividerColor} pb-0.5 ${previewSectionHeaderMargin}`}>Experience</h2>
                        <div className={isCompact ? "space-y-2.5" : "space-y-4"}>
                          {jobs.filter(j => j.company || j.role).map((job, idx) => (
                            <div key={idx}>
                              <div className={`flex justify-between ${previewTextSize} font-bold ${isNavy ? "text-blue-900 dark:text-blue-400" : isMinimal ? "text-slate-800 dark:text-white" : "text-slate-950 dark:text-white"} mb-0.5`}>
                                <span>{job.role || "Role"} — {job.company || "Company"}{job.location ? ` (${job.location})` : ""}</span>
                                <span className="font-semibold text-slate-500 dark:text-slate-400">{job.startDate || ""}{job.currentlyWorkHere ? " - Present" : job.endDate ? ` - ${job.endDate}` : ""}</span>
                              </div>
                              {job.points && job.points.filter(Boolean).length > 0 && (
                                <ul className="list-disc pl-4 space-y-0.5">
                                  {job.points.filter(Boolean).map((bullet, bIdx) => (
                                    <li key={bIdx} className={`${previewTextSize} leading-relaxed ${previewTextColor}`}>{bullet}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {projects.filter(p => p.name).length > 0 && (
                      <div className={previewSectionMargin}>
                        <h2 className={`${previewTextSize} font-black uppercase tracking-widest ${isNavy ? "text-blue-900 dark:text-blue-400" : isMinimal ? "text-slate-700 dark:text-slate-400" : "text-slate-905 dark:text-white"} border-b ${previewSectionDividerColor} pb-0.5 ${previewSectionHeaderMargin}`}>Projects</h2>
                        <div className={isCompact ? "space-y-2.5" : "space-y-4"}>
                          {projects.filter(p => p.name).map((proj, idx) => (
                            <div key={idx}>
                              <div className={`flex justify-between ${previewTextSize} font-bold ${isNavy ? "text-blue-900 dark:text-blue-400" : isMinimal ? "text-slate-800 dark:text-white" : "text-slate-950 dark:text-white"} mb-0.5`}>
                                <span>
                                  {proj.name}
                                  {proj.projectLink && (
                                    <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 ml-1.5">
                                      
                                      <a href={formatUrl(proj.projectLink)} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                        LINK
                                      </a>
                                      
                                    </span>
                                  )}
                                </span>
                                <span className="font-semibold text-slate-500 dark:text-slate-400">Tech: {proj.techStack}</span>
                              </div>
                              {proj.points && proj.points.filter(Boolean).length > 0 && (
                                <ul className="list-disc pl-4 space-y-0.5">
                                  {proj.points.filter(Boolean).map((bullet, bIdx) => (
                                    <li key={bIdx} className={`${previewTextSize} leading-relaxed ${previewTextColor}`}>{bullet}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {education.filter(e => e.institution || e.degree).length > 0 && (
                      <div className={previewSectionMargin}>
                        <h2 className={`${previewTextSize} font-black uppercase tracking-widest ${isNavy ? "text-blue-900 dark:text-blue-400" : isMinimal ? "text-slate-700 dark:text-slate-400" : "text-slate-905 dark:text-white"} border-b ${previewSectionDividerColor} pb-0.5 ${previewSectionHeaderMargin}`}>Education</h2>
                        <div className={isCompact ? "space-y-2" : "space-y-3.5"}>
                          {education.filter(e => e.institution || e.degree).map((edu, idx) => (
                            <div key={idx}>
                              <div className={`flex justify-between ${previewTextSize} font-bold ${isNavy ? "text-blue-900 dark:text-blue-400" : isMinimal ? "text-slate-800 dark:text-white" : "text-slate-950 dark:text-white"}`}>
                                <span>{edu.degree || "Degree"}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""} — {edu.institution || "Institution"}</span>
                                <span className="font-semibold text-slate-500 dark:text-slate-400">{edu.year}</span>
                              </div>
                              {edu.grade && (
                                <p className={`text-[10px] sm:text-[11px] ${previewTextColor} font-medium mt-0.5`}>GPA/Grade: {edu.grade}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Achievements */}
                    {achievements.filter(Boolean).length > 0 && (
                      <div className={previewSectionMargin}>
                        <h2 className={`${previewTextSize} font-black uppercase tracking-widest ${isNavy ? "text-blue-900 dark:text-blue-400" : isMinimal ? "text-slate-700 dark:text-slate-400" : "text-slate-905 dark:text-white"} border-b ${previewSectionDividerColor} pb-0.5 ${previewSectionHeaderMargin}`}>Achievements</h2>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {achievements.filter(Boolean).map((achievement, aIdx) => (
                            <li key={aIdx} className={`${previewTextSize} leading-relaxed ${previewTextColor}`}>{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Languages */}
                    {languages.filter(Boolean).length > 0 && (
                      <div className={previewSectionMargin}>
                        <h2 className={`${previewTextSize} font-black uppercase tracking-widest ${isNavy ? "text-blue-900 dark:text-blue-400" : isMinimal ? "text-slate-700 dark:text-slate-400" : "text-slate-905 dark:text-white"} border-b ${previewSectionDividerColor} pb-0.5 ${previewSectionHeaderMargin}`}>Languages</h2>
                        <p className={`${previewTextSize} leading-relaxed ${previewTextColor} font-medium`}>{languages.filter(Boolean).join(", ")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Credit Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="rounded-2xl border-slate-100 dark:border-slate-800 max-w-md print:hidden bg-white dark:bg-slate-900 shadow-2xl">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 mb-2 animate-pulse">
              <Coins className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold">Confirm Credit Charge</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
              Generating your resume costs <strong className="text-slate-900 dark:text-slate-100 font-bold">1 credit</strong>. Your current credit balance is <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{user?.totalCredits || 0} credits</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center sm:space-x-3 mt-4">
            <AlertDialogCancel className="rounded-xl border-slate-200" onClick={() => setShowConfirmDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-[#2e5bff] hover:bg-blue-700 text-white font-bold"
              onClick={async () => {
                setShowConfirmDialog(false)
                await executeGenerate()
              }}
            >
              Confirm & Generate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Inline AI Assist dialog */}
      <AlertDialog open={showAiAssist} onOpenChange={setShowAiAssist}>
        <AlertDialogContent className="rounded-2xl border-slate-150 dark:border-slate-800 max-w-lg print:hidden bg-white dark:bg-slate-900 shadow-2xl backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-extrabold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-500 animate-pulse" />
              Grok Inline AI Assistant
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-400">
              Suggested alternatives and action verbs tailored for your {aiAssistSection === 'experience' ? 'accomplishment' : 'summary'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-3">
            {isAiAssisting ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <span className="text-xs font-semibold">Generating recommendations...</span>
              </div>
            ) : (
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {/* List of Suggestions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Suggestions</h4>
                  {aiSuggestions.map((suggestion, i) => (
                    <div
                      key={i}
                      className="p-3 border border-slate-200/60 hover:border-indigo-400 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 rounded-xl cursor-pointer hover:bg-indigo-50/10 transition-all text-xs leading-relaxed text-slate-700 dark:text-slate-350"
                      onClick={() => handleApplyAiSuggestion(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>

                {/* List of Action Verbs */}
                {aiVerbs && aiVerbs.length > 0 && (
                  <div className="space-y-2 border-t pt-3.5 border-slate-150/60 dark:border-slate-850">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {aiAssistSection === 'experience' ? 'Action Verbs' : 'Adjectives'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {aiVerbs.map((verb, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold rounded-lg cursor-pointer px-2.5 py-1 text-xs"
                          onClick={() => {
                            // Copy verb to clipboard or append
                            navigator.clipboard.writeText(verb)
                            toast({ title: "Copied! 📋", description: `"${verb}" saved to clipboard.` })
                          }}
                        >
                          {verb}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-slate-200 text-xs font-bold w-full sm:w-auto" onClick={() => setShowAiAssist(false)}>
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
