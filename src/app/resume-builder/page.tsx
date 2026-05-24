"use client"

import { useState } from "react"
import { useUser } from "@/contexts/user-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, Sparkles, Plus, Trash2, Printer, Copy, Check, Briefcase, 
  Code, GraduationCap, User, FileText, ChevronRight, Settings, Coins,
  Award, Download
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
  description: string;
  currentlyWorkHere?: boolean;
}

interface ProjectInput {
  name: string;
  techStack: string;
  description: string;
}

interface EducationInput {
  institution: string;
  degree: string;
  year: string;
  grade?: string;
}


interface ResumeData {
  name: string;
  contact: {
    email: string;
    phone: string;
    linkedin: string;
    github: string;
  };
  summary: string;
  skills: string[];
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
    dates: string;
    grade?: string;
  }[];
}

export default function ResumeBuilderPage() {
  const { user, refreshUser } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  
  // Form States
  const [templateType, setTemplateType] = useState("Software Engineer")
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || "")
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || "")
  const [skillsText, setSkillsText] = useState(user?.skills?.map(s => s.name).join(", ") || "")
  const [professionalSummary, setProfessionalSummary] = useState("")
  const [languages, setLanguages] = useState<string[]>([""])
  const [achievements, setAchievements] = useState<string[]>([""])
  
  const [jobs, setJobs] = useState<JobInput[]>([
    { company: "", role: "", startDate: "", endDate: "", location: "", description: "", currentlyWorkHere: false }
  ])
  const [projects, setProjects] = useState<ProjectInput[]>([
    { name: "", techStack: "", description: "" }
  ])
  const [education, setEducation] = useState<EducationInput[]>([
    { institution: "", degree: "", year: "", grade: "" }
  ])

  // Result State
  const [generatedResume, setGeneratedResume] = useState<ResumeData | null>(null)

  // Dynamic Array Modifiers
  const addJob = () => setJobs([...jobs, { company: "", role: "", startDate: "", endDate: "", location: "", description: "", currentlyWorkHere: false }])
  const removeJob = (index: number) => setJobs(jobs.filter((_, i) => i !== index))
  const updateJob = (index: number, field: keyof JobInput, val: any) => {
    const updated = [...jobs]
    ;(updated[index] as any)[field] = val
    setJobs(updated)
  }

  const addProject = () => setProjects([...projects, { name: "", techStack: "", description: "" }])
  const removeProject = (index: number) => setProjects(projects.filter((_, i) => i !== index))
  const updateProject = (index: number, field: keyof ProjectInput, val: string) => {
    const updated = [...projects]
    updated[index][field] = val
    setProjects(updated)
  }

  const addEducation = () => setEducation([...education, { institution: "", degree: "", year: "", grade: "" }])
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

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const executeGenerate = async () => {
    setIsGenerating(true)
    try {
      const skillsArray = skillsText.split(",").map(s => s.trim()).filter(Boolean)
      const experienceList = jobs.filter(j => j.company && j.role).map(j => ({
        company: j.company,
        role: j.role,
        startDate: j.startDate,
        endDate: j.currentlyWorkHere ? "Present" : j.endDate,
        location: j.location,
        description: j.description
      }))
      const projectsList = projects.filter(p => p.name).map(p => ({
        name: p.name,
        techStack: p.techStack,
        description: p.description
      }))
      const educationList = education.filter(e => e.institution).map(e => ({
        institution: e.institution,
        degree: e.degree,
        year: e.year,
        grade: e.grade
      }))

      const languagesArray = languages.map(l => l.trim()).filter(Boolean)
      const achievementsArray = achievements.map(a => a.trim()).filter(Boolean)
      const response = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactInfo: { name, email, phone, linkedinUrl, githubUrl },
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
    const totalCredits = (user.subscriptionCredits || 0) + (user.purchasedCredits || 0)

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
    const element = document.getElementById("printable-resume-area")
    if (!element) return

    setIsDownloadingPdf(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const { jsPDF } = await import("jspdf")

      // Clone the element to render in a standard desktop viewport aspect ratio
      const clone = element.cloneNode(true) as HTMLElement
      clone.id = "printable-resume-clone"
      
      // Reset classes & override styling for A4 proportioning without margins/borders
      clone.className = "bg-white font-sans text-slate-900"
      clone.style.width = "794px" // A4 width at 96 DPI
      clone.style.minHeight = "1123px" // A4 height at 96 DPI
      clone.style.padding = "48px"
      clone.style.boxSizing = "border-box"
      clone.style.border = "none"
      clone.style.boxShadow = "none"
      clone.style.borderRadius = "0"
      
      // Position off-screen
      clone.style.position = "fixed"
      clone.style.left = "-9999px"
      clone.style.top = "0"
      
      document.body.appendChild(clone)

      // Allow a brief moment for styles/layout computation
      await new Promise(resolve => setTimeout(resolve, 50))

      const canvas = await html2canvas(clone, {
        scale: 2, // High resolution output
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      })

      // Clean up the DOM clone
      document.body.removeChild(clone)

      const imgData = canvas.toDataURL("image/jpeg", 0.8)
      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST")
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST")
        heightLeft -= pageHeight
      }

      const filename = `${generatedResume?.name.replace(/\s+/g, "_") || "resume"}_ATS_Optimized.pdf`
      pdf.save(filename)
      toast({ title: "PDF Saved! 📄", description: "Your ATS-optimized PDF has been downloaded directly." })
    } catch (err: any) {
      console.error(err)
      toast({ title: "Download Failed", description: err.message || "An error occurred while generating PDF.", variant: "destructive" })
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  const getMarkdownFormat = () => {
    if (!generatedResume) return ""
    return `# ${generatedResume.name}
${generatedResume.contact.email} | ${generatedResume.contact.phone} | LinkedIn: ${generatedResume.contact.linkedin} | GitHub: ${generatedResume.contact.github}

## Professional Summary
${generatedResume.summary}

${generatedResume.achievements && generatedResume.achievements.length > 0 ? `## Key Achievements\n${generatedResume.achievements.map(a => `* ${a}`).join("\n")}\n\n` : ""}## Skills
${generatedResume.skills.join(", ")}

${generatedResume.languages && generatedResume.languages.length > 0 ? `## Languages\n${generatedResume.languages.join(", ")}\n\n` : ""}## Work Experience
${generatedResume.experience.map(exp => `### ${exp.role} - ${exp.company}${exp.location ? ` (${exp.location})` : ""}
*${exp.dates}*
${exp.bullets.map(b => `* ${b}`).join("\n")}
`).join("\n")}

## Projects
${generatedResume.projects.map(proj => `### ${proj.name}
*Technologies: ${proj.techStack}*
${proj.bullets.map(b => `* ${b}`).join("\n")}
`).join("\n")}

## Education
${generatedResume.education.map(edu => `### ${edu.institution}
*${edu.degree} (${edu.dates})*${edu.grade ? `\n*Grade: ${edu.grade}*` : ""}
`).join("\n")}
`
  }

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(getMarkdownFormat())
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2000)
    toast({ title: "Copied!", description: "Markdown copy saved to clipboard." })
  }

  return (
    <div className="container max-w-7xl py-12 px-4 md:px-8">
      {/* CSS print override to print only the resume card when user prints the page */}
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

      <div className="mb-10 text-center space-y-4 print:hidden">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
          AI Resume Builder
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Input your details and choose a template style. Our Grok AI will craft compelling, quantified accomplishments and structure them in an ATS-safe layout.
        </p>
      </div>
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl mb-6 shadow-sm max-w-md mx-auto print:hidden">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === "edit"
              ? "bg-[#2e5bff] text-white shadow-md shadow-blue-500/10"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          Edit Details
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === "preview"
              ? "bg-[#2e5bff] text-white shadow-md shadow-blue-500/10"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Preview
          {generatedResume && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Form Inputs Section */}
        <div className={`lg:col-span-6 space-y-6 print:hidden ${activeTab === "edit" ? "block" : "hidden lg:block"}`}>
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
              <Settings className="w-5 h-5 text-indigo-500" />
              <div>
                <CardTitle className="text-lg">Template & Layout Config</CardTitle>
                <CardDescription>Select target role type and standards</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <label className="text-xs font-bold text-slate-700 block mb-2">Target Profile / Layout Standard</label>
              <Select value={templateType} onValueChange={setTemplateType}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Select target role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Software Engineer">Software Engineer (Tech Focused)</SelectItem>
                  <SelectItem value="Product Manager">Product Manager (Impact & Data Focused)</SelectItem>
                  <SelectItem value="Fresher">Fresher (Projects & Academics Focused)</SelectItem>
                  <SelectItem value="Experienced">Experienced (Leadership & System Focused)</SelectItem>
                  <SelectItem value="US Format">US Standard format (No photos, clean grid)</SelectItem>
                  <SelectItem value="India Format">India Standard format (City headers, structured)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
              <User className="w-5 h-5 text-emerald-500" />
              <div>
                <CardTitle className="text-lg">Contact Information</CardTitle>
                <CardDescription>Basic contact details for the header</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Full Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Amit Kumar" className="rounded-xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Email</label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="amit@gmail.com" className="rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Phone</label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="9876543210" className="rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">LinkedIn URL</label>
                  <Input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="linkedin.com/in/amit" className="rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">GitHub URL</label>
                  <Input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="github.com/amit" className="rounded-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
              <Code className="w-5 h-5 text-amber-500" />
              <div>
                <CardTitle className="text-lg">Skills & Technologies</CardTitle>
                <CardDescription>Enter your core skills (comma-separated)</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Textarea 
                value={skillsText} 
                onChange={e => setSkillsText(e.target.value)} 
                placeholder="React, Node.js, TypeScript, AWS, Docker, Redis, Kubernetes, PostgreSQL" 
                className="rounded-xl resize-none min-h-[80px]" 
              />
            </CardContent>
          </Card>

          {/* Professional Summary */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
              <FileText className="w-5 h-5 text-indigo-500" />
              <div>
                <CardTitle className="text-lg">Professional Summary (Optional)</CardTitle>
                <CardDescription>Brief profile overview or career objective</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Textarea 
                value={professionalSummary} 
                onChange={e => setProfessionalSummary(e.target.value)} 
                placeholder="Experienced software engineer with 5+ years of scaling web apps and leading cloud migrations..." 
                className="rounded-xl resize-none min-h-[100px]" 
              />
            </CardContent>
          </Card>

          {/* Languages */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b py-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <div>
                  <CardTitle className="text-lg">Languages (Optional)</CardTitle>
                  <CardDescription>Languages you speak (e.g. English, Hindi, German)</CardDescription>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={addLanguage} className="rounded-xl border-dashed">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {languages.map((lang, idx) => (
                <div key={idx} className="flex items-center gap-3 relative">
                  <div className="flex-1">
                    <Input 
                      value={lang} 
                      onChange={e => updateLanguage(idx, e.target.value)} 
                      placeholder="e.g. English" 
                      className="rounded-xl bg-white" 
                    />
                  </div>
                  {languages.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeLanguage(idx)} 
                      className="text-rose-500 hover:bg-rose-50 rounded-xl h-9 w-9"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Key Achievements */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b py-4">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-pink-500" />
                <div>
                  <CardTitle className="text-lg">Key Achievements (Optional)</CardTitle>
                  <CardDescription>Major awards, honors, or career achievements</CardDescription>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={addAchievement} className="rounded-xl border-dashed">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {achievements.map((achievement, idx) => (
                <div key={idx} className="flex items-center gap-3 relative">
                  <div className="flex-1">
                    <Input 
                      value={achievement} 
                      onChange={e => updateAchievement(idx, e.target.value)} 
                      placeholder="e.g. Winner of internal Hackathon out of 100+ participants" 
                      className="rounded-xl bg-white" 
                    />
                  </div>
                  {achievements.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeAchievement(idx)} 
                      className="text-rose-500 hover:bg-rose-50 rounded-xl h-9 w-9"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b py-4">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-blue-500" />
                <div>
                  <CardTitle className="text-lg">Work History</CardTitle>
                  <CardDescription>Add prior companies and descriptions</CardDescription>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={addJob} className="rounded-xl border-dashed">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {jobs.map((job, idx) => (
                <div key={idx} className="p-4 border rounded-2xl relative space-y-3 bg-slate-50/30">
                  {jobs.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeJob(idx)} 
                      className="absolute right-2 top-2 h-7 w-7 text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Company</label>
                      <Input value={job.company} onChange={e => updateJob(idx, "company", e.target.value)} placeholder="Google" className="rounded-xl bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Role</label>
                      <Input value={job.role} onChange={e => updateJob(idx, "role", e.target.value)} placeholder="Software Engineer" className="rounded-xl bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Location</label>
                      <Input value={job.location} onChange={e => updateJob(idx, "location", e.target.value)} placeholder="New York, NY" className="rounded-xl bg-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Start Month & Year</label>
                      <Input 
                        type="month" 
                        value={job.startDate} 
                        onChange={e => updateJob(idx, "startDate", e.target.value)} 
                        className="rounded-xl bg-white" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">End Month & Year</label>
                      <Input 
                        type="month" 
                        value={job.currentlyWorkHere ? "" : job.endDate} 
                        onChange={e => updateJob(idx, "endDate", e.target.value)} 
                        disabled={job.currentlyWorkHere}
                        className="rounded-xl bg-white disabled:opacity-50 disabled:bg-slate-100" 
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 py-1">
                    <input 
                      type="checkbox"
                      id={`currently-work-${idx}`}
                      checked={job.currentlyWorkHere || false}
                      onChange={e => updateJob(idx, "currentlyWorkHere", e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer accent-indigo-600"
                    />
                    <label htmlFor={`currently-work-${idx}`} className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                      I currently work here (Present)
                    </label>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">What did you do? (Simple list or summary)</label>
                    <Textarea 
                      value={job.description} 
                      onChange={e => updateJob(idx, "description", e.target.value)} 
                      placeholder="Responsible for migrations. Rewrote backend logic. Reduced API latency." 
                      className="rounded-xl bg-white resize-none min-h-[90px]" 
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Projects */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b py-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-500" />
                <div>
                  <CardTitle className="text-lg">Key Projects</CardTitle>
                  <CardDescription>Highlight engineering/product projects</CardDescription>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={addProject} className="rounded-xl border-dashed">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {projects.map((proj, idx) => (
                <div key={idx} className="p-4 border rounded-2xl relative space-y-3 bg-slate-50/30">
                  {projects.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeProject(idx)} 
                      className="absolute right-2 top-2 h-7 w-7 text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Project Name</label>
                      <Input value={proj.name} onChange={e => updateProject(idx, "name", e.target.value)} placeholder="E-Commerce API Service" className="rounded-xl bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Tech Stack</label>
                      <Input value={proj.techStack} onChange={e => updateProject(idx, "techStack", e.target.value)} placeholder="Node.js, PostgreSQL, Docker" className="rounded-xl bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Project Details / Outcome</label>
                    <Textarea 
                      value={proj.description} 
                      onChange={e => updateProject(idx, "description", e.target.value)} 
                      placeholder="Created a custom queuing model to handle transactional peaks. Sped up response times." 
                      className="rounded-xl bg-white resize-none min-h-[80px]" 
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b py-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-purple-500" />
                <div>
                  <CardTitle className="text-lg">Education History</CardTitle>
                  <CardDescription>Academic schools and graduation dates</CardDescription>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={addEducation} className="rounded-xl border-dashed">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {education.map((edu, idx) => (
                <div key={idx} className="p-4 border rounded-2xl relative space-y-3 bg-slate-50/30">
                  {education.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeEducation(idx)} 
                      className="absolute right-2 top-2 h-7 w-7 text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Institution</label>
                      <Input value={edu.institution} onChange={e => updateEducation(idx, "institution", e.target.value)} placeholder="IIT Delhi" className="rounded-xl bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Graduation Month & Year</label>
                      <Input 
                        type="month" 
                        value={edu.year} 
                        onChange={e => updateEducation(idx, "year", e.target.value)} 
                        className="rounded-xl bg-white" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Degree & Major</label>
                      <Input value={edu.degree} onChange={e => updateEducation(idx, "degree", e.target.value)} placeholder="B.Tech in Computer Science" className="rounded-xl bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Grade / CGPA (Optional)</label>
                      <Input value={edu.grade || ""} onChange={e => updateEducation(idx, "grade", e.target.value)} placeholder="9.2 CGPA or 92%" className="rounded-xl bg-white" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {user && (
            <div className="flex items-center justify-between text-xs border rounded-2xl p-3 bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                <Coins className="w-4 h-4 text-indigo-500" />
                {!user.metadata?.has_used_resume_builder ? (
                  <span>Your first resume generation is completely <strong className="text-indigo-600 dark:text-indigo-400 font-bold">FREE</strong>!</span>
                ) : (
                  <span>Each generation costs <strong className="font-semibold text-slate-800 dark:text-slate-200">1 Credit</strong>.</span>
                )}
              </div>
              <div className="text-right">
                <span className={`font-bold ${(user.credits || 0) > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`}>
                  Balance: {user.credits || 0} Credits
                </span>
              </div>
            </div>
          )}

          {user && user.metadata?.has_used_resume_builder && (user.credits || 0) < 1 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 text-xs flex flex-col gap-2 shadow-sm">
              <p className="font-medium">You need at least 1 credit to generate your resume with AI.</p>
              <Link href="/jobseeker/credits" className="text-indigo-600 dark:text-indigo-400 font-bold underline hover:text-indigo-700">
                Get Credits Now →
              </Link>
            </div>
          )}

          <Button 
            className="w-full py-6 text-base font-bold bg-[#2e5bff] hover:bg-blue-700 text-white rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform" 
            onClick={handleGenerate}
            disabled={isGenerating || (user && user.metadata?.has_used_resume_builder && (user.credits || 0) < 1)}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Grok is Writing Your Resume...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
                Generate ATS Resume with AI
                <ChevronRight className="w-5 h-5 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Live Resume Preview Section */}
        <div className={`lg:col-span-6 space-y-4 ${activeTab === "preview" ? "block" : "hidden lg:block"}`}>
          <div className="flex items-center justify-between print:hidden">
            <h2 className="text-xl font-extrabold text-slate-800">ATS Resume Preview</h2>
            {generatedResume && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="rounded-xl" onClick={handleCopyMarkdown}>
                  {copiedText ? <Check className="w-4 h-4 mr-1.5 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1.5" />}
                  Copy Markdown
                </Button>
                <Button 
                  size="sm" 
                  className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5" 
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                >
                  {isDownloadingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Save PDF
                </Button>
              </div>
            )}
          </div>

          <div 
            id="printable-resume-area"
            className="min-h-[840px] w-full bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 lg:p-12 shadow-xl shadow-slate-100 font-sans text-slate-900 select-text overflow-hidden transition-all duration-300"
          >
            {!generatedResume ? (
              <div className="flex flex-col items-center justify-center min-h-[750px] text-center text-muted-foreground space-y-4 border border-dashed rounded-2xl p-6 bg-slate-50/50">
                <FileText className="w-16 h-16 opacity-10 text-slate-900" />
                <div>
                  <h3 className="font-bold text-slate-700 text-base">No Resume Generated</h3>
                  <p className="text-sm max-w-xs mt-1 text-slate-500">
                    Fill in your experience details on the left, then click "Generate ATS Resume" to see your optimized structure here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-left max-w-full">
                {/* Header */}
                <div className="text-center space-y-1.5 border-b pb-4">
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{generatedResume.name}</h1>
                  <div className="text-xs text-slate-500 font-medium flex flex-wrap justify-center gap-x-3 gap-y-1">
                    <span>{generatedResume.contact.email}</span>
                    <span>•</span>
                    <span>{generatedResume.contact.phone}</span>
                    {generatedResume.contact.linkedin && (
                      <>
                        <span>•</span>
                        <span>LinkedIn: {generatedResume.contact.linkedin}</span>
                      </>
                    )}
                    {generatedResume.contact.github && (
                      <>
                        <span>•</span>
                        <span>GitHub: {generatedResume.contact.github}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="space-y-1.5">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">Professional Summary</h2>
                  <p className="text-xs leading-relaxed text-slate-700">{generatedResume.summary}</p>
                </div>

                {/* Key Achievements */}
                {generatedResume.achievements && generatedResume.achievements.length > 0 && (
                  <div className="space-y-1.5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">Key Achievements</h2>
                    <ul className="list-disc pl-4 space-y-1">
                      {generatedResume.achievements.map((achievement, aIdx) => (
                        <li key={aIdx} className="text-xs leading-relaxed text-slate-700">{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skills */}
                <div className="space-y-1.5">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">Skills & Expertise</h2>
                  <p className="text-xs leading-relaxed text-slate-700 font-medium">{generatedResume.skills.join(", ")}</p>
                </div>

                {/* Languages */}
                {generatedResume.languages && generatedResume.languages.length > 0 && (
                  <div className="space-y-1.5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">Languages</h2>
                    <p className="text-xs leading-relaxed text-slate-700 font-medium">{generatedResume.languages.join(", ")}</p>
                  </div>
                )}

                {/* Experience */}
                {generatedResume.experience && generatedResume.experience.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">Work History</h2>
                    <div className="space-y-3">
                      {generatedResume.experience.map((exp, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-900">
                            <span>{exp.role} — {exp.company}{exp.location ? ` (${exp.location})` : ""}</span>
                            <span className="font-semibold text-slate-500">{exp.dates}</span>
                          </div>
                          <ul className="list-disc pl-4 space-y-1">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-xs leading-relaxed text-slate-700">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {generatedResume.projects && generatedResume.projects.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">Projects</h2>
                    <div className="space-y-3">
                      {generatedResume.projects.map((proj, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-900">
                            <span>{proj.name}</span>
                            <span className="font-semibold text-slate-500">Tech: {proj.techStack}</span>
                          </div>
                          <ul className="list-disc pl-4 space-y-1">
                            {proj.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-xs leading-relaxed text-slate-700">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {generatedResume.education && generatedResume.education.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">Education</h2>
                    <div className="space-y-2">
                      {generatedResume.education.map((edu, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between text-xs font-bold text-slate-900">
                            <span>{edu.degree} — {edu.institution}</span>
                            <span className="font-semibold text-slate-500">{edu.dates}</span>
                          </div>
                          {edu.grade && (
                            <p className="text-[11px] text-slate-600 font-medium">Grade / GPA: {edu.grade}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="rounded-2xl border-slate-100 dark:border-slate-800 max-w-md print:hidden">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 mb-2">
              <Coins className="h-6 w-6 animate-pulse" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold">Confirm Credit Charge</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
              Generating your resume costs <strong className="text-slate-900 dark:text-slate-100 font-semibold">1 credit</strong>. Your current credit balance is <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{user?.credits || 0} credits</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center sm:space-x-3 mt-4">
            <AlertDialogCancel className="rounded-xl border-slate-200" onClick={() => setShowConfirmDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="rounded-xl bg-[#2e5bff] hover:bg-blue-700 text-white"
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
    </div>
  )
}
