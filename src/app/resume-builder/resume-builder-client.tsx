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
  Loader2, Sparkles, Plus, Trash2, Check, Briefcase,
  Code, GraduationCap, User, FileText, ChevronRight, ChevronLeft, ChevronDown,
  Award, Download, Layers, Palette, X, Camera, Upload, Image as ImageIcon, Coins,
  RotateCcw, Type, Sliders, Eye
} from "lucide-react"
import type { ResumeStyleConfig } from "@/components/resume/ResumePdfDocument"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  photoUrl?: string;
  contact: {
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    portfolio?: string;
    location?: string;
    photoUrl?: string;
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

const formatMonthYear = (dateStr?: string) => {
  if (!dateStr) return ""
  const trimmed = dateStr.trim()
  if (!trimmed) return ""
  if (trimmed.toLowerCase() === 'present') return 'Present'
  if (/^[A-Za-z]+\s+\d{4}$/.test(trimmed)) return trimmed
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})(?:[-/](\d{1,2}))?/)
  if (isoMatch) {
    const year = isoMatch[1]
    const monthIndex = parseInt(isoMatch[2], 10) - 1
    if (monthIndex >= 0 && monthIndex <= 11) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return `${monthNames[monthIndex]} ${year}`
    }
  }
  const slashMatch = trimmed.match(/^(\d{1,2})[-/](\d{4})$/)
  if (slashMatch) {
    const monthIndex = parseInt(slashMatch[1], 10) - 1
    const year = slashMatch[2]
    if (monthIndex >= 0 && monthIndex <= 11) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return `${monthNames[monthIndex]} ${year}`
    }
  }
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }
  return trimmed
}

const formatExperienceDateRange = (startDate?: string, endDate?: string, currentlyWorkHere?: boolean) => {
  const start = formatMonthYear(startDate)
  const end = currentlyWorkHere ? "Present" : formatMonthYear(endDate)
  if (start && end) return `${start} - ${end}`
  if (start) return currentlyWorkHere ? `${start} - Present` : start
  if (end) return end
  return ""
}

const normalizeMonthInput = (dateStr?: string) => {
  if (!dateStr) return ""
  const trimmed = dateStr.trim()
  if (!trimmed || trimmed.toLowerCase() === 'present') return ""
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})/)
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}`
  const slashMatch = trimmed.match(/^(\d{1,2})[-/](\d{4})$/)
  if (slashMatch) return `${slashMatch[2]}-${slashMatch[1].padStart(2, '0')}`
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear()
    const m = String(parsed.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }
  return trimmed
}

function renderRichText(text: string) {
  if (!text) return null
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="font-bold text-slate-950 dark:text-white">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  )
}

export const DUMMY_RESUME_DATA = {
  name: "Alex Morgan",
  role: "Senior Software Engineer",
  photoUrl: "",
  contact: {
    email: "alex.morgan@email.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
    linkedin: "https://linkedin.com/in/alexmorgan",
    github: "https://github.com/alexmorgan",
    portfolio: "https://alexmorgan.dev",
  },
  summary: "Accomplished Senior Software Engineer with 6+ years of experience designing and scaling fault-tolerant cloud services, high-throughput microservices, and modern web applications. Proven track record of reducing system latency by 45% and leading cross-functional teams to ship mission-critical software on schedule.",
  skills: [
    {
      category: "Languages",
      skills: ["TypeScript", "JavaScript", "Python", "Go", "SQL"]
    },
    {
      category: "Frameworks & Libraries",
      skills: ["React", "Next.js", "Node.js", "Express", "Tailwind CSS"]
    },
    {
      category: "Databases & Cloud",
      skills: ["PostgreSQL", "Redis", "MongoDB", "AWS", "Docker", "Kubernetes"]
    },
    {
      category: "Tools & Methodologies",
      skills: ["Git", "CI/CD Pipelines", "RESTful APIs", "GraphQL", "Microservices", "Agile/Scrum"]
    }
  ],
  experience: [
    {
      company: "Apex Solutions",
      role: "Senior Software Engineer",
      dates: "Jan 2022 – Present",
      location: "San Francisco, CA",
      bullets: [
        "Architected and deployed a real-time event streaming pipeline processing **15M+ daily events**, reducing ingestion latency by **45%**.",
        "Spearheaded migration of legacy monolith to Next.js and Go microservices, accelerating Core Web Vitals performance by **60%**.",
        "Mentored a team of 6 engineers, instituted comprehensive automated testing, and increased unit/integration test coverage from 64% to **92%**."
      ]
    },
    {
      company: "Vanguard Technologies",
      role: "Software Engineer",
      dates: "Jun 2019 – Dec 2021",
      location: "San Francisco, CA",
      bullets: [
        "Engineered scalable RESTful and GraphQL APIs serving **500K+ daily active users** with a 99.99% uptime SLA.",
        "Optimized complex PostgreSQL query execution plans and Redis caching, cutting average API response times from 320ms to **78ms**.",
        "Collaborated with product managers and UX designers to deliver 14 high-impact feature releases on schedule."
      ]
    }
  ],
  projects: [
    {
      name: "CloudMesh Distributed Router",
      techStack: "Go, Kafka, Redis, Docker",
      projectLink: "https://github.com/alexmorgan/cloudmesh",
      bullets: [
        "High-throughput asynchronous message bus supporting **50K concurrent WebSocket connections** across distributed cluster nodes.",
        "Implemented distributed consensus protocol ensuring automatic failover and zero-downtime rolling service upgrades."
      ]
    },
    {
      name: "DevPulse Analytics Platform",
      techStack: "TypeScript, Next.js, PostgreSQL, Tailwind CSS",
      projectLink: "https://github.com/alexmorgan/devpulse",
      bullets: [
        "Open-source developer analytics dashboard adopted by **2,500+ active GitHub repositories** worldwide.",
        "Built end-to-end OAuth2 authentication, webhook ingestion engine, and automated weekly summary reporting."
      ]
    }
  ],
  education: [
    {
      institution: "Stanford University",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      dates: "2015 – 2019",
      grade: "GPA: 3.85 / 4.0"
    }
  ],
  achievements: [
    "AWS Certified Solutions Architect – Associate (2023)",
    "1st Place Winner — Silicon Valley Global Hackathon (out of 450+ participants)",
    "Published speaker at React Summit: 'Architecting High-Performance Micro-Frontends'"
  ],
  languages: [
    "English (Native / Bilingual)",
    "Spanish (Professional Working Proficiency)"
  ]
}

export const DUMMY_FORM_JOBS: JobInput[] = [
  {
    company: "Apex Solutions",
    role: "Senior Software Engineer",
    startDate: "2022-01",
    endDate: "Present",
    location: "San Francisco, CA",
    currentlyWorkHere: true,
    points: [
      "Architected and deployed a real-time event streaming pipeline processing **15M+ daily events**, reducing ingestion latency by **45%**.",
      "Spearheaded migration of legacy monolith to Next.js and Go microservices, accelerating Core Web Vitals performance by **60%**.",
      "Mentored a team of 6 engineers, instituted comprehensive automated testing, and increased unit/integration test coverage from 64% to **92%**."
    ]
  },
  {
    company: "Vanguard Technologies",
    role: "Software Engineer",
    startDate: "2019-06",
    endDate: "2021-12",
    location: "San Francisco, CA",
    currentlyWorkHere: false,
    points: [
      "Engineered scalable RESTful and GraphQL APIs serving **500K+ daily active users** with a 99.99% uptime SLA.",
      "Optimized complex PostgreSQL query execution plans and Redis caching, cutting average API response times from 320ms to **78ms**.",
      "Collaborated with product managers and UX designers to deliver 14 high-impact feature releases on schedule."
    ]
  }
]

export const DUMMY_FORM_PROJECTS: ProjectInput[] = [
  {
    name: "CloudMesh Distributed Router",
    techStack: "Go, Kafka, Redis, Docker",
    projectLink: "https://github.com/alexmorgan/cloudmesh",
    points: [
      "High-throughput asynchronous message bus supporting **50K concurrent WebSocket connections** across distributed cluster nodes.",
      "Implemented distributed consensus protocol ensuring automatic failover and zero-downtime rolling service upgrades."
    ]
  },
  {
    name: "DevPulse Analytics Platform",
    techStack: "TypeScript, Next.js, PostgreSQL, Tailwind CSS",
    projectLink: "https://github.com/alexmorgan/devpulse",
    points: [
      "Open-source developer analytics dashboard adopted by **2,500+ active GitHub repositories** worldwide.",
      "Built end-to-end OAuth2 authentication, webhook ingestion engine, and automated weekly summary reporting."
    ]
  }
]

export const DUMMY_FORM_EDUCATION: EducationInput[] = [
  {
    institution: "Stanford University",
    degree: "Bachelor of Science",
    fieldOfStudy: "Computer Science",
    year: "2015 – 2019",
    grade: "GPA: 3.85 / 4.0"
  }
]

interface TemplateCandidateData {
  name?: string
  role?: string
  photoUrl?: string
}

interface TemplateOption {
  id: string
  name: string
  description: string
  category?: 'all' | 'ats' | 'tech' | 'executive' | 'photo' | 'creative'
  badge?: string
  atsScore?: number
  renderThumbnail: (data?: TemplateCandidateData) => React.ReactNode
}

function RealisticHeadshot({ photoUrl, className = "w-7 h-8" }: { photoUrl?: string; className?: string }) {
  if (photoUrl) {
    return (
      <div className={`${className} relative rounded-xs overflow-hidden shrink-0 border border-slate-300 dark:border-slate-600 shadow-xs`}>
        <img src={photoUrl} alt="Candidate" className="w-full h-full object-cover" />
      </div>
    )
  }
  return (
    <div className={`${className} relative rounded-xs overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-xs flex items-center justify-center`}>
      <svg viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
        <rect width="40" height="46" fill="#e2e8f0" />
        <path d="M4 46C4 36 10 32 20 32C30 32 36 36 36 46H4Z" fill="#1e293b" />
        <path d="M15 32L20 40L25 32H15Z" fill="#ffffff" />
        <path d="M19 33L20 41L21 33L20.5 32H19.5L19 33Z" fill="#4f46e5" />
        <rect x="17" y="24" width="6" height="9" fill="#fed7aa" />
        <ellipse cx="20" cy="18" rx="8" ry="9.5" fill="#fed7aa" />
        <path d="M12 15C12 9 15 7 20 7C25 7 28 9 28 15C27 12 25 10 20 10C15 10 13 12 12 15Z" fill="#0f172a" />
      </svg>
    </div>
  )
}

const getCandidate = (data?: TemplateCandidateData, defaultRole = DUMMY_RESUME_DATA.role) => {
  const cName = data?.name && data.name.trim() ? data.name.trim() : DUMMY_RESUME_DATA.name
  const cRole = data?.role && data.role.trim() ? data.role.trim() : defaultRole
  return { name: cName, role: cRole }
}

const TEMPLATES: TemplateOption[] = [
  {
    id: "classic-serif",
    name: "Classic Serif",
    description: "Traditional academic styling with Times-Roman serif typography and centered headers.",
    category: "ats",
    badge: "Classic",
    atsScore: 98,
    renderThumbnail: (data) => {
      const { name: cName, role: cRole } = getCandidate(data, "Senior Software Architect")
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg p-2 flex flex-col space-y-0.5 border border-slate-200 dark:border-slate-800 font-serif shadow-xs overflow-hidden select-none pointer-events-none">
          {/* Header */}
          <div className="text-center pb-0.5 border-b border-slate-800 dark:border-slate-200">
            <div className="text-[8.5px] font-black uppercase tracking-widest text-slate-900 dark:text-white leading-tight truncate">
              {cName}
            </div>
            <div className="text-[5px] italic text-slate-600 dark:text-slate-400 truncate">
              {cRole}
            </div>
            <div className="text-[3.8px] text-slate-500 dark:text-slate-400 truncate">
              alex.morgan@email.com • +1 555-0192 • San Francisco, CA • linkedin.com/in/alex • github.com/alex
            </div>
          </div>

          {/* Professional Summary */}
          <div>
            <div className="text-[4.5px] font-bold uppercase tracking-wider text-center text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-0.2 mb-0.2">
              Professional Summary
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight text-center">
              Accomplished software architect with 8+ years designing fault-tolerant distributed cloud systems, high-throughput microservices, and enterprise web platforms.
            </p>
          </div>

          {/* Experience */}
          <div className="space-y-0.5">
            <div className="text-[4.5px] font-bold uppercase tracking-wider text-center text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-0.2">
              Professional Experience
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Apex Solutions — Lead Architect</span>
                <span className="text-[3.8px] font-normal text-slate-500 shrink-0">2021 – Pres</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Directed cloud migration scaling distributed systems to 3M+ active daily users.
              </p>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Optimized database throughput, decreasing query latency by 42%.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Vanguard Tech — Software Engineer</span>
                <span className="text-[3.8px] font-normal text-slate-500 shrink-0">2018 – 2021</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Built distributed messaging pipelines handling 10M+ daily events in Go.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Starlight Labs — Associate Engineer</span>
                <span className="text-[3.8px] font-normal text-slate-500 shrink-0">2016 – 2018</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Developed RESTful services in Node.js and PostgreSQL for fintech clients.
              </p>
            </div>
          </div>

          {/* Key Projects */}
          <div>
            <div className="text-[4.5px] font-bold uppercase tracking-wider text-center text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-0.2 mb-0.2">
              Featured Projects
            </div>
            <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
              <span className="truncate">CloudMesh Engine (Go, Kafka, Redis)</span>
              <span className="text-[3.8px] font-normal text-slate-500 shrink-0">github.com/mesh</span>
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
              • High-throughput event router deployed across 8 global cloud regions.
            </p>
            <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white mt-0.2">
              <span className="truncate">SecureAuth Gateway (Python, OAuth2)</span>
              <span className="text-[3.8px] font-normal text-slate-500 shrink-0">50k req/s</span>
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
              • Zero-trust authentication service with automated token rotation.
            </p>
          </div>

          {/* Skills & Education */}
          <div className="pt-0.5 border-t border-slate-200 dark:border-slate-800 space-y-0.2">
            <div className="text-[4.2px] text-slate-700 dark:text-slate-300 truncate">
              <span className="font-bold text-slate-900 dark:text-white">Skills:</span> TypeScript, React, Python, Go, Node.js, AWS, Kubernetes, PostgreSQL, Docker, Redis
            </div>
            <div className="flex justify-between text-[4.2px]">
              <span className="font-bold text-slate-900 dark:text-white truncate">B.S. Computer Science — Stanford University (GPA 3.9)</span>
              <span className="text-slate-500 text-[3.8px] shrink-0">AWS Certified Pro • CKA</span>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: "modern-minimal",
    name: "Modern Minimalist",
    description: "Clean sans-serif layout with muted slate tones and left-aligned headers.",
    category: "creative",
    badge: "Minimal",
    atsScore: 95,
    renderThumbnail: (data) => {
      const { name: cName, role: cRole } = getCandidate(data, "Full Stack Developer")
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg p-2 flex flex-col space-y-0.5 border border-slate-200 dark:border-slate-800 font-sans shadow-xs overflow-hidden select-none pointer-events-none">
          {/* Header */}
          <div className="pb-0.5 border-b border-slate-100 dark:border-slate-800">
            <div className="text-[9.5px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight truncate">
              {cName}
            </div>
            <div className="text-[5px] font-semibold text-indigo-600 dark:text-indigo-400 truncate">
              {cRole}
            </div>
            <div className="text-[3.8px] text-slate-400 dark:text-slate-500 mt-0.2 truncate">
              alex@email.com • +1 555-0192 • San Francisco, CA • linkedin.com/in/alex • alexmorgan.dev
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="text-[4.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.2">
              Summary
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-400 leading-tight">
              Full-stack engineer crafting performant web apps, design systems, and resilient cloud APIs with 7+ years of startup experience.
            </p>
          </div>

          {/* Experience */}
          <div className="space-y-0.5">
            <div className="text-[4.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Experience
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-800 dark:text-slate-200">
                <span className="truncate">Acme Corp • Senior Developer</span>
                <span className="text-[3.8px] font-normal text-slate-400 shrink-0">2021 – Pres</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-400 leading-tight pl-1">
                • Spearheaded checkout rebuild, increasing mobile conversion by 22%.
              </p>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-400 leading-tight pl-1">
                • Standardized REST API patterns across 14 microservices.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-800 dark:text-slate-200">
                <span className="truncate">Starlight Labs • Frontend Engineer</span>
                <span className="text-[3.8px] font-normal text-slate-400 shrink-0">2019 – 2021</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-400 leading-tight pl-1">
                • Developed real-time telemetry dashboard with React & WebSockets.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-800 dark:text-slate-200">
                <span className="truncate">PixelForge • Web Developer</span>
                <span className="text-[3.8px] font-normal text-slate-400 shrink-0">2017 – 2019</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-400 leading-tight pl-1">
                • Shipped 20+ responsive web applications with 99.8% test coverage.
              </p>
            </div>
          </div>

          {/* Projects */}
          <div>
            <div className="text-[4.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.2">
              Projects
            </div>
            <div className="flex justify-between text-[4.3px] font-bold text-slate-800 dark:text-slate-200">
              <span className="truncate">NextPulse Telemetry (Next.js, Tailwind)</span>
              <span className="text-[3.8px] font-normal text-slate-400 shrink-0">v2.0</span>
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-400 leading-tight pl-1">
              • High-performance metrics dashboard with sub-50ms latency.
            </p>
            <div className="flex justify-between text-[4.3px] font-bold text-slate-800 dark:text-slate-200 mt-0.2">
              <span className="truncate">QuickState Store (TypeScript)</span>
              <span className="text-[3.8px] font-normal text-slate-400 shrink-0">★ 1.8k</span>
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-400 leading-tight pl-1">
              • Ultra-lightweight reactive state management library.
            </p>
          </div>

          {/* Skills & Education */}
          <div className="pt-0.5 border-t border-slate-100 dark:border-slate-800 space-y-0.2">
            <div className="text-[4.2px] text-slate-600 dark:text-slate-400 truncate">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Stack:</span> TypeScript, Next.js, Node, GraphQL, PostgreSQL, Docker, AWS, Redis, Tailwind
            </div>
            <div className="flex justify-between text-[4.2px] text-slate-500">
              <span>B.S. Software Engineering — UC Berkeley</span>
              <span>Scrum Master (CSM) • AWS Dev</span>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: "executive-navy",
    name: "Executive Navy",
    description: "Polished corporate style featuring deep navy accents and sharp dividing lines.",
    category: "executive",
    badge: "Corporate",
    atsScore: 96,
    renderThumbnail: (data) => {
      const { name: cName, role: cRole } = getCandidate(data, "Vice President of Engineering")
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg p-2 flex flex-col space-y-0.5 border border-slate-200 dark:border-slate-800 font-sans shadow-xs overflow-hidden select-none pointer-events-none">
          {/* Header */}
          <div className="text-center pb-0.5 border-b-2 border-blue-900 dark:border-blue-400">
            <div className="text-[9.5px] font-black uppercase tracking-wider text-blue-900 dark:text-blue-400 leading-tight truncate">
              {cName}
            </div>
            <div className="text-[5px] font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300 truncate">
              {cRole}
            </div>
            <div className="text-[3.8px] text-slate-500 dark:text-slate-400 mt-0.2 truncate">
              alex.morgan@enterprise.io • +1 555-0192 • New York, NY • linkedin.com/in/alexmorgan
            </div>
          </div>

          {/* Profile */}
          <div>
            <div className="text-[4.5px] font-black text-blue-900 dark:text-blue-400 uppercase tracking-wider border-b border-blue-900/30 pb-0.2 mb-0.2">
              Executive Profile
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight">
              Strategic technology executive with 12+ years scaling global engineering organizations, driving enterprise cloud transformations, and delivering SaaS solutions generating over $50M in ARR.
            </p>
          </div>

          {/* Experience */}
          <div className="space-y-0.5">
            <div className="text-[4.5px] font-black text-blue-900 dark:text-blue-400 uppercase tracking-wider border-b border-blue-900/30 pb-0.2">
              Leadership Experience
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Global Cloud Corp — VP Engineering</span>
                <span className="text-[3.8px] font-medium text-blue-900 dark:text-blue-400 shrink-0">2020 – Pres</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Scaled engineering department from 20 to 85 engineers across 4 regions; delivered $18M ARR product.
              </p>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Championed DevSecOps culture reducing deployment cycle times from weeks to minutes.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Apex Systems — Director of Software</span>
                <span className="text-[3.8px] font-medium text-blue-900 dark:text-blue-400 shrink-0">2017 – 2020</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Unified architecture across 28 distributed services reducing cloud spend 30%.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Vanguard Tech — Systems Architect</span>
                <span className="text-[3.8px] font-medium text-blue-900 dark:text-blue-400 shrink-0">2014 – 2017</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Architected core transaction clearing system handling $2B+ in annual volume.
              </p>
            </div>
          </div>

          {/* Strategic Initiatives */}
          <div>
            <div className="text-[4.5px] font-black text-blue-900 dark:text-blue-400 uppercase tracking-wider border-b border-blue-900/30 pb-0.2 mb-0.2">
              Strategic Initiatives
            </div>
            <div className="text-[4.3px] font-bold text-slate-900 dark:text-white">
              Enterprise Cloud Modernization & SOC2 Certification
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
              • Migrated 400+ on-prem workloads to AWS with 100% compliance audit pass.
            </p>
          </div>

          {/* Competencies & Education */}
          <div className="pt-0.5 border-t border-blue-900/30 space-y-0.2">
            <div className="text-[4px] text-slate-700 dark:text-slate-300 truncate">
              <span className="font-bold text-blue-900 dark:text-blue-400">Competencies:</span> Strategic Roadmapping, P&L ($25M+), SOC2 Type II, Global Team Leadership
            </div>
            <div className="flex justify-between items-center text-[4.2px]">
              <span className="font-bold text-blue-900 dark:text-blue-400 truncate">Columbia University — M.S. CS</span>
              <span className="text-slate-500 shrink-0">Board Member, TechVentures</span>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: "compact-tech",
    name: "Compact Tech",
    description: "High-density layout optimized for tech professionals with maximum content space.",
    category: "tech",
    badge: "Tech Mono",
    atsScore: 97,
    renderThumbnail: (data) => {
      const { name: cName } = getCandidate(data, "Staff Backend Engineer")
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg p-2 flex flex-col space-y-0.5 border border-slate-200 dark:border-slate-800 font-mono shadow-xs overflow-hidden select-none pointer-events-none">
          {/* Header */}
          <div className="flex justify-between items-baseline border-b border-slate-800 dark:border-slate-200 pb-0.5">
            <span className="text-[8px] font-black text-slate-950 dark:text-white truncate">{cName.toUpperCase()}</span>
            <span className="text-[3.8px] text-slate-500 shrink-0">alex@dev.io • github.com/alex • +1 555-0192</span>
          </div>

          <div className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight">
            // SUMMARY: Staff engineer specializing in distributed systems, Kafka streaming & low-latency APIs.
          </div>

          {/* Tech Stack Matrix */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-1 rounded border border-slate-200 dark:border-slate-700 text-[3.8px] leading-tight space-y-0.2">
            <div className="truncate"><span className="font-bold text-slate-900 dark:text-white">LANGUAGES:</span> TypeScript, Python, Go, Rust, C++, SQL</div>
            <div className="truncate"><span className="font-bold text-slate-900 dark:text-white">FRAMEWORKS:</span> React, Next.js, Node, FastAPI, Express, Tailwind</div>
            <div className="truncate"><span className="font-bold text-slate-900 dark:text-white">DEVOPS:</span> Docker, Kubernetes, AWS (EKS, S3, RDS), Terraform, CI/CD</div>
          </div>

          {/* Experience */}
          <div className="space-y-0.5">
            <div className="text-[4.5px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              // WORK_EXPERIENCE
            </div>
            <div>
              <div className="flex justify-between text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">CloudGrid — Staff Backend Engineer</span>
                <span className="text-[3.8px] text-slate-500 shrink-0">2021 – Pres</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 pl-1 leading-tight">
                • Deployed distributed event engine processing 80k rps with 99.99% SLA.
              </p>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 pl-1 leading-tight">
                • Cut cloud compute cost by $60k/mo through memory profiling & Go optimization.
              </p>
            </div>
            <div>
              <div className="flex justify-between text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">ByteStream — Systems Engineer</span>
                <span className="text-[3.8px] text-slate-500 shrink-0">2019 – 2021</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 pl-1 leading-tight">
                • Implemented zero-trust auth service with mTLS across 24 services.
              </p>
            </div>
            <div>
              <div className="flex justify-between text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">KernelWorks — Software Developer</span>
                <span className="text-[3.8px] text-slate-500 shrink-0">2017 – 2019</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 pl-1 leading-tight">
                • Built high-concurrency TCP socket server handling 100k persistent connections.
              </p>
            </div>
          </div>

          {/* Projects */}
          <div>
            <div className="text-[4.5px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              // KEY_PROJECTS
            </div>
            <div className="flex justify-between text-[4.3px] font-bold text-slate-900 dark:text-white">
              <span className="truncate">TaskFlow Orchestrator (Go, Redis)</span>
              <span className="text-[3.8px] text-slate-500 shrink-0">★ 2.4k</span>
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-300 pl-1 leading-tight">
              • Fault-tolerant distributed queue handling 50k+ worker tasks/sec.
            </p>
          </div>

          {/* Education */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-0.5 flex justify-between text-[4.2px]">
            <span className="font-bold text-slate-900 dark:text-white truncate">B.S. CS — Georgia Tech (GPA 3.9)</span>
            <span className="text-slate-500 shrink-0">CKA Certified • AWS Pro</span>
          </div>
        </div>
      )
    }
  },
  {
    id: "two-column",
    name: "Two-Column",
    description: "30/70 split layout with skills & education on the left, experience & projects on the right.",
    category: "creative",
    badge: "2-Column",
    atsScore: 88,
    renderThumbnail: (data) => {
      const { name: cName, role: cRole } = getCandidate(data, "Senior Full Stack Engineer")
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg p-2 flex flex-col space-y-0.5 border border-slate-200 dark:border-slate-800 font-sans shadow-xs overflow-hidden select-none pointer-events-none">
          {/* Header */}
          <div className="pb-0.5 border-b border-slate-200 dark:border-slate-700">
            <div className="text-[9.5px] font-extrabold text-slate-900 dark:text-white leading-tight truncate">
              {cName}
            </div>
            <div className="text-[5px] font-semibold text-indigo-600 dark:text-indigo-400 truncate">
              {cRole} • alex@email.com • +1 555-0192 • San Francisco, CA
            </div>
          </div>

          <div className="flex gap-1.5 flex-1 pt-0.2 overflow-hidden">
            {/* Left Column (32%) */}
            <div className="w-[32%] border-r border-slate-200 dark:border-slate-700 pr-1 space-y-0.5 shrink-0">
              <div>
                <div className="text-[4.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-0.2">
                  Contact
                </div>
                <div className="text-[3.5px] text-slate-500 dark:text-slate-400 space-y-0.2">
                  <div className="truncate">alex@email.com</div>
                  <div>+1 555-0192</div>
                  <div>San Francisco</div>
                  <div className="truncate">linkedin.com/in/alex</div>
                </div>
              </div>
              <div>
                <div className="text-[4.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-0.2">
                  Skills
                </div>
                <div className="flex flex-wrap gap-0.2 text-[3.5px]">
                  {["React", "TS", "Node", "Python", "AWS", "SQL", "Docker", "Next", "Redis", "GraphQL"].map((s) => (
                    <span key={s} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-0.8 py-0.2 rounded-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[4.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-0.2">
                  Education
                </div>
                <div className="text-[3.5px] text-slate-600 dark:text-slate-400 leading-tight">
                  <div className="font-bold text-slate-800 dark:text-slate-200">B.S. Comp Sci</div>
                  <div>Stanford '20 (3.85 GPA)</div>
                </div>
              </div>
              <div>
                <div className="text-[4.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-0.2">
                  Certifications
                </div>
                <div className="text-[3.5px] text-slate-500 leading-tight">
                  AWS Solutions Architect Pro
                </div>
              </div>
              <div>
                <div className="text-[4.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-0.2">
                  Languages
                </div>
                <div className="text-[3.5px] text-slate-500 leading-tight">
                  English (Native), Spanish (Fluent)
                </div>
              </div>
            </div>

            {/* Right Column (68%) */}
            <div className="w-[68%] space-y-0.5 pl-0.5">
              <div>
                <div className="text-[4.5px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-0.2 mb-0.2">
                  Summary
                </div>
                <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight">
                  Full stack engineer building scalable financial web apps, payment gateways, and real-time transaction microservices.
                </p>
              </div>

              <div>
                <div className="text-[4.5px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-0.2">
                  Experience
                </div>
                <div>
                  <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                    <span className="truncate">FinTech • Lead Eng</span>
                    <span className="text-[3.5px] text-slate-400 shrink-0">2021–Pres</span>
                  </div>
                  <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                    • Built payment gateway processing $45M/mo with sub-second latency.
                  </p>
                  <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                    • Reduced cart checkout drop-off rate by 24% via instant auth.
                  </p>
                </div>
                <div>
                  <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                    <span className="truncate">NextGen • Software Dev</span>
                    <span className="text-[3.5px] text-slate-400 shrink-0">2019–2021</span>
                  </div>
                  <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                    • Designed automated CI testing suite improving code coverage to 92%.
                  </p>
                </div>
                <div>
                  <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                    <span className="truncate">Alpha Web • Junior Dev</span>
                    <span className="text-[3.5px] text-slate-400 shrink-0">2017–2019</span>
                  </div>
                  <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                    • Integrated 15+ third-party REST APIs and payment webhooks.
                  </p>
                </div>
              </div>

              <div>
                <div className="text-[4.5px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-0.2 mb-0.2">
                  Key Projects
                </div>
                <div className="text-[4.3px] font-bold text-slate-900 dark:text-white truncate">
                  PayFlow SDK (Go, Stripe, Redis)
                </div>
                <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                  • Sub-100ms checkout SDK integrated by 80+ merchants.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: "creative-bold",
    name: "Creative Bold",
    description: "Eye-catching design with a vibrant accent bar and border-accented section headers.",
    category: "creative",
    badge: "Creative",
    atsScore: 90,
    renderThumbnail: (data) => {
      const { name: cName, role: cRole } = getCandidate(data, "Lead Product Designer & UI Engineer")
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg p-2 flex flex-col space-y-0.5 border border-slate-200 dark:border-slate-800 font-sans shadow-xs overflow-hidden select-none pointer-events-none">
          {/* Header */}
          <div className="border-l-3 border-indigo-600 pl-1.5 pb-0.5">
            <div className="text-[9.5px] font-black text-indigo-700 dark:text-indigo-400 leading-tight truncate">
              {cName.toUpperCase()}
            </div>
            <div className="text-[5px] font-bold text-slate-800 dark:text-slate-200 truncate">
              {cRole}
            </div>
            <div className="text-[3.8px] text-slate-500 dark:text-slate-400 mt-0.2 truncate">
              alex@designstudio.io • portfolio.dev • San Francisco, CA • behance.net/alex
            </div>
          </div>

          {/* About Me */}
          <div>
            <div className="flex items-center gap-1 border-b border-indigo-100 dark:border-indigo-950 pb-0.2 mb-0.2">
              <div className="w-1 h-1.5 bg-indigo-600 rounded-xs" />
              <span className="text-[4.5px] font-black uppercase tracking-wider text-indigo-950 dark:text-indigo-300">
                About Me
              </span>
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight">
              Design technologist crafting high-conversion design systems, accessible UI kits, and interactive web experiences.
            </p>
          </div>

          {/* Experience */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 border-b border-indigo-100 dark:border-indigo-950 pb-0.2">
              <div className="w-1 h-1.5 bg-indigo-600 rounded-xs" />
              <span className="text-[4.5px] font-black uppercase tracking-wider text-indigo-950 dark:text-indigo-300">
                Work Experience
              </span>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Studio Pixel — Design Lead</span>
                <span className="text-[3.8px] font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">2022 – Pres</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Created design system powering 6 mobile and web enterprise applications.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Verve Digital — Senior UI Developer</span>
                <span className="text-[3.8px] font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">2020 – 2022</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Built accessible React design component kit reducing sprint cycles 35%.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Nova Agency — UI/UX Designer</span>
                <span className="text-[3.8px] font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">2018 – 2020</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Designed 25+ responsive brand identities and web design systems.
              </p>
            </div>
          </div>

          {/* Featured Projects */}
          <div>
            <div className="flex items-center gap-1 border-b border-indigo-100 dark:border-indigo-950 pb-0.2 mb-0.2">
              <div className="w-1 h-1.5 bg-indigo-600 rounded-xs" />
              <span className="text-[4.5px] font-black uppercase tracking-wider text-indigo-950 dark:text-indigo-300">
                Featured Projects
              </span>
            </div>
            <div className="flex justify-between text-[4.3px]">
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate">OpenDesign UI Kit (4.5k stars)</span>
              <span className="text-slate-400 text-[3.8px] shrink-0">React • Figma</span>
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
              • Modular component system with 100% WCAG AA compliance.
            </p>
          </div>

          {/* Skills & Honors */}
          <div className="space-y-0.2 pt-0.2">
            <div className="flex flex-wrap gap-0.5 text-[3.5px]">
              {["Design Systems", "Figma", "React", "Next.js", "Tailwind", "Motion", "A11y", "TypeScript", "WebGL", "Storybook"].map((tag) => (
                <span key={tag} className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-0.8 py-0.2 rounded-xs font-semibold">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex justify-between text-[4px] text-slate-500 pt-0.2 border-t border-slate-100 dark:border-slate-800">
              <span>B.A. Interactive Media — RISD</span>
              <span>Awwwards Site of the Day (2023)</span>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: "elegant-sidebar",
    name: "Elegant Sidebar",
    description: "Distinct left sidebar with contact info & skills separated by a clean vertical divider.",
    category: "creative",
    badge: "Sidebar",
    atsScore: 86,
    renderThumbnail: (data) => {
      const { name: cName, role: cRole } = getCandidate(data, "Enterprise Solutions Architect")
      const initials = cName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || "AM"
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg flex border border-slate-200 dark:border-slate-800 font-sans shadow-xs overflow-hidden select-none pointer-events-none">
          {/* Left Sidebar (34%) */}
          <div className="w-[34%] bg-slate-100/90 dark:bg-slate-800/80 p-1.5 flex flex-col space-y-0.5 border-r border-slate-200 dark:border-slate-700 shrink-0">
            <div>
              <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-indigo-600 text-white text-[7px] font-black flex items-center justify-center mx-auto mb-0.5 shadow-xs">
                {initials}
              </div>
              <div className="text-center text-[5px] font-bold text-slate-900 dark:text-white truncate">{cName}</div>
              <div className="text-center text-[3.8px] text-slate-500 mb-0.5 truncate">Architect</div>

              <div className="text-[4px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600 pb-0.2 mb-0.2">
                Contact
              </div>
              <div className="text-[3.5px] text-slate-600 dark:text-slate-400 space-y-0.2 mb-0.5">
                <div className="truncate">alex@cloud.io</div>
                <div>+1 555-0192</div>
                <div>San Francisco</div>
                <div className="truncate">linkedin.com/in/alex</div>
              </div>

              <div className="text-[4px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600 pb-0.2 mb-0.2">
                Skills
              </div>
              <div className="text-[3.5px] text-slate-600 dark:text-slate-400 space-y-0.2 mb-0.5">
                <div>• Cloud Arch</div>
                <div>• TypeScript</div>
                <div>• Python / Go</div>
                <div>• Kubernetes</div>
                <div>• Terraform</div>
                <div>• Microservices</div>
              </div>

              <div className="text-[4px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600 pb-0.2 mb-0.2">
                Education
              </div>
              <div className="text-[3.5px] text-slate-500 truncate">
                MIT • B.S. CS '19 (Honors)
              </div>
            </div>

            <div className="text-[3.5px] text-slate-500 pt-0.2 border-t border-slate-200 dark:border-slate-700 space-y-0.2">
              <div>AWS Solutions Pro</div>
              <div>English, German</div>
            </div>
          </div>

          {/* Right Main (66%) */}
          <div className="w-[66%] p-1.5 flex flex-col space-y-0.5">
            <div>
              <div className="text-[9.5px] font-black text-slate-900 dark:text-white leading-tight truncate">
                {cName}
              </div>
              <div className="text-[5px] font-semibold text-slate-500 dark:text-slate-400 mb-0.2 truncate">
                {cRole}
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight">
                Architecting resilient multi-cloud infrastructures and microservices for Fortune 500 enterprises.
              </p>
            </div>

            <div className="space-y-0.5">
              <div className="text-[4.5px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-0.2">
                Work Experience
              </div>
              <div>
                <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                  <span className="truncate">Apex Cloud • Principal</span>
                  <span className="text-[3.5px] text-slate-400 shrink-0">2021–Pres</span>
                </div>
                <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                  • Directed 15 multi-region enterprise cloud migrations with zero downtime.
                </p>
                <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                  • Reduced operational cloud spend by 28% through autoscaling policies.
                </p>
              </div>
              <div>
                <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                  <span className="truncate">Matrix Soft • Senior Eng</span>
                  <span className="text-[3.5px] text-slate-400 shrink-0">2018–2021</span>
                </div>
                <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                  • Led migration of on-prem monolithic services to Kubernetes on AWS.
                </p>
              </div>
              <div>
                <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                  <span className="truncate">CloudNative • Systems Dev</span>
                  <span className="text-[3.5px] text-slate-400 shrink-0">2016–2018</span>
                </div>
                <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                  • Built distributed service discovery and API gateway proxy in Go.
                </p>
              </div>
            </div>

            <div>
              <div className="text-[4.5px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-0.2 mb-0.2">
                Key Initiatives
              </div>
              <div className="text-[4.3px] font-bold text-slate-900 dark:text-white">
                Multi-Region Disaster Recovery Mesh
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Active-active failover architecture cutting RTO from 2h to 12s.
              </p>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: "ats-clean",
    name: "ATS Clean",
    description: "Ultra-clean monospace layout without borders, engineered for 100% ATS readability.",
    category: "ats",
    badge: "100% ATS",
    atsScore: 100,
    renderThumbnail: (data) => {
      const { name: cName } = getCandidate(data, "Senior Software Engineer")
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg p-2 flex flex-col space-y-0.5 border border-slate-200 dark:border-slate-800 font-mono shadow-xs overflow-hidden select-none pointer-events-none">
          {/* Header */}
          <div className="text-center pb-0.5 border-b border-slate-400 dark:border-slate-600">
            <div className="text-[8.5px] font-bold text-slate-950 dark:text-white uppercase tracking-tight truncate">
              {cName.toUpperCase()}
            </div>
            <div className="text-[3.8px] text-slate-600 dark:text-slate-400 mt-0.2 truncate">
              alex.morgan@email.com | +1 555-0192 | San Francisco, CA | linkedin.com/in/alex | github.com/alex
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="text-[4.5px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              === PROFESSIONAL SUMMARY ===
            </div>
            <p className="text-[3.8px] text-slate-700 dark:text-slate-300 leading-tight">
              Senior software engineer with 8+ years specializing in distributed systems, backend APIs, and database performance optimization.
            </p>
          </div>

          {/* Experience */}
          <div className="space-y-0.5">
            <div className="text-[4.5px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              === PROFESSIONAL EXPERIENCE ===
            </div>
            <div>
              <div className="flex justify-between text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">SENIOR SOFTWARE ENGINEER, TECHCORP</span>
                <span className="text-[3.8px] font-normal text-slate-600 shrink-0">2021 – PRES</span>
              </div>
              <p className="text-[3.8px] text-slate-700 dark:text-slate-300 leading-tight pl-1">
                - Architected backend services handling $35M in monthly transactions.
              </p>
              <p className="text-[3.8px] text-slate-700 dark:text-slate-300 leading-tight pl-1">
                - Reduced database query latency by 45% via Redis caching architecture.
              </p>
            </div>
            <div>
              <div className="flex justify-between text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">SOFTWARE DEVELOPER, DATASYNC</span>
                <span className="text-[3.8px] font-normal text-slate-600 shrink-0">2018 – 2021</span>
              </div>
              <p className="text-[3.8px] text-slate-700 dark:text-slate-300 leading-tight pl-1">
                - Engineered scalable REST APIs using Python, PostgreSQL, and Docker.
              </p>
            </div>
            <div>
              <div className="flex justify-between text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">ASSOCIATE DEVELOPER, NEXUS SYSTEMS</span>
                <span className="text-[3.8px] font-normal text-slate-600 shrink-0">2016 – 2018</span>
              </div>
              <p className="text-[3.8px] text-slate-700 dark:text-slate-300 leading-tight pl-1">
                - Maintained core relational database schemas and optimized indexing.
              </p>
            </div>
          </div>

          {/* Projects */}
          <div>
            <div className="text-[4.5px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              === KEY PROJECTS ===
            </div>
            <div className="flex justify-between text-[4.3px] font-bold text-slate-900 dark:text-white">
              <span className="truncate">RATE LIMITER SERVICE (GO, REDIS)</span>
              <span className="text-[3.8px] font-normal text-slate-600 shrink-0">100k req/s</span>
            </div>
            <p className="text-[3.8px] text-slate-700 dark:text-slate-300 leading-tight pl-1">
              - Sliding-window algorithm preventing DDoS with sub-millisecond overhead.
            </p>
          </div>

          {/* Skills & Education */}
          <div className="border-t border-slate-300 dark:border-slate-700 pt-0.5 space-y-0.2">
            <div className="text-[4px] text-slate-700 dark:text-slate-300 truncate">
              Skills: Python, TypeScript, React, Node.js, SQL, AWS, Docker, Kubernetes, CI/CD, Kafka, Redis
            </div>
            <div className="flex justify-between text-[4px] text-slate-700 dark:text-slate-300">
              <span>B.S. in Computer Science — UCLA (2016)</span>
              <span>AWS Certified | CKA Certified</span>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: "photo-modern-sidebar",
    name: "Modern Photo Sidebar",
    description: "Professional two-column layout with candidate photo (sharp edges), skills & contacts in a stylish left sidebar.",
    category: "photo",
    badge: "Photo",
    atsScore: 82,
    renderThumbnail: (data) => {
      const { name: cName, role: cRole } = getCandidate(data, "Senior Software Engineer")
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg flex border border-slate-200 dark:border-slate-800 font-sans shadow-xs overflow-hidden select-none pointer-events-none">
          {/* Left Sidebar (32%) */}
          <div className="w-[32%] bg-indigo-50/70 dark:bg-indigo-950/40 p-1.5 flex flex-col space-y-0.5 border-r border-indigo-100 dark:border-indigo-900/60 items-center shrink-0">
            <div className="flex flex-col items-center w-full">
              <RealisticHeadshot photoUrl={data?.photoUrl} className="w-8 h-9 mb-0.5" />
              <div className="text-[4.5px] font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200 text-center border-b border-indigo-200 dark:border-indigo-800 pb-0.2 w-full mb-0.2">
                Contact
              </div>
              <div className="text-[3.5px] text-slate-600 dark:text-slate-400 space-y-0.2 w-full">
                <div className="truncate">alex@email.com</div>
                <div>+1 555-0192</div>
                <div>San Francisco</div>
                <div className="truncate">github.com/alex</div>
              </div>

              <div className="text-[4.5px] font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200 text-center border-b border-indigo-200 dark:border-indigo-800 pb-0.2 w-full mt-0.5 mb-0.2">
                Skills
              </div>
              <div className="text-[3.5px] text-slate-600 dark:text-slate-400 space-y-0.2 w-full">
                <div>• React / Next</div>
                <div>• TypeScript</div>
                <div>• Node / Python</div>
                <div>• Cloud & AWS</div>
                <div>• PostgreSQL</div>
                <div>• Docker & K8s</div>
              </div>

              <div className="text-[4.5px] font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200 text-center border-b border-indigo-200 dark:border-indigo-800 pb-0.2 w-full mt-0.5 mb-0.2">
                Education
              </div>
              <div className="text-[3.5px] text-slate-500 w-full text-center truncate">
                Stanford '20 • B.S. CS
              </div>
            </div>

            <div className="text-[3.5px] text-slate-500 w-full text-center pt-0.2 border-t border-indigo-100 dark:border-indigo-900/60 truncate">
              AWS Certified • French
            </div>
          </div>

          {/* Right Main (68%) */}
          <div className="w-[68%] p-1.5 flex flex-col space-y-0.5">
            <div>
              <div className="border-b-2 border-indigo-600 pb-0.2 mb-0.2">
                <div className="text-[9.5px] font-black text-slate-900 dark:text-white leading-tight truncate">
                  {cName}
                </div>
                <div className="text-[5px] font-bold text-indigo-600 dark:text-indigo-400 truncate">
                  {cRole}
                </div>
              </div>

              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight mb-0.2">
                Passionate full stack developer with expertise in high-performance web applications and cloud architecture.
              </p>
            </div>

            <div className="space-y-0.5">
              <div className="text-[4.5px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-0.2">
                Work Experience
              </div>
              <div>
                <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                  <span className="truncate">Apex Solutions • Lead</span>
                  <span className="text-[3.5px] text-slate-400 shrink-0">2021–Pres</span>
                </div>
                <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                  • Built distributed microservices serving 4M+ active daily users.
                </p>
                <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                  • Decreased API response times by 38% via Redis caching layer.
                </p>
              </div>
              <div>
                <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                  <span className="truncate">CoreTech • Senior Dev</span>
                  <span className="text-[3.5px] text-slate-400 shrink-0">2018–2021</span>
                </div>
                <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                  • Engineered GraphQL gateway integrating 12 microservices.
                </p>
              </div>
              <div>
                <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                  <span className="truncate">InnoSoft • Web Dev</span>
                  <span className="text-[3.5px] text-slate-400 shrink-0">2016–2018</span>
                </div>
                <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                  • Shipped customer-facing billing & subscription management portal.
                </p>
              </div>
            </div>

            <div>
              <div className="text-[4.5px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-0.2 mb-0.2">
                Featured Projects
              </div>
              <div className="text-[4.3px] font-bold text-slate-900 dark:text-white truncate">
                PulseStack Collaborative Dashboard
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Real-time collaborative workspace with WebSockets & Next.js.
              </p>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: "photo-executive",
    name: "Executive Headshot",
    description: "Prestigious executive template with a sharp rectangular headshot and corporate navy accents.",
    category: "photo",
    badge: "Photo",
    atsScore: 84,
    renderThumbnail: (data) => {
      const { name: cName, role: cRole } = getCandidate(data, "Chief Technology Officer")
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg p-2 flex flex-col space-y-0.5 border border-slate-200 dark:border-slate-800 font-sans shadow-xs overflow-hidden select-none pointer-events-none">
          {/* Header */}
          <div className="flex items-center gap-1.5 pb-0.5 border-b-2 border-blue-900 dark:border-blue-400">
            <RealisticHeadshot photoUrl={data?.photoUrl} className="w-8 h-10" />
            <div className="flex-1 min-w-0">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-blue-900 dark:text-blue-400 leading-tight truncate">
                {cName}
              </div>
              <div className="text-[5px] font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300 truncate">
                {cRole}
              </div>
              <div className="text-[3.8px] text-slate-500 dark:text-slate-400 mt-0.2 truncate">
                alex.morgan@exec.io • +1 555-0192 • New York • linkedin.com/in/alex
              </div>
            </div>
          </div>

          {/* Leadership Profile */}
          <div>
            <div className="text-[4.5px] font-black text-blue-900 dark:text-blue-400 uppercase tracking-wider border-b border-blue-900/30 pb-0.2 mb-0.2">
              Executive Leadership
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight">
              Strategic technology executive overseeing $25M budget and 80+ engineers delivering enterprise cloud platforms.
            </p>
          </div>

          {/* Experience */}
          <div className="space-y-0.5">
            <div className="text-[4.5px] font-black text-blue-900 dark:text-blue-400 uppercase tracking-wider border-b border-blue-900/30 pb-0.2">
              Career History
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">FinTech Holdings — CTO</span>
                <span className="text-[3.8px] font-medium text-blue-900 dark:text-blue-400 shrink-0">2020 – Pres</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Orchestrated cloud modernization reducing compute cost 34%.
              </p>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Achieved 100% SOC2 Type II compliance with zero critical findings.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Enterprise SaaS — VP Engineering</span>
                <span className="text-[3.8px] font-medium text-blue-900 dark:text-blue-400 shrink-0">2016 – 2020</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Scaled engineering organization from 15 to 65 across three continents.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Vanguard Capital — Director</span>
                <span className="text-[3.8px] font-medium text-blue-900 dark:text-blue-400 shrink-0">2013 – 2016</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Led digital transformation of core banking and portfolio platform.
              </p>
            </div>
          </div>

          {/* Key Programs */}
          <div>
            <div className="text-[4.5px] font-black text-blue-900 dark:text-blue-400 uppercase tracking-wider border-b border-blue-900/30 pb-0.2 mb-0.2">
              Key Strategic Programs
            </div>
            <div className="text-[4.3px] font-bold text-slate-900 dark:text-white">
              Global Multi-Cloud Migration & SOC2 Type II
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
              • Modernized 40+ legacy systems to AWS/GCP with zero unscheduled downtime.
            </p>
          </div>

          {/* Competencies & Education */}
          <div className="pt-0.5 border-t border-blue-900/30 space-y-0.2">
            <div className="text-[4px] text-slate-700 dark:text-slate-300 truncate">
              <span className="font-bold text-blue-900 dark:text-blue-400">Core:</span> Executive Governance, SOC2 Type II, SaaS Architecture, P&L ($25M)
            </div>
            <div className="flex justify-between items-center text-[4.2px]">
              <span className="font-bold text-blue-900 dark:text-blue-400 truncate">Columbia — M.S. Comp Sci</span>
              <span className="text-slate-500 shrink-0">Board Member, TechVentures</span>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: "photo-creative",
    name: "Creative Portfolio",
    description: "Dynamic layout featuring candidate headshot with clean sharp edges, vibrant indigo accents, and portfolio links.",
    category: "photo",
    badge: "Photo",
    atsScore: 80,
    renderThumbnail: (data) => {
      const { name: cName, role: cRole } = getCandidate(data, "Product Designer & Frontend Dev")
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg p-2 flex flex-col space-y-0.5 border border-slate-200 dark:border-slate-800 font-sans shadow-xs overflow-hidden select-none pointer-events-none">
          {/* Header */}
          <div className="flex items-center gap-1.5 pb-0.5">
            <div className="ring-2 ring-indigo-600 rounded-xs overflow-hidden shrink-0">
              <RealisticHeadshot photoUrl={data?.photoUrl} className="w-8 h-9" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9.5px] font-black text-indigo-700 dark:text-indigo-400 leading-tight truncate">
                {cName}
              </div>
              <div className="text-[5px] font-bold text-slate-800 dark:text-slate-200 truncate">
                {cRole}
              </div>
              <div className="text-[3.8px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
                github.com/alex • behance.net/alex • San Francisco • +1 555-0192
              </div>
            </div>
          </div>

          <div className="h-0.5 w-full bg-indigo-600 mb-0.2" />

          {/* About */}
          <div>
            <div className="text-[4.5px] font-black uppercase tracking-wider text-slate-900 dark:text-white border-l-2 border-indigo-600 pl-1 mb-0.2">
              About Me
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight">
              Product designer and creative developer building intuitive digital products, modular design systems, and delightful web animations.
            </p>
          </div>

          {/* Experience */}
          <div className="space-y-0.5">
            <div className="text-[4.5px] font-black uppercase tracking-wider text-slate-900 dark:text-white border-l-2 border-indigo-600 pl-1">
              Work Experience
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Studio Seven — Senior Designer</span>
                <span className="text-[3.8px] font-semibold text-indigo-600 shrink-0">2022 – Pres</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Led design and frontend UX for SaaS product used by 200k+ subscribers.
              </p>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Increased user onboarding completion rate from 62% to 88%.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Aura Labs — UI/UX Designer</span>
                <span className="text-[3.8px] font-semibold text-indigo-600 shrink-0">2020 – 2022</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Prototyped and shipped mobile design system with 98% design fidelity.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">HyperDesign — Visual Designer</span>
                <span className="text-[3.8px] font-semibold text-indigo-600 shrink-0">2018 – 2020</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Crafted comprehensive web design guidelines for 30+ client brands.
              </p>
            </div>
          </div>

          {/* Projects */}
          <div>
            <div className="text-[4.5px] font-black uppercase tracking-wider text-slate-900 dark:text-white border-l-2 border-indigo-600 pl-1 mb-0.2">
              Featured Projects
            </div>
            <div className="flex justify-between text-[4.3px] font-bold text-slate-900 dark:text-white truncate">
              Prism UI Kit (3.8k stars) • React, Figma
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
              • Dark-mode ready design system for enterprise dashboards.
            </p>
          </div>

          {/* Skills & Education */}
          <div className="space-y-0.2 pt-0.2">
            <div className="flex flex-wrap gap-0.5 text-[3.5px]">
              {["UI/UX Design", "React", "Next.js", "Figma", "Tailwind", "Design Systems", "Framer", "Motion", "Storybook", "A11y"].map((item) => (
                <span key={item} className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-0.8 py-0.2 rounded-xs font-semibold">
                  {item}
                </span>
              ))}
            </div>
            <div className="text-[4px] text-slate-500 pt-0.2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
              <span>B.F.A. Design & Technology — Parsons</span>
              <span>Awwwards Site of the Year Nominee</span>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: "photo-minimal",
    name: "Minimal Avatar",
    description: "Refined minimalist styling with a sharp rectangular profile photo badge alongside name & title.",
    category: "photo",
    badge: "Photo",
    atsScore: 85,
    renderThumbnail: (data) => {
      const { name: cName, role: cRole } = getCandidate(data, "Senior Software Engineer")
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg p-2 flex flex-col space-y-0.5 border border-slate-200 dark:border-slate-800 font-sans shadow-xs overflow-hidden select-none pointer-events-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-0.5 border-b border-slate-200 dark:border-slate-700">
            <div className="min-w-0 pr-1">
              <div className="text-[9.5px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                {cName}
              </div>
              <div className="text-[5px] font-medium text-slate-500 dark:text-slate-400 truncate">
                {cRole}
              </div>
              <div className="text-[3.8px] text-slate-400 mt-0.2 truncate">
                alex@email.com • +1 555-0192 • San Francisco, CA • github.com/alex
              </div>
            </div>
            <RealisticHeadshot photoUrl={data?.photoUrl} className="w-7 h-8" />
          </div>

          {/* Summary */}
          <div>
            <div className="text-[4.5px] font-bold uppercase tracking-widest text-slate-400 mb-0.2">
              Summary
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-400 leading-tight">
              Senior engineer focused on modular frontend architectures, micro-frontends, design systems, and distributed backend services.
            </p>
          </div>

          {/* Experience */}
          <div className="space-y-0.5">
            <div className="text-[4.5px] font-bold uppercase tracking-widest text-slate-400">
              Experience
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-800 dark:text-slate-200">
                <span className="truncate">NextScale Labs — Lead Engineer</span>
                <span className="text-[3.8px] text-slate-400 shrink-0">2021 – Pres</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-400 leading-tight pl-1">
                • Engineered real-time collaborative workspace serving 500k+ MAU.
              </p>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-400 leading-tight pl-1">
                • Reduced bundle size by 38% through route-based code splitting.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-800 dark:text-slate-200">
                <span className="truncate">Hyperion Soft — Software Dev</span>
                <span className="text-[3.8px] font-normal text-slate-400 shrink-0">2019 – 2021</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-400 leading-tight pl-1">
                • Built high-concurrency event ingestion service in Go and Kafka.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.3px] font-bold text-slate-800 dark:text-slate-200">
                <span className="truncate">OmniWeb — Full Stack Engineer</span>
                <span className="text-[3.8px] font-normal text-slate-400 shrink-0">2017 – 2019</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-400 leading-tight pl-1">
                • Shipped customer portal handling 100k daily active users.
              </p>
            </div>
          </div>

          {/* Projects */}
          <div>
            <div className="text-[4.5px] font-bold uppercase tracking-widest text-slate-400 mb-0.2">
              Projects
            </div>
            <div className="flex justify-between text-[4.3px] font-bold text-slate-800 dark:text-slate-200">
              <span className="truncate">HyperRoute (Micro-frontend Router)</span>
              <span className="text-[3.8px] text-slate-400 shrink-0">★ 1.2k</span>
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-400 leading-tight pl-1">
              • Zero-config micro-frontend router cutting bundle transfers 40%.
            </p>
          </div>

          {/* Skills & Education */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-0.5 space-y-0.2">
            <div className="text-[4px] text-slate-600 dark:text-slate-400 truncate">
              TypeScript, React, Next.js, Python, PostgreSQL, AWS, GraphQL, Docker, Redis, Tailwind
            </div>
            <div className="flex justify-between text-[4.2px] text-slate-500">
              <span>B.S. CS — University of Washington</span>
              <span>AWS Certified Architect</span>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: "ats-ivy-league",
    name: "Ivy League Classic",
    description: "Prestigious Wall Street & Tier-1 Consulting standard with Times-Roman typography, centered header, and 100% ATS score.",
    category: "ats",
    badge: "100% ATS",
    atsScore: 100,
    renderThumbnail: (data) => {
      const { name: cName, role: cRole } = getCandidate(data, "Senior Investment Analyst")
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg p-2 flex flex-col space-y-0.5 border border-slate-200 dark:border-slate-800 font-serif shadow-xs overflow-hidden select-none pointer-events-none">
          <div className="text-center pb-0.5 border-b border-black dark:border-white">
            <div className="text-[8.5px] font-bold text-slate-950 dark:text-white uppercase tracking-wider truncate">{cName}</div>
            <div className="text-[4.5px] italic text-slate-700 dark:text-slate-300 truncate">{cRole}</div>
            <div className="text-[3.8px] text-slate-600 dark:text-slate-400 truncate">
              alex@email.com • +1 555-0192 • New York, NY • linkedin.com/in/alex
            </div>
          </div>
          <div>
            <div className="text-[4.5px] font-bold uppercase tracking-wider text-center text-black dark:text-white border-b border-slate-200 dark:border-slate-800 pb-0.2">
              Education
            </div>
            <div className="flex justify-between items-baseline text-[4.2px] font-bold text-slate-900 dark:text-white">
              <span className="truncate">Harvard University — B.A. Economics</span>
              <span className="text-[3.8px] font-normal text-slate-500 shrink-0">GPA 3.92 • 2020</span>
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[4.5px] font-bold uppercase tracking-wider text-center text-black dark:text-white border-b border-slate-200 dark:border-slate-800 pb-0.2">
              Professional Experience
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.2px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Blackstone Capital — Senior Analyst</span>
                <span className="text-[3.8px] font-normal text-slate-500 shrink-0">2021 – Pres</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Built financial LBO models assessing $450M in enterprise acquisitions.
              </p>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Advised corporate executive leadership on capital allocation strategies.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.2px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">McKinsey & Company — Business Analyst</span>
                <span className="text-[3.8px] font-normal text-slate-500 shrink-0">2019 – 2021</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Spearheaded operational restructuring cutting client OpEx by $14M annually.
              </p>
            </div>
          </div>
          <div className="pt-0.5 border-t border-slate-200 dark:border-slate-800 space-y-0.2">
            <div className="text-[4px] text-slate-700 dark:text-slate-300 truncate">
              <span className="font-bold text-slate-900 dark:text-white">Skills:</span> Financial Modeling, DCF, M&A Diligence, SQL, Python, Bloomberg
            </div>
            <div className="flex justify-between text-[4px] text-slate-500">
              <span>CFA Level II Candidate</span>
              <span>English, French</span>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: "ats-tech-faang",
    name: "Silicon Valley FAANG",
    description: "Engineered for Google/Meta/Amazon tech roles with top-placed categorized skills matrix for maximum ATS keyword extraction.",
    category: "tech",
    badge: "Top Pick",
    atsScore: 100,
    renderThumbnail: (data) => {
      const { name: cName, role: cRole } = getCandidate(data, "Senior Cloud Architect")
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg p-2 flex flex-col space-y-0.5 border border-slate-200 dark:border-slate-800 font-sans shadow-xs overflow-hidden select-none pointer-events-none">
          <div className="pb-0.5 border-b border-blue-600 dark:border-blue-500">
            <div className="text-[9px] font-extrabold text-slate-950 dark:text-white truncate">{cName}</div>
            <div className="text-[4.8px] font-bold text-blue-600 dark:text-blue-400 truncate">{cRole}</div>
            <div className="text-[3.8px] text-slate-500 truncate">alex@tech.io • +1 555-0192 • Seattle, WA • github.com/alex • linkedin.com/in/alex</div>
          </div>
          <div className="bg-blue-50/50 dark:bg-blue-950/30 p-1 rounded border border-blue-100 dark:border-blue-900/40 text-[3.8px] leading-tight space-y-0.2">
            <div className="truncate"><span className="font-bold text-slate-900 dark:text-white">LANGUAGES:</span> Go, TypeScript, Python, Rust, Java, SQL</div>
            <div className="truncate"><span className="font-bold text-slate-900 dark:text-white">CLOUD / INFRA:</span> AWS (EKS, Lambda), Kubernetes, Docker, Terraform</div>
            <div className="truncate"><span className="font-bold text-slate-900 dark:text-white">SYSTEMS:</span> Kafka, Redis, Distributed Consensus, gRPC, GraphQL</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[4.5px] font-black uppercase tracking-wider text-blue-900 dark:text-blue-300 border-b border-slate-200 dark:border-slate-800 pb-0.2">
              Work Experience
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.2px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Google Cloud — Staff Engineer</span>
                <span className="text-[3.8px] text-slate-500 shrink-0">2021 – Pres</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Architected multi-tenant storage engine sustaining 450k IOPS with 99.999% uptime.
              </p>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Reduced tail latency (p99) from 180ms to 24ms via custom memory allocators.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.2px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Amazon AWS — Senior SDE</span>
                <span className="text-[3.8px] text-slate-500 shrink-0">2018 – 2021</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Led DynamoDB streaming ingestion pipeline handling 12B daily records.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-0.5 flex justify-between text-[4px]">
            <span className="font-bold text-slate-900 dark:text-white truncate">B.S. CS — University of Washington</span>
            <span className="text-slate-500 shrink-0">AWS Certified Solutions Pro</span>
          </div>
        </div>
      )
    }
  },
  {
    id: "ats-executive-modern",
    name: "Executive Leadership",
    description: "Commanding corporate layout with deep slate accents, Core Competencies matrix, and strategic leadership milestones.",
    category: "executive",
    badge: "Executive",
    atsScore: 98,
    renderThumbnail: (data) => {
      const { name: cName, role: cRole } = getCandidate(data, "Vice President of Technology")
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg p-2 flex flex-col space-y-0.5 border border-slate-200 dark:border-slate-800 font-sans shadow-xs overflow-hidden select-none pointer-events-none">
          <div className="pb-0.5 border-b-2 border-slate-800 dark:border-slate-200">
            <div className="text-[9.5px] font-black uppercase text-slate-900 dark:text-white truncate">{cName}</div>
            <div className="text-[4.8px] font-bold uppercase text-slate-600 dark:text-slate-400 truncate">{cRole}</div>
            <div className="text-[3.8px] text-slate-500 truncate">alex.executive@domain.com • +1 555-0192 • New York, NY • linkedin.com/in/alex</div>
          </div>
          <div>
            <div className="text-[4.5px] font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-0.2 mb-0.2">
              Executive Competencies & Scope
            </div>
            <div className="grid grid-cols-3 gap-0.5 text-[3.5px] text-slate-700 dark:text-slate-300">
              <span className="bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded truncate font-medium">• P&L ($35M+)</span>
              <span className="bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded truncate font-medium">• Global Team (120+)</span>
              <span className="bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded truncate font-medium">• SaaS Growth</span>
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[4.5px] font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-0.2">
              Career Trajectory
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.2px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Enterprise SaaS — VP Technology</span>
                <span className="text-[3.8px] text-slate-500 shrink-0">2020 – Pres</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Scaled engineering organization from 25 to 110; delivered SaaS platform generating $42M ARR.
              </p>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Spearheaded SOC2 Type II, ISO 27001, and HIPAA enterprise regulatory compliance.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.2px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">Global FinCorp — Director of Systems</span>
                <span className="text-[3.8px] text-slate-500 shrink-0">2016 – 2020</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Reduced operational cloud infrastructure spend by 32% while doubling capacity.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-0.5 flex justify-between text-[4px]">
            <span className="font-bold text-slate-900 dark:text-white truncate">Columbia University — M.S. CS & MBA</span>
            <span className="text-slate-500 shrink-0">Advisory Board Member</span>
          </div>
        </div>
      )
    }
  },
  {
    id: "ats-modern-swiss",
    name: "Clean Swiss Minimal",
    description: "International typographic hierarchy with generous tracking and subtle dividers, built for fast 6-second recruiter scans.",
    category: "ats",
    badge: "Fast Scan",
    atsScore: 99,
    renderThumbnail: (data) => {
      const { name: cName, role: cRole } = getCandidate(data, "Product Architect")
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg p-2 flex flex-col space-y-0.5 border border-slate-200 dark:border-slate-800 font-sans shadow-xs overflow-hidden select-none pointer-events-none">
          <div className="pb-0.5 border-b border-slate-200 dark:border-slate-800">
            <div className="text-[9.5px] font-extrabold tracking-tight text-slate-900 dark:text-white truncate">{cName}</div>
            <div className="text-[4.8px] font-semibold text-slate-600 dark:text-slate-400 truncate">{cRole}</div>
            <div className="text-[3.8px] text-slate-400 mt-0.2 truncate">alex@domain.ch • +1 555-0192 • Zurich / SF • linkedin.com/in/alex</div>
          </div>
          <div>
            <div className="text-[4.5px] font-bold text-slate-400 uppercase tracking-widest mb-0.2">Profile</div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight">
              Product architect crafting clear design systems, accessible interfaces, and scalable web solutions.
            </p>
          </div>
          <div className="space-y-0.5">
            <div className="text-[4.5px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-0.2">
              Experience
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.2px] font-bold text-slate-800 dark:text-slate-200">
                <span className="truncate">DesignLab Zurich — Lead Architect</span>
                <span className="text-[3.8px] text-slate-400 shrink-0">2021 – Pres</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-400 leading-tight pl-1">
                • Built modular design component kit adopted by 18 enterprise development teams.
              </p>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-400 leading-tight pl-1">
                • Improved user task completion rate by 28% through WCAG 2.1 AA accessibility overhaul.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.2px] font-bold text-slate-800 dark:text-slate-200">
                <span className="truncate">Starlight Media — Senior UI Dev</span>
                <span className="text-[3.8px] text-slate-400 shrink-0">2018 – 2021</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-400 leading-tight pl-1">
                • Engineered high-performance Next.js web application handling 3M monthly visits.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-0.5 space-y-0.2">
            <div className="text-[4px] text-slate-600 dark:text-slate-400 truncate">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Toolkit:</span> TypeScript, React, Next.js, Figma, Tailwind, Node.js, GraphQL, PostgreSQL
            </div>
            <div className="flex justify-between text-[4px] text-slate-400">
              <span>B.S. Interaction Design — ETH Zurich</span>
              <span>English, German</span>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: "ats-emerald-professional",
    name: "Modern Emerald Corporate",
    description: "Refined forest emerald accents on high-contrast black text, popular in healthcare, enterprise SaaS, and operations.",
    category: "ats",
    badge: "Modern",
    atsScore: 99,
    renderThumbnail: (data) => {
      const { name: cName, role: cRole } = getCandidate(data, "Senior Operations Director")
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg p-2 flex flex-col space-y-0.5 border border-slate-200 dark:border-slate-800 font-sans shadow-xs overflow-hidden select-none pointer-events-none">
          <div className="pb-0.5 border-b-2 border-emerald-700 dark:border-emerald-500">
            <div className="text-[9.5px] font-extrabold text-emerald-900 dark:text-emerald-300 truncate">{cName}</div>
            <div className="text-[4.8px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide truncate">{cRole}</div>
            <div className="text-[3.8px] text-slate-500 truncate">alex.morgan@healthcorp.com • +1 555-0192 • Boston, MA • linkedin.com/in/alex</div>
          </div>
          <div>
            <div className="text-[4.5px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 border-b border-emerald-100 dark:border-emerald-900 pb-0.2 mb-0.2">
              Professional Summary
            </div>
            <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight">
              Results-oriented director specializing in clinical healthcare operations, hospital system workflows, and regulatory compliance.
            </p>
          </div>
          <div className="space-y-0.5">
            <div className="text-[4.5px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 border-b border-emerald-100 dark:border-emerald-900 pb-0.2">
              Professional Experience
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.2px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">MassHealth Systems — Director</span>
                <span className="text-[3.8px] font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">2021 – Pres</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Directed clinical workflow modernization across 8 hospitals serving 180k patients.
              </p>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Reduced patient intake wait times by 34% through automated digital triage systems.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[4.2px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">BioPharm Partners — Operations Manager</span>
                <span className="text-[3.8px] font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">2018 – 2021</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Managed $18M clinical trial supply chain pipeline ensuring 100% FDA audit readiness.
              </p>
            </div>
          </div>
          <div className="border-t border-emerald-100 dark:border-emerald-900 pt-0.5 space-y-0.2">
            <div className="text-[4px] text-slate-700 dark:text-slate-300 truncate">
              <span className="font-bold text-emerald-900 dark:text-emerald-300">Competencies:</span> Clinical Operations, Healthcare IT, EHR, FDA Audits, Six Sigma
            </div>
            <div className="flex justify-between text-[4px] text-slate-500">
              <span>M.S. Healthcare Administration — Boston University</span>
              <span>Lean Six Sigma Black Belt</span>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: "ats-compact-onepage",
    name: "High-Impact 1-Page",
    description: "Space-efficient 1-page architecture fitting 5-10 years of experience with crisp compact line spacing.",
    category: "ats",
    badge: "1-Page",
    atsScore: 100,
    renderThumbnail: (data) => {
      const { name: cName } = getCandidate(data, "Senior Full Stack Engineer")
      return (
        <div className="h-[180px] w-full bg-white dark:bg-slate-900 rounded-lg p-1.5 flex flex-col space-y-0.5 border border-slate-200 dark:border-slate-800 font-sans shadow-xs overflow-hidden select-none pointer-events-none">
          <div className="flex justify-between items-baseline border-b border-slate-900 dark:border-slate-100 pb-0.2">
            <span className="text-[9px] font-black uppercase text-slate-950 dark:text-white truncate">{cName}</span>
            <span className="text-[3.8px] text-slate-500 shrink-0">alex@dev.io • +1 555-0192 • San Francisco</span>
          </div>
          <div className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight">
            Senior engineer with 8+ years building enterprise microservices, real-time data pipelines, and scalable cloud APIs.
          </div>
          <div className="space-y-0.5">
            <div className="text-[4.3px] font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-0.2">
              Experience
            </div>
            <div>
              <div className="flex justify-between text-[4.2px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">TechScale Corp — Staff Engineer</span>
                <span className="text-[3.8px] font-normal text-slate-500 shrink-0">2021 – Pres</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Built distributed event pipeline processing 25k events/sec with sub-50ms latency.
              </p>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Cut monthly infrastructure costs by $45,000 via AWS container migration.
              </p>
            </div>
            <div>
              <div className="flex justify-between text-[4.2px] font-bold text-slate-900 dark:text-white">
                <span className="truncate">CloudStream — Senior Backend Developer</span>
                <span className="text-[3.8px] font-normal text-slate-500 shrink-0">2018 – 2021</span>
              </div>
              <p className="text-[3.8px] text-slate-600 dark:text-slate-300 leading-tight pl-1">
                • Architected RESTful payment APIs processing over $60M in annual transactions.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-0.5 space-y-0.2">
            <div className="text-[3.8px] text-slate-700 dark:text-slate-300 truncate">
              <span className="font-bold text-slate-900 dark:text-white">Stack:</span> TypeScript, Go, Python, React, Next.js, Docker, Kubernetes, AWS, PostgreSQL, Redis
            </div>
            <div className="flex justify-between text-[3.8px] text-slate-500">
              <span>B.S. Computer Science — UC Berkeley (GPA 3.88)</span>
              <span>AWS Certified Solutions Architect</span>
            </div>
          </div>
        </div>
      )
    }
  }
]

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

interface ResumeBuilderPageProps {
  /**
   * Server-rendered guess at whether the promo hero should be shown, derived
   * from the session cookie. Crawlers (no cookie) get the H1 and marketing copy
   * in the initial HTML; signed-in users never see it flash in.
   */
  initialShowPromo?: boolean;
}

export default function ResumeBuilderPage({ initialShowPromo = true }: ResumeBuilderPageProps) {
  const { user, refreshUser, loading } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  // Hydration guard: ensures initial client render matches server HTML perfectly
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show promotional material only if the user is NOT logged in.
  // Before mounted, use server's initialShowPromo to guarantee zero hydration mismatch.
  const showPromo = mounted ? !user : initialShowPromo;

  // Credit & Usage State
  const isFirstTimeResumeBuilder = !(user?.hasUsedResumeBuilder ?? user?.has_used_resume_builder ?? (user as any)?.metadata?.has_used_resume_builder)
  const isFirstTime = mounted ? isFirstTimeResumeBuilder : true;
  const userTotalCredits = user ? ((user.subscriptionCredits || 0) + (user.purchasedCredits || 0) || (user.credits || 0)) : 0
  const [showCreditConfirmDialog, setShowCreditConfirmDialog] = useState(false)
  const [showDownloadConfirmDialog, setShowDownloadConfirmDialog] = useState(false)

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
  const [styleConfig, setStyleConfig] = useState<ResumeStyleConfig>({})
  const [templateCategory, setTemplateCategory] = useState<'all' | 'ats' | 'tech' | 'executive' | 'photo' | 'creative'>('all')
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [showStylingPicker, setShowStylingPicker] = useState(false)
  const templateScrollRef = useRef<HTMLDivElement>(null)

  const scrollTemplates = (direction: 'left' | 'right') => {
    if (templateScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300
      templateScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

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
  const [photoUrl, setPhotoUrl] = useState<string>("")
  const photoInputRef = useRef<HTMLInputElement>(null)

  // Resume Document Upload State (.pdf, .doc, .docx)
  const [isParsingResume, setIsParsingResume] = useState(false)
  const resumeFileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPhotoUrl(result)
      toast({
        title: "Photo Uploaded! 📸",
        description: "Your photo will display in photo-enabled templates."
      })
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setPhotoUrl("")
    if (photoInputRef.current) {
      photoInputRef.current.value = ""
    }
    toast({
      title: "Photo Removed",
      description: "Profile photo removed from resume."
    })
  }

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

  // State to explicitly toggle Sample Preview
  const [isPreviewingSample, setIsPreviewingSample] = useState(false)

  // Cleaned and filtered user data
  const userSkillsCleaned = (skills || [])
    .map(c => ({
      category: (c.category || "").trim(),
      skills: (Array.isArray(c.skills) ? c.skills : []).map(s => String(s).trim()).filter(Boolean)
    }))
    .filter(c => c.category && c.skills.length > 0)

  const hasUserSkills = userSkillsCleaned.length > 0
  const userJobsFilled = jobs.filter(j => (j.company && j.company.trim().length > 0) || (j.role && j.role.trim().length > 0))
  const userProjectsFilled = projects.filter(p => p.name && p.name.trim().length > 0)
  const userEducationFilled = education.filter(e => (e.institution && e.institution.trim().length > 0) || (e.degree && e.degree.trim().length > 0))
  const userAchievementsFilled = achievements.filter(a => a && a.trim().length > 0)
  const userLanguagesFilled = languages.filter(l => l && l.trim().length > 0)

  const hasUserData = Boolean(
    name.trim() ||
    role.trim() ||
    email.trim() ||
    phone.trim() ||
    location.trim() ||
    professionalSummary.trim() ||
    hasUserSkills ||
    userJobsFilled.length > 0 ||
    userProjectsFilled.length > 0 ||
    userEducationFilled.length > 0 ||
    userAchievementsFilled.length > 0 ||
    userLanguagesFilled.length > 0
  )

  // Effective data: When isPreviewingSample is true, display full DUMMY_RESUME_DATA.
  // When isPreviewingSample is false, display ONLY the user's actual entered data (no sample fallbacks).
  const effectiveName = isPreviewingSample
    ? DUMMY_RESUME_DATA.name
    : name.trim()

  const effectiveRole = isPreviewingSample
    ? DUMMY_RESUME_DATA.role
    : role.trim()

  const effectiveEmail = isPreviewingSample
    ? DUMMY_RESUME_DATA.contact.email
    : email.trim()

  const effectivePhone = isPreviewingSample
    ? DUMMY_RESUME_DATA.contact.phone
    : phone.trim()

  const effectiveLocation = isPreviewingSample
    ? DUMMY_RESUME_DATA.contact.location
    : location.trim()

  const effectiveLinkedin = isPreviewingSample
    ? DUMMY_RESUME_DATA.contact.linkedin
    : linkedinUrl.trim()

  const effectiveGithub = isPreviewingSample
    ? DUMMY_RESUME_DATA.contact.github
    : githubUrl.trim()

  const effectivePortfolio = isPreviewingSample
    ? DUMMY_RESUME_DATA.contact.portfolio
    : portfolioUrl.trim()

  const effectivePhotoUrl = photoUrl || (isPreviewingSample ? DUMMY_RESUME_DATA.photoUrl : undefined)

  const effectiveSummary = isPreviewingSample
    ? DUMMY_RESUME_DATA.summary
    : professionalSummary.trim()

  const effectiveSkills = isPreviewingSample
    ? DUMMY_RESUME_DATA.skills
    : userSkillsCleaned

  const effectiveJobs = isPreviewingSample
    ? DUMMY_FORM_JOBS
    : userJobsFilled

  const effectiveProjects = isPreviewingSample
    ? DUMMY_FORM_PROJECTS
    : userProjectsFilled

  const effectiveEducation = isPreviewingSample
    ? DUMMY_FORM_EDUCATION
    : userEducationFilled

  const effectiveAchievements = isPreviewingSample
    ? DUMMY_RESUME_DATA.achievements
    : userAchievementsFilled

  const effectiveLanguages = isPreviewingSample
    ? DUMMY_RESUME_DATA.languages
    : userLanguagesFilled

  const isDummyData = isPreviewingSample || !hasUserData

  const handleLoadSampleData = () => {
    setName(DUMMY_RESUME_DATA.name)
    setRole(DUMMY_RESUME_DATA.role)
    setEmail(DUMMY_RESUME_DATA.contact.email)
    setPhone(DUMMY_RESUME_DATA.contact.phone)
    setLocation(DUMMY_RESUME_DATA.contact.location)
    setLinkedinUrl(DUMMY_RESUME_DATA.contact.linkedin)
    setGithubUrl(DUMMY_RESUME_DATA.contact.github)
    setPortfolioUrl(DUMMY_RESUME_DATA.contact.portfolio)
    setProfessionalSummary(DUMMY_RESUME_DATA.summary)
    setSkills(DUMMY_RESUME_DATA.skills.map(s => ({ category: s.category, skills: [...s.skills] })))
    setLanguages([...DUMMY_RESUME_DATA.languages])
    setAchievements([...DUMMY_RESUME_DATA.achievements])
    setJobs(DUMMY_FORM_JOBS.map(j => ({ ...j, points: [...j.points] })))
    setProjects(DUMMY_FORM_PROJECTS.map(p => ({ ...p, points: [...p.points] })))
    setEducation(DUMMY_FORM_EDUCATION.map(e => ({ ...e })))
    setIsPreviewingSample(false)
    toast({
      title: "Sample Data Loaded! 📋",
      description: "Sample resume details have been loaded into the editor.",
    })
  }

  const handleClearForm = () => {
    setName("")
    setRole("")
    setEmail("")
    setPhone("")
    setLocation("")
    setLinkedinUrl("")
    setGithubUrl("")
    setPortfolioUrl("")
    setPhotoUrl("")
    setProfessionalSummary("")
    setSkills([
      { category: "Languages", skills: [""] },
      { category: "Frameworks/Libraries", skills: [""] },
      { category: "Databases", skills: [""] },
      { category: "Tools/DevOps", skills: [""] }
    ])
    setJobs([{ company: "", role: "", startDate: "", endDate: "", location: "", points: [""], currentlyWorkHere: false }])
    setProjects([{ name: "", techStack: "", projectLink: "", points: [""] }])
    setEducation([{ institution: "", degree: "", fieldOfStudy: "", year: "", grade: "" }])
    setAchievements([""])
    setLanguages([""])
    setGeneratedResume(null)
    setIsPreviewingSample(false)
    toast({
      title: "Form Cleared",
      description: "All fields have been cleared.",
    })
  }

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
        if (data.styleConfig !== undefined) setStyleConfig(data.styleConfig)
        if (data.name !== undefined) setName(data.name)
        if (data.role !== undefined) setRole(data.role)
        if (data.email !== undefined) setEmail(data.email)
        if (data.phone !== undefined) setPhone(data.phone)
        if (data.linkedinUrl !== undefined) setLinkedinUrl(data.linkedinUrl)
        if (data.githubUrl !== undefined) setGithubUrl(data.githubUrl)
        if (data.portfolioUrl !== undefined) setPortfolioUrl(data.portfolioUrl)
        if (data.location !== undefined) setLocation(data.location)
        if (data.photoUrl !== undefined) setPhotoUrl(data.photoUrl)
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
        styleConfig,
        name,
        role,
        email,
        phone,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        location,
        photoUrl,
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
    styleConfig,
    name,
    role,
    email,
    phone,
    linkedinUrl,
    githubUrl,
    portfolioUrl,
    location,
    photoUrl,
    skills,
    professionalSummary,
    languages,
    achievements,
    jobs,
    projects,
    education,
    generatedResume
  ])

  // Populate form fields from uploaded & parsed resume document (PDF or Word)
  const populateFromParsedResume = (data: any, originalFileName?: string) => {
    if (!data) return

    if (data.name) setName(data.name)
    if (data.role) setRole(data.role)
    if (data.email) setEmail(data.email)
    if (data.phone) setPhone(data.phone)
    if (data.location) setLocation(data.location)
    if (data.linkedinUrl) setLinkedinUrl(data.linkedinUrl)
    if (data.githubUrl) setGithubUrl(data.githubUrl)
    if (data.portfolioUrl) setPortfolioUrl(data.portfolioUrl)
    if (data.summary) setProfessionalSummary(data.summary)

    // Map domain to templateType if relevant
    if (data.domain) {
      const d = String(data.domain).toLowerCase()
      if (d.includes("product")) {
        setTemplateType("Product Manager")
      } else if (d.includes("software") || d.includes("engineer") || d.includes("developer")) {
        setTemplateType("Software Engineer")
      } else if (d.includes("fresher") || d.includes("entry") || d.includes("student")) {
        setTemplateType("Fresher")
      } else if (d.includes("lead") || d.includes("manager") || d.includes("senior") || d.includes("architect")) {
        setTemplateType("Experienced")
      }
    }

    // Populate Experience
    if (Array.isArray(data.experience) && data.experience.length > 0) {
      setJobs(data.experience.map((exp: any) => {
        let points: string[] = []
        if (Array.isArray(exp.bullets) && exp.bullets.length > 0) {
          points = exp.bullets.filter(Boolean)
        } else if (exp.description) {
          points = String(exp.description)
            .split(/\r?\n/)
            .map(s => s.replace(/^[•\-\*]\s*/, '').trim())
            .filter(Boolean)
        }
        if (points.length === 0) points = [""]

        return {
          company: exp.company || "",
          role: exp.title || exp.role || "",
          startDate: normalizeMonthInput(exp.startDate || ""),
          endDate: (exp.isCurrent || exp.is_current) ? "" : normalizeMonthInput(exp.endDate || ""),
          location: exp.location || "",
          points: points,
          currentlyWorkHere: Boolean(exp.isCurrent || exp.is_current)
        }
      }))
    }

    // Populate Projects
    if (Array.isArray(data.projects) && data.projects.length > 0) {
      setProjects(data.projects.map((proj: any) => {
        let points: string[] = []
        if (Array.isArray(proj.bullets) && proj.bullets.length > 0) {
          points = proj.bullets.filter(Boolean)
        } else if (proj.description) {
          points = String(proj.description)
            .split(/\r?\n/)
            .map(s => s.replace(/^[•\-\*]\s*/, '').trim())
            .filter(Boolean)
        }
        if (points.length === 0) points = [""]

        return {
          name: proj.name || "",
          techStack: proj.techStack || proj.technologies || "",
          projectLink: proj.url || proj.projectLink || "",
          points: points
        }
      }))
    }

    // Populate Education
    if (Array.isArray(data.education) && data.education.length > 0) {
      setEducation(data.education.map((edu: any) => {
        let yr = ""
        const sDate = (edu.startDate || "").substring(0, 4)
        const eDate = (edu.isCurrent || edu.is_current) ? "Present" : (edu.endDate || "").substring(0, 4)
        if (sDate && eDate) {
          yr = `${sDate} - ${eDate}`
        } else if (eDate) {
          yr = eDate
        } else if (sDate) {
          yr = sDate
        }
        return {
          institution: edu.institution || edu.school || "",
          degree: edu.degree || "",
          fieldOfStudy: edu.fieldOfStudy || edu.field_of_study || "",
          year: yr,
          grade: edu.grade || ""
        }
      }))
    }

    // Populate Skills
    if (Array.isArray(data.skillCategories) && data.skillCategories.length > 0) {
      setSkills(normalizeSkills(data.skillCategories))
    } else if (Array.isArray(data.skills) && data.skills.length > 0) {
      setSkills(normalizeSkills(data.skills))
    }

    // Populate Languages
    if (Array.isArray(data.languages) && data.languages.length > 0) {
      const validLangs = data.languages.filter(Boolean)
      if (validLangs.length > 0) {
        setLanguages(validLangs)
      }
    }

    // Populate Achievements & Certifications
    const fetchedItems: string[] = []
    if (Array.isArray(data.achievements)) {
      data.achievements.forEach((a: any) => {
        if (typeof a === 'string' && a.trim()) fetchedItems.push(a.trim())
      })
    }
    if (Array.isArray(data.certifications)) {
      data.certifications.forEach((c: any) => {
        if (typeof c === 'string' && c.trim()) fetchedItems.push(c.trim())
      })
    }
    if (fetchedItems.length > 0) {
      setAchievements(Array.from(new Set(fetchedItems)))
    }

    // Update draft title from filename if still default
    if (originalFileName && (!draftTitle || draftTitle === "My Resume")) {
      const cleanTitle = originalFileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")
      if (cleanTitle) setDraftTitle(cleanTitle)
    }
  }

  // Handle file input change for Resume Document upload (.pdf, .doc, .docx)
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!['pdf', 'docx', 'doc'].includes(ext)) {
      toast({
        title: "Unsupported File Format",
        description: "Please select a PDF (.pdf) or Word document (.docx, .doc).",
        variant: "destructive"
      })
      if (e.target) e.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a resume file smaller than 5MB.",
        variant: "destructive"
      })
      if (e.target) e.target.value = ""
      return
    }

    setIsParsingResume(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || `Server responded with ${res.status}`)
      }

      const parsedData = await res.json()
      populateFromParsedResume(parsedData, file.name)

      toast({
        title: "Resume Uploaded & Parsed! ✨",
        description: `Successfully loaded data from "${file.name}". All fields have been populated.`
      })
    } catch (err: any) {
      console.error("Error parsing resume document:", err)
      toast({
        title: "Could Not Extract All Data",
        description: err.message || "Failed to extract text from document. You can still fill fields manually.",
        variant: "destructive"
      })
    } finally {
      setIsParsingResume(false)
      if (e.target) e.target.value = ""
    }
  }

  // Populate form fields from user profile
  const populateFromUserProfile = (usr: any) => {
    if (!usr) return

    setName(usr.name || "")
    setRole(usr.headline || "")
    setEmail(usr.email || "")
    setPhone(usr.phone || "")
    setLinkedinUrl(usr.linkedinUrl || "")
    setGithubUrl(usr.githubUrl || "")
    setPortfolioUrl(usr.portfolioUrl || "")

    const formattedLoc = [usr.currentCity, usr.state, usr.country]
      .filter(Boolean)
      .join(", ") || usr.location || ""
    setLocation(formattedLoc)

    const userPhoto = usr.profilePhotoUrl || usr.photoUrl || usr.avatar || usr.profilePhoto || usr.image || usr.profile_photo_url || usr.metadata?.avatar_url || usr.metadata?.picture || ""
    if (userPhoto) {
      setPhotoUrl(userPhoto)
    }

    if (usr.summary) {
      setProfessionalSummary(usr.summary)
    }

    // Populate Experience
    if (usr.experience && Array.isArray(usr.experience) && usr.experience.length > 0) {
      setJobs(usr.experience.map((exp: any) => ({
        company: exp.company || "",
        role: exp.title || exp.role || "",
        startDate: normalizeMonthInput(exp.startDate || exp.start_date || ""),
        endDate: (exp.isCurrent || exp.is_current) ? "" : normalizeMonthInput(exp.endDate || exp.end_date || ""),
        location: exp.location || "",
        points: exp.description ? exp.description.split('\n').filter(Boolean) : [""],
        currentlyWorkHere: Boolean(exp.isCurrent || exp.is_current)
      })))
    }

    // Populate Projects
    if (usr.projects && Array.isArray(usr.projects) && usr.projects.length > 0) {
      setProjects(usr.projects.map((proj: any) => ({
        name: proj.name || "",
        techStack: proj.techStack || proj.tech_stack || "",
        projectLink: proj.url || proj.projectLink || proj.project_link || "",
        points: proj.description ? proj.description.split('\n').filter(Boolean) : [""]
      })))
    }

    // Populate Education
    if (usr.education && Array.isArray(usr.education) && usr.education.length > 0) {
      setEducation(usr.education.map((edu: any) => {
        let yr = ""
        const sDate = (edu.startDate || edu.start_date || "").substring(0, 4)
        const eDate = (edu.isCurrent || edu.is_current) ? "Present" : (edu.endDate || edu.end_date || "").substring(0, 4)
        if (sDate || eDate) {
          yr = sDate ? `${sDate} - ${eDate}` : eDate
        }
        return {
          institution: edu.institution || edu.school || "",
          degree: edu.degree || "",
          fieldOfStudy: edu.fieldOfStudy || edu.field_of_study || "",
          year: yr,
          grade: edu.grade || ""
        }
      }))
    }

    // Populate Skills
    if (usr.skills && Array.isArray(usr.skills) && usr.skills.length > 0) {
      const skillNames = usr.skills.map((s: any) => typeof s === 'string' ? s : s.name).filter(Boolean)
      if (skillNames.length > 0) {
        setSkills(normalizeSkills(skillNames))
      }
    }

    // Populate Languages
    if (usr.languages && Array.isArray(usr.languages) && usr.languages.length > 0) {
      const langNames = usr.languages.map((l: any) => typeof l === 'string' ? l : l.language || l.name).filter(Boolean)
      if (langNames.length > 0) {
        setLanguages(langNames)
      }
    }

    // Populate Achievements & Certifications
    const fetchedItems: string[] = []

    // 1. From Achievements
    const rawAchievements = usr.achievements || usr.jobseeker_achievements || usr.metadata?.achievements
    if (rawAchievements && Array.isArray(rawAchievements) && rawAchievements.length > 0) {
      rawAchievements.forEach((a: any) => {
        if (typeof a === 'string' && a.trim()) {
          fetchedItems.push(a.trim())
        } else if (a && typeof a === 'object') {
          const title = a.title || a.name || a.description || ""
          const issuer = a.issuer || a.organization || ""
          const dateAchieved = a.dateAchieved || a.date_achieved || a.year || ""
          let combined = title
          if (title && issuer) {
            combined = `${title} — ${issuer}`
          } else if (!title && issuer) {
            combined = issuer
          }
          if (combined && dateAchieved) {
            combined = `${combined} (${dateAchieved})`
          }
          if (combined && combined.trim()) {
            fetchedItems.push(combined.trim())
          }
        }
      })
    }

    // 2. From Certifications
    const rawCertifications = usr.certifications || usr.jobseeker_certifications || usr.metadata?.certifications
    if (rawCertifications && Array.isArray(rawCertifications) && rawCertifications.length > 0) {
      rawCertifications.forEach((c: any) => {
        if (typeof c === 'string' && c.trim()) {
          fetchedItems.push(c.trim())
        } else if (c && typeof c === 'object') {
          const certTitle = c.name || c.title || c.certificateName || c.certification_name || ""
          const issuer = c.issuingOrganization || c.issuer || c.organization || c.issuing_organization || ""
          const issueDate = c.issueDate || c.issue_date || c.year || ""
          let combined = certTitle
          if (certTitle && issuer) {
            combined = `${certTitle} — ${issuer}`
          } else if (!certTitle && issuer) {
            combined = issuer
          }
          if (combined && issueDate) {
            combined = `${combined} (${issueDate})`
          }
          if (combined && combined.trim()) {
            fetchedItems.push(combined.trim())
          }
        }
      })
    }

    if (fetchedItems.length > 0) {
      const uniqueItems = Array.from(new Set(fetchedItems))
      setAchievements(uniqueItems)
    }
  }

  // Set initial contact and profile details from user profile
  useEffect(() => {
    if (user && selectedDraftId === 'new') {
      const userPhoto = user.profilePhotoUrl || (user as any).photoUrl || (user as any).avatar || (user as any).profilePhoto || (user as any).image || (user as any).profile_photo_url || user.metadata?.avatar_url || user.metadata?.picture || ""
      const savedWip = localStorage.getItem("jobsdart_resume_builder_wip")
      if (savedWip) {
        try {
          const parsed = JSON.parse(savedWip)
          if (parsed.name || parsed.email || parsed.phone) {
            // If WIP has no photo but user profile has one, use the profile image
            if (!parsed.photoUrl && userPhoto) {
              setPhotoUrl(userPhoto)
            }
            return
          }
        } catch (e) {
          console.error("Error parsing WIP during profile initialization:", e)
        }
      }

      populateFromUserProfile(user)
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
      // Reset form states and populate from user profile
      setDraftTitle("My Resume")
      setTemplateType("Software Engineer")
      if (user) {
        populateFromUserProfile(user)
      } else {
        setName("")
        setRole("")
        setEmail("")
        setPhone("")
        setLinkedinUrl("")
        setGithubUrl("")
        setPortfolioUrl("")
        setLocation("")
        setPhotoUrl("")
        setProfessionalSummary("")
        setLanguages([""])
        setAchievements([""])
        setJobs([{ company: "", role: "", startDate: "", endDate: "", location: "", points: [""], currentlyWorkHere: false }])
        setProjects([{ name: "", techStack: "", points: [""] }])
        setEducation([{ institution: "", degree: "", fieldOfStudy: "", year: "", grade: "" }])
      }
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
    setPhotoUrl(data.photoUrl || data.contact?.photoUrl || "")
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
          startDate: normalizeMonthInput(startDate) || startDate,
          endDate: normalizeMonthInput(endDate) || endDate,
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
    if (data.styleConfig) {
      setStyleConfig(data.styleConfig)
    } else {
      setStyleConfig({})
    }
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
      // Prepare payload to save in database without image data
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
          dates: formatExperienceDateRange(j.startDate, j.endDate, j.currentlyWorkHere),
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
        styleConfig: Object.keys(styleConfig).length > 0 ? styleConfig : undefined,
        isGenerated: !!generatedResume,
        referralCard: generatedResume?.referralCard
      }

      const effectiveTitle = (name && name.trim()) ? `${name.trim()}'s Resume` : (draftTitle || 'My Resume')

      const res = await fetch('/api/resume/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedDraftId === 'new' ? undefined : selectedDraftId,
          userId: user.uuid,
          title: effectiveTitle,
          templateType,
          resumeData: resumePayload
        })
      })

      if (!res.ok) {
        throw new Error("Failed to save draft to database.")
      }

      const savedData = await res.json()
      toast({ title: "Resume Saved! 💾", description: `"${effectiveTitle}" saved successfully.` })

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
        startDate: formatMonthYear(j.startDate),
        endDate: j.currentlyWorkHere ? "Present" : formatMonthYear(j.endDate),
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
        if (response.status === 402 || errData.code === "INSUFFICIENT_CREDITS") {
          toast({
            title: "Insufficient Credits 💳",
            description: errData.error || "You need at least 2 credits to generate an ATS resume with AI.",
            variant: "destructive"
          })
          router.push("/jobseeker/credits")
          return
        }
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
            startDate: normalizeMonthInput(startDate) || startDate,
            endDate: normalizeMonthInput(endDate) || endDate,
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
      if (data._isFirstTime || isFirstTimeResumeBuilder) {
        toast({ title: "Resume Generated! ✨ (Free Trial)", description: "Your ATS-safe resume is ready to preview or download as PDF." })
      } else {
        toast({ title: "Resume Generated! ✨ (2 Credits Used)", description: "Your ATS-safe resume is ready to preview or download as PDF." })
      }
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

    if (!isFirstTimeResumeBuilder && userTotalCredits < 2) {
      toast({
        title: "Insufficient Credits 💳",
        description: "You need at least 2 credits to generate an ATS resume with AI. Please purchase credits to proceed.",
        variant: "destructive"
      })
      router.push("/jobseeker/credits")
      return
    }

    // If using credits (not first-time free trial), ask for confirmation in a popup
    if (!isFirstTimeResumeBuilder) {
      setShowCreditConfirmDialog(true)
      return
    }

    await executeGenerate()
  }

  const handleConfirmCreditDeduction = async () => {
    setShowCreditConfirmDialog(false)
    await executeGenerate()
  }

  const handleDownloadPdf = async () => {
    if (!user) {
      toast({
        title: "Login Required 🔒",
        description: "Please sign in to your account to download your resume PDF."
      })
      router.push("/login?redirect=/resume-builder")
      return
    }

    // If candidate is previewing dummy/sample data, allow free download without credit deduction!
    if (isDummyData) {
      await executeDownloadPdf()
      return
    }

    if (userTotalCredits < 1) {
      toast({
        title: "Insufficient Credits 💳",
        description: "You need at least 1 credit to download your resume. Please purchase credits to proceed.",
        variant: "destructive"
      })
      router.push("/jobseeker/credits")
      return
    }

    setShowDownloadConfirmDialog(true)
  }

  const handleConfirmDownload = async () => {
    setShowDownloadConfirmDialog(false)
    await executeDownloadPdf()
  }

  const executeDownloadPdf = async () => {
    if (!user) {
      toast({
        title: "Login Required 🔒",
        description: "Please sign in to your account to download your resume PDF."
      })
      router.push("/login?redirect=/resume-builder")
      return
    }

    // Construct current state snapshot of candidate data (using effective data if not present)
    const currentResumeData = {
      name: effectiveName,
      role: effectiveRole,
      photoUrl: effectivePhotoUrl,
      contact: {
        email: effectiveEmail,
        phone: effectivePhone,
        linkedin: effectiveLinkedin,
        github: effectiveGithub,
        portfolio: effectivePortfolio,
        location: effectiveLocation,
        photoUrl: effectivePhotoUrl
      },
      summary: effectiveSummary,
      skills: (effectiveSkills as any).map((cat: any) => ({
        category: (cat.category || "").trim(),
        skills: (Array.isArray(cat.skills) ? cat.skills : []).map((s: any) => String(s).trim()).filter(Boolean)
      })).filter((cat: any) => cat.category || cat.skills.length > 0),
      languages: effectiveLanguages.map(l => l.trim()).filter(Boolean),
      achievements: effectiveAchievements.map(a => a.trim()).filter(Boolean),
      experience: effectiveJobs.map(j => ({
        company: j.company || "",
        role: j.role || "",
        dates: (j as any).dates || formatExperienceDateRange(j.startDate, j.endDate, j.currentlyWorkHere),
        location: j.location || "",
        bullets: (j as any).bullets || (j.points ? j.points.filter(Boolean) : [])
      })),
      projects: effectiveProjects.map(p => ({
        name: p.name || "",
        techStack: p.techStack || "",
        projectLink: p.projectLink || "",
        bullets: (p as any).bullets || (p.points ? p.points.filter(Boolean) : [])
      })),
      education: effectiveEducation.map(e => ({
        institution: e.institution || "",
        degree: e.degree || "",
        fieldOfStudy: e.fieldOfStudy || "",
        dates: (e as any).dates || e.year || "",
        grade: e.grade || ""
      }))
    }

    setIsDownloadingPdf(true)
    try {
      const response = await fetch('/api/resume/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: currentResumeData,
          template: visualTemplate,
          styleConfig: (styleConfig.fontFamily || styleConfig.fontSizeScale || styleConfig.primaryColor || styleConfig.textColor) ? styleConfig : undefined,
          userId: user.uuid,
          isDummy: isDummyData
        })
      })

      if (!response.ok) {
        if (response.status === 402) {
          const errData = await response.json().catch(() => ({}))
          toast({
            title: "Insufficient Credits 💳",
            description: errData.error || "You need at least 1 credit to download your resume. Please purchase credits to proceed.",
            variant: "destructive"
          })
          router.push("/jobseeker/credits")
          return
        }
        throw new Error('Failed to render PDF on server')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const candidateName = (currentResumeData.name && currentResumeData.name.trim() && currentResumeData.name !== "Your Name")
        ? currentResumeData.name.trim()
        : (name && name.trim() && name.trim() !== "Your Name")
          ? name.trim()
          : "Resume"
      const cleanFileName = candidateName.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "_")
      link.download = `${cleanFileName}.pdf`
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      if (isDummyData) {
        toast({
          title: "Sample PDF Saved! 📄 (Free)",
          description: "Your sample resume PDF has been downloaded without using any credits."
        })
      } else {
        toast({
          title: "PDF Saved! 📄 (1 Credit Used)",
          description: "Your ATS-safe resume PDF has been downloaded."
        })
        await refreshUser()
      }
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

  return (
    <div className={`container max-w-7xl px-4 ${!showPromo ? "pt-6" : ""}`} style={{ paddingBottom: "3rem" }}>
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

      {/* ── Hero ── */}
      {showPromo && (
        <div className="pt-8 pb-10 sm:pt-10 sm:pb-12 text-center print:hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-slate-900 dark:text-white">
              Build Your Perfect{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                Resume.
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Fill in your details, let our AI generate polished bullet points, score your ATS compatibility, and export a recruiter-ready PDF — all in one place.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-2">
              {[
                { value: "Free", label: "First Resume" },
                { value: "1 min", label: "To Generate" },
                { value: "PDF", label: "ATS-Safe Export" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toolbar: Draft Naming & Saving Options */}
      <div className="mb-6 p-3 sm:p-4 bg-white/60 dark:bg-slate-900/50 backdrop-blur border border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 shadow-sm print:hidden">
        {/* Left Side: Version selector & Template picker */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Version Selector */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">Version:</span>
            <Select value={selectedDraftId} onValueChange={handleLoadDraft}>
              <SelectTrigger className="flex-1 sm:w-[180px] h-9 rounded-xl border-slate-250 text-xs font-semibold bg-slate-50/50">
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
            {selectedDraftId !== 'new' && (
              <Button
                variant="ghost"
                size="icon"
                className="text-rose-500 hover:bg-rose-50 h-8 w-8 rounded-lg shrink-0"
                onClick={handleDeleteDraft}
                title="Delete this version"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="hidden sm:block h-5 w-px bg-slate-200/80 dark:bg-slate-800/80" />

          {/* Design Layout Picker & Styling Buttons */}
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
            <Button
              type="button"
              variant={showTemplatePicker ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowTemplatePicker(prev => !prev)
                if (!showTemplatePicker) setShowStylingPicker(false)
              }}
              className={`flex-1 sm:flex-none h-9 rounded-xl border-slate-250 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all ${
                showTemplatePicker
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none"
                  : "bg-slate-50/50 hover:bg-slate-100 text-slate-700 dark:text-slate-200"
              }`}
            >
              <Palette className={`w-3.5 h-3.5 ${showTemplatePicker ? "text-white" : "text-indigo-500"}`} />
              <span>Choose Template</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showTemplatePicker ? "rotate-180" : ""}`} />
            </Button>

            <Button
              type="button"
              variant={showStylingPicker ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowStylingPicker(prev => !prev)
                if (!showStylingPicker) setShowTemplatePicker(false)
              }}
              className={`flex-1 sm:flex-none h-9 rounded-xl border-slate-250 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all ${
                showStylingPicker
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none"
                  : "bg-slate-50/50 hover:bg-slate-100 text-slate-700 dark:text-slate-200"
              }`}
            >
              <Sliders className={`w-3.5 h-3.5 ${showStylingPicker ? "text-white" : "text-indigo-500"}`} />
              <span>Font & Styling</span>
              {(styleConfig.fontFamily || styleConfig.fontSizeScale || styleConfig.primaryColor || styleConfig.textColor) && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Custom styles active" />
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showStylingPicker ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Right Side: Upload Resume + Sync from Profile + Draft Name + Save Version */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 justify-stretch sm:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-200/50 dark:border-slate-800/50">
          <input
            ref={resumeFileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleResumeUpload}
          />
          <Button
            size="sm"
            variant="outline"
            type="button"
            disabled={isParsingResume}
            onClick={() => resumeFileInputRef.current?.click()}
            className="w-full sm:w-auto border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold h-9 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shrink-0 transition-colors"
            title="Upload your resume in PDF or Word (.docx, .doc) format"
          >
            {isParsingResume ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{isParsingResume ? "Extracting Data..." : "Upload & Auto-fill"}</span>
          </Button>

          {mounted && user && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                populateFromUserProfile(user)
                toast({ title: "Profile Auto-Filled!", description: "All experience, projects, education, summary & skills imported from your profile." })
              }}
              className="w-full sm:w-auto border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 font-bold h-9 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shrink-0"
            >
              Sync from Profile
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSaveDraft}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shrink-0"
            disabled={isSavingDraft}
          >
            {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
            Save
          </Button>
        </div>
      </div>

      {/* Choose Template - Scrollable Row Section below Save Button & Toolbar */}
      <AnimatePresence>
        {showTemplatePicker && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mb-6 overflow-hidden print:hidden"
          >
            <div className="p-4 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              {/* Drawer Toolbar & Category Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 px-1">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {[
                    { id: 'all', label: 'All Templates', count: TEMPLATES.length },
                    { id: 'ats', label: '🎯 100% ATS', count: TEMPLATES.filter(t => t.category === 'ats').length },
                    { id: 'tech', label: '💻 Tech & FAANG', count: TEMPLATES.filter(t => t.category === 'tech').length },
                    { id: 'executive', label: '👔 Executive', count: TEMPLATES.filter(t => t.category === 'executive').length },
                    { id: 'photo', label: '📸 With Photo', count: TEMPLATES.filter(t => t.category === 'photo').length },
                    { id: 'creative', label: '🎨 Creative', count: TEMPLATES.filter(t => t.category === 'creative').length },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTemplateCategory(cat.id as any)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
                        templateCategory === cat.id
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {cat.label} ({cat.count})
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => scrollTemplates('left')}
                    className="h-7 w-7 rounded-lg border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    title="Scroll left"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => scrollTemplates('right')}
                    className="h-7 w-7 rounded-lg border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    title="Scroll right"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTemplatePicker(false)}
                    className="h-7 px-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg ml-1"
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Close
                  </Button>
                </div>
              </div>

              {/* Horizontally scrollable row of template cards */}
              <div
                ref={templateScrollRef}
                className="flex gap-3.5 overflow-x-auto pb-2 pt-1 px-1 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700"
              >
                {TEMPLATES.filter(t => templateCategory === 'all' || t.category === templateCategory).map((tmpl) => {
                  const isSelected = visualTemplate === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        setVisualTemplate(tmpl.id);
                        toast({ title: "Template Selected", description: `Switched to ${tmpl.name}` });
                      }}
                      className={`group relative rounded-xl border p-2.5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between shrink-0 w-[200px] sm:w-[220px] ${
                        isSelected
                          ? "border-indigo-600 ring-2 ring-indigo-600/30 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <div className="mb-2 overflow-hidden rounded-lg">
                        {tmpl.renderThumbnail({ name: effectiveName, role: effectiveRole, photoUrl: effectivePhotoUrl })}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mr-1">
                            {tmpl.name}
                          </h4>
                          <div className="flex items-center gap-1 shrink-0">
                            {tmpl.badge && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                                tmpl.badge === "100% ATS" || tmpl.badge === "Ivy League" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                                tmpl.badge === "FAANG Pick" ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" :
                                "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              }`}>
                                {tmpl.badge}
                              </span>
                            )}
                            {isSelected && (
                              <Badge className="bg-indigo-600 text-white text-[9px] h-4 px-1.5 font-bold shrink-0">
                                Active
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 leading-tight mb-2">
                          <span className="line-clamp-1 flex-1 mr-1">{tmpl.description}</span>
                          {tmpl.atsScore && (
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                              ATS {tmpl.atsScore}%
                            </span>
                          )}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          className={`w-full h-7 text-[11px] font-bold rounded-lg transition-all ${
                            isSelected
                              ? "bg-indigo-600 text-white hover:bg-indigo-700"
                              : "hover:border-indigo-200 hover:bg-indigo-50/50 text-slate-700 dark:text-slate-200"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setVisualTemplate(tmpl.id);
                            toast({ title: "Template Selected ✨", description: `Switched to ${tmpl.name}` });
                          }}
                        >
                          {isSelected ? "✓ Active" : "Use Template"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Font & Styling - Expandable Drawer Section below Save Button & Toolbar */}
      <AnimatePresence>
        {showStylingPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mb-6 overflow-hidden print:hidden"
          >
            <div className="p-4 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/80 pb-2.5 mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase">
                    Font & Visual Styling
                  </span>
                  {(styleConfig.fontFamily || styleConfig.fontSizeScale || styleConfig.primaryColor || styleConfig.textColor) && (
                    <Badge variant="secondary" className="text-[10px] bg-indigo-100/70 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold px-2 py-0 border-indigo-200 dark:border-indigo-800">
                      Active Overrides
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {(styleConfig.fontFamily || styleConfig.fontSizeScale || styleConfig.primaryColor || styleConfig.textColor) && (
                    <button
                      type="button"
                      onClick={() => setStyleConfig({})}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer mr-2"
                      title="Reset styling to current template defaults"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Defaults
                    </button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStylingPicker(false)}
                    className="h-7 px-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg ml-1"
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Close
                  </Button>
                </div>
              </div>

              {/* Controls Layout with Dropdown Selects */}
              {(() => {
                const defaultFont = (visualTemplate === 'classic-serif' || visualTemplate === 'ats-ivy-league') ? 'serif' : (visualTemplate === 'ats-clean') ? 'mono' : 'sans';
                const defaultDensity = (visualTemplate === 'compact-tech' || visualTemplate === 'ats-compact-onepage') ? 'compact' : 'normal';
                const defaultPrimaryColor = (visualTemplate === 'ats-emerald-professional') ? '#047857' : (visualTemplate === 'ats-tech-faang') ? '#2563eb' : (visualTemplate === 'ats-executive-modern') ? '#1e293b' : (visualTemplate === 'executive-navy' || visualTemplate === 'photo-executive') ? '#1e3a8a' : (visualTemplate === 'creative-bold' || visualTemplate === 'photo-creative') ? '#4f46e5' : '#0f172a';
                const defaultTextColor = (visualTemplate === 'classic-serif' || visualTemplate === 'ats-ivy-league') ? '#000000' : '#0f172a';

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end px-1 pt-1">
                    {/* 1. Font Family Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Type className="w-3.5 h-3.5 text-indigo-500" />
                        Font Family
                      </label>
                      <Select
                        value={styleConfig.fontFamily || defaultFont}
                        onValueChange={(val) => setStyleConfig(prev => ({ ...prev, fontFamily: val as any }))}
                      >
                        <SelectTrigger className="w-full h-9 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium shadow-xs">
                          <SelectValue placeholder="Select Font Family" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="sans" className="text-xs font-sans">
                            Modern Sans (Inter / Helvetica)
                          </SelectItem>
                          <SelectItem value="serif" className="text-xs font-serif">
                            Classic Serif (Times / Garamond)
                          </SelectItem>
                          <SelectItem value="mono" className="text-xs font-mono">
                            Clean Monospace (Courier / Code)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 2. Density / Scale Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                        Density / Scale
                      </label>
                      <Select
                        value={styleConfig.fontSizeScale || defaultDensity}
                        onValueChange={(val) => setStyleConfig(prev => ({ ...prev, fontSizeScale: val as any }))}
                      >
                        <SelectTrigger className="w-full h-9 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium shadow-xs">
                          <SelectValue placeholder="Select Density" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="compact" className="text-xs">
                            Compact (A- | High Density)
                          </SelectItem>
                          <SelectItem value="normal" className="text-xs">
                            Standard (A | Balanced Spacing)
                          </SelectItem>
                          <SelectItem value="spacious" className="text-xs">
                            Spacious (A+ | Relaxed Spacing)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 3. Accent & Headers Color Dropdown */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Palette className="w-3.5 h-3.5 text-indigo-500" />
                          Accent & Headers
                        </label>
                        <label
                          className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-indigo-600 dark:text-slate-400 cursor-pointer"
                          title="Pick custom hex color"
                        >
                          <input
                            type="color"
                            value={styleConfig.primaryColor || defaultPrimaryColor}
                            onChange={(e) => setStyleConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 cursor-pointer p-0 appearance-none bg-transparent"
                          />
                          <span>Custom</span>
                        </label>
                      </div>
                      <Select
                        value={styleConfig.primaryColor?.toLowerCase() || defaultPrimaryColor.toLowerCase()}
                        onValueChange={(val) => setStyleConfig(prev => ({ ...prev, primaryColor: val }))}
                      >
                        <SelectTrigger className="w-full h-9 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium shadow-xs">
                          <SelectValue placeholder="Select Accent Color" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="#0f172a" className="text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#0f172a]" />
                              <span>Dark Slate (#0f172a)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="#1e3a8a" className="text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#1e3a8a]" />
                              <span>Executive Navy (#1e3a8a)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="#4f46e5" className="text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#4f46e5]" />
                              <span>Electric Indigo (#4f46e5)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="#047857" className="text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#047857]" />
                              <span>Emerald Green (#047857)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="#881337" className="text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#881337]" />
                              <span>Burgundy Wine (#881337)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="#0284c7" className="text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#0284c7]" />
                              <span>Steel Blue (#0284c7)</span>
                            </div>
                          </SelectItem>
                          {styleConfig.primaryColor && !['#0f172a', '#1e3a8a', '#4f46e5', '#047857', '#881337', '#0284c7'].includes(styleConfig.primaryColor.toLowerCase()) && (
                            <SelectItem value={styleConfig.primaryColor.toLowerCase()} className="text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: styleConfig.primaryColor }} />
                                <span>Custom ({styleConfig.primaryColor})</span>
                              </div>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 4. Text Color Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        Text Color
                      </label>
                      <Select
                        value={styleConfig.textColor?.toLowerCase() || defaultTextColor.toLowerCase()}
                        onValueChange={(val) => setStyleConfig(prev => ({ ...prev, textColor: val }))}
                      >
                        <SelectTrigger className="w-full h-9 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium shadow-xs">
                          <SelectValue placeholder="Select Text Color" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="#000000" className="text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#000000] border border-black/20" />
                              <span>Deep Black (#000000)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="#0f172a" className="text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#0f172a]" />
                              <span>Dark Slate (#0f172a)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="#334155" className="text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#334155]" />
                              <span>Charcoal (#334155)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="#1e293b" className="text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#1e293b]" />
                              <span>Navy Slate (#1e293b)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          Preview
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Step-by-Step Editor Panel - Left Column */}
        <div className={`lg:col-span-5 space-y-4 print:hidden ${activeTab === "edit" ? "block" : "hidden lg:block"}`}>
          {/* Always-Visible Standalone Profile Photo Widget */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-800/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                )}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-indigo-500" />
                      Profile Photo
                    </span>
                    {photoUrl && (
                      <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Added
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => photoInputRef.current?.click()}
                      className="h-7 px-2.5 rounded-lg text-xs font-bold border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 shadow-xs"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      {photoUrl ? "Change Photo" : "Upload Photo"}
                    </Button>
                    {photoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePhoto}
                        className="h-7 px-2 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                  PNG, JPG or WEBP up to 5MB. Visible across all ATS &amp; visual templates.
                </p>
              </div>
            </div>
          </div>

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
                    <Input
                      type="tel"
                      inputMode="numeric"
                      maxLength={15}
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="rounded-xl h-9 text-xs"
                    />
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

          <div className="space-y-2">
            <Button
              className="w-full py-6 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI is Writing Your Resume...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
                  {isFirstTime ? "Generate with AI (Free 1st Time)" : "Generate with AI (2 Credits)"}
                  <ChevronRight className="w-5 h-5 ml-1" />
                </>
              )}
            </Button>

            {mounted && user && (
              <div className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 rounded-xl">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  Credits left: <strong className="text-slate-900 dark:text-white font-bold">{userTotalCredits} {userTotalCredits === 1 ? 'credit' : 'credits'}</strong>
                </span>
                {isFirstTime ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5">
                    1st Use Free
                  </Badge>
                ) : (
                  <Link href="/jobseeker/credits" className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    + Buy Credits
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Live Resume Preview - Right Column */}
        <div className={`lg:col-span-7 space-y-4 ${activeTab === "preview" ? "block" : "hidden lg:block"}`}>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  ATS Layout Preview
                </h2>
                {/* Segmented Mode Switch: My Resume vs Sample Preview */}
                <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setIsPreviewingSample(false)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      !isPreviewingSample
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-emerald-500" />
                    My Resume
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreviewingSample(true)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isPreviewingSample
                        ? "bg-amber-500 text-white shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Sample Preview
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {hasUserData && !isPreviewingSample && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-xl h-8 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1"
                    onClick={handleClearForm}
                    title="Clear all fields"
                  >
                    Clear Form
                  </Button>
                )}
                <Button
                  size="sm"
                  className="rounded-xl h-8 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1 shadow-sm"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  title={isDummyData ? "Download sample resume PDF (Free)" : "Download ATS resume PDF (Costs 1 credit)"}
                >
                  {isDownloadingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  {isDummyData ? "Save Sample PDF (Free)" : "Save PDF (1 Cr)"}
                </Button>
              </div>
            </div>
            {/* Helper style definitions based on visualTemplate and styleConfig */}
            {(() => {
              const isIvyLeague = visualTemplate === 'ats-ivy-league'
              const isTechFaang = visualTemplate === 'ats-tech-faang'
              const isExecModern = visualTemplate === 'ats-executive-modern'
              const isSwiss = visualTemplate === 'ats-modern-swiss'
              const isEmerald = visualTemplate === 'ats-emerald-professional'
              const isCompactOnePage = visualTemplate === 'ats-compact-onepage'

              const isSerif = visualTemplate === 'classic-serif' || isIvyLeague
              const isNavy = visualTemplate === 'executive-navy' || visualTemplate === 'photo-executive' || isExecModern
              const isCompact = visualTemplate === 'compact-tech' || isCompactOnePage
              const isMinimal = visualTemplate === 'modern-minimal' || visualTemplate === 'photo-minimal' || isSwiss
              const isTwoColumn = visualTemplate === 'two-column'
              const isCreative = visualTemplate === 'creative-bold' || visualTemplate === 'photo-creative'
              const isElegant = visualTemplate === 'elegant-sidebar'
              const isAtsClean = visualTemplate === 'ats-clean'
              const isPhotoSidebar = visualTemplate === 'photo-modern-sidebar'
              const isPhotoExec = visualTemplate === 'photo-executive'
              const isPhotoCreative = visualTemplate === 'photo-creative'
              const isPhotoMinimal = visualTemplate === 'photo-minimal'

              const previewFontClass = styleConfig.fontFamily === 'serif'
                ? "font-serif"
                : styleConfig.fontFamily === 'mono'
                ? "font-mono"
                : styleConfig.fontFamily === 'sans'
                ? "font-sans"
                : (isSerif ? "font-serif" : isAtsClean ? "font-mono" : "font-sans")

              const previewTextColor = styleConfig.textColor
                ? ""
                : (isEmerald
                  ? "text-slate-900 dark:text-slate-100"
                  : isMinimal || isElegant || isSwiss
                  ? "text-slate-700 dark:text-slate-300"
                  : "text-slate-950 dark:text-slate-100")

              const scale = styleConfig.fontSizeScale
              const isEffectiveCompact = scale === 'compact' || (!scale && isCompact)
              const isEffectiveSpacious = scale === 'spacious'

              const previewPadding = isEffectiveCompact ? "p-2.5 sm:p-5 md:p-6" : isEffectiveSpacious ? "p-3 sm:p-8 lg:p-14" : (isIvyLeague || isAtsClean ? "p-3 sm:p-6 md:p-8" : "p-3 sm:p-8 lg:p-12")
              const previewTextSize = isEffectiveCompact ? "text-[7.5px] sm:text-[10.5px]" : isEffectiveSpacious ? "text-[9.5px] sm:text-[13px]" : "text-[8.5px] sm:text-xs"
              const previewSectionTitleSize = isEffectiveCompact ? "text-[7.5px] sm:text-[9.5px] font-black uppercase tracking-wider" : isEffectiveSpacious ? "text-[9.5px] sm:text-sm font-black uppercase tracking-wider" : "text-[8.5px] sm:text-xs font-black uppercase tracking-wider"
              const previewHeadlineSize = isEffectiveCompact ? "text-[7px] sm:text-[9.5px]" : isEffectiveSpacious ? "text-[9px] sm:text-xs" : "text-[8px] sm:text-[11px]"
              const previewTitleSize = isEffectiveCompact ? "text-sm sm:text-xl md:text-2xl" : isEffectiveSpacious ? "text-lg sm:text-3xl md:text-4xl" : (isCreative ? "text-base sm:text-3xl md:text-4xl" : "text-base sm:text-2xl md:text-3xl")
              const previewSectionMargin = isEffectiveCompact ? "mb-1 sm:mb-1.5" : isEffectiveSpacious ? "mb-1.5 sm:mb-2.5" : ((isTwoColumn || isElegant || isPhotoSidebar) ? "mb-1 sm:mb-2" : "mb-1 sm:mb-2")
              const previewSectionHeaderMargin = isEffectiveCompact ? "mb-0.5" : isEffectiveSpacious ? "mb-0.5 sm:mb-1" : "mb-0.5 sm:mb-1"
              const previewSectionDividerColor = isEmerald
                ? "border-emerald-700 dark:border-emerald-500 border-b-2"
                : isTechFaang
                ? "border-blue-600 dark:border-blue-500 border-b-2"
                : isExecModern
                ? "border-slate-800 dark:border-slate-300 border-b-2"
                : isNavy
                ? "border-blue-900 dark:border-blue-800 border-b-2"
                : isSwiss
                ? "border-slate-300 dark:border-slate-700"
                : isMinimal
                ? "border-slate-200 dark:border-slate-800"
                : isAtsClean || isCreative
                ? "border-none"
                : "border-slate-900 dark:border-slate-100"
              const previewHeaderAlign = (isMinimal || isCompact || isCreative || isAtsClean || isTwoColumn || isElegant || isPhotoCreative || isPhotoMinimal || isTechFaang || isExecModern || isEmerald) ? "text-left" : "text-center"
              const previewContactJustify = (isMinimal || isCompact || isCreative || isAtsClean || isTwoColumn || isElegant || isPhotoCreative || isPhotoMinimal || isPhotoExec || isTechFaang || isExecModern || isEmerald) ? "justify-start" : "justify-center"

              const renderAvatar = (size = "w-14 h-14 sm:w-28 sm:h-28") => {
                if (!photoUrl) return null

                return (
                  <div className={`relative group/photo ${size} rounded-none overflow-hidden border-2 border-slate-900 dark:border-slate-100 shadow-sm shrink-0`}>
                    <img
                      src={photoUrl}
                      alt={effectiveName || "Candidate"}
                      className="w-full h-full object-cover rounded-none"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[8px] sm:text-[10px] font-bold gap-1 rounded-none print:hidden cursor-pointer"
                    >
                      <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Change
                    </button>
                  </div>
                )
              }

              const renderContactRow = () => (
                <div className={`text-[8px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium flex flex-wrap ${previewContactJustify} gap-x-1 sm:gap-x-3 gap-y-0.5 sm:gap-y-1 items-center`}>
                  {effectiveEmail && (
                    <a href={`mailto:${effectiveEmail.trim()}`} className="hover:underline break-all">
                      {effectiveEmail}
                    </a>
                  )}
                  {effectivePhone && (
                    <>
                      {effectiveEmail && <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>}
                      <span className="shrink-0">{effectivePhone}</span>
                    </>
                  )}
                  {effectiveLocation && (
                    <>
                      {(effectiveEmail || effectivePhone) && <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>}
                      <span className="break-words">{effectiveLocation}</span>
                    </>
                  )}
                  {effectiveLinkedin && (
                    <>
                      {(effectiveEmail || effectivePhone || effectiveLocation) && <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>}
                      <a href={formatUrl(effectiveLinkedin)} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold break-all">
                        LinkedIn
                      </a>
                    </>
                  )}
                  {effectiveGithub && (
                    <>
                      {(effectiveEmail || effectivePhone || effectiveLocation || effectiveLinkedin) && <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>}
                      <a href={formatUrl(effectiveGithub)} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold break-all">
                        GitHub
                      </a>
                    </>
                  )}
                  {effectivePortfolio && (
                    <>
                      {(effectiveEmail || effectivePhone || effectiveLocation || effectiveLinkedin || effectiveGithub) && <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>}
                      <a href={formatUrl(effectivePortfolio)} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold break-all">
                        Portfolio
                      </a>
                    </>
                  )}
                </div>
              )

              const renderContactColumn = () => (
                <div className="text-[7.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium flex flex-col gap-y-0.5 sm:gap-y-1 break-words">
                  {effectiveEmail && (
                    <a href={`mailto:${effectiveEmail.trim()}`} className="hover:underline break-all">
                      {effectiveEmail}
                    </a>
                  )}
                  {effectivePhone && <span className="break-all">{effectivePhone}</span>}
                  {effectiveLocation && <span className="break-words">{effectiveLocation}</span>}
                  {effectiveLinkedin && (
                    <a href={formatUrl(effectiveLinkedin)} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold break-all">
                      LinkedIn
                    </a>
                  )}
                  {effectiveGithub && (
                    <a href={formatUrl(effectiveGithub)} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold break-all">
                      GitHub
                    </a>
                  )}
                  {effectivePortfolio && (
                    <a href={formatUrl(effectivePortfolio)} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold break-all">
                      Portfolio
                    </a>
                  )}
                </div>
              )

              const getSectionHeadingClass = () => `${previewSectionTitleSize} ${
                styleConfig.primaryColor ? "" : (
                  isEmerald ? "text-emerald-800 dark:text-emerald-400" :
                  isTechFaang ? "text-blue-700 dark:text-blue-400" :
                  isExecModern ? "text-slate-900 dark:text-slate-200" :
                  isNavy ? "text-blue-900 dark:text-blue-400" :
                  isCreative ? "text-indigo-950 dark:text-indigo-300 border-l-2 sm:border-l-4 border-indigo-600 pl-1.5 sm:pl-2" :
                  isMinimal || isElegant || isSwiss ? "text-slate-700 dark:text-slate-400" :
                  "text-slate-905 dark:text-white"
                )
              } ${!isCreative && !isAtsClean ? (styleConfig.primaryColor ? "border-b" : "border-b " + previewSectionDividerColor) : (isCreative && styleConfig.primaryColor ? "border-l-2 sm:border-l-4 pl-1.5 sm:pl-2" : "")} pb-0.5 ${previewSectionHeaderMargin}`

              const getSectionHeadingStyle = () => {
                if (!styleConfig.primaryColor) return undefined
                return {
                  color: styleConfig.primaryColor,
                  borderColor: isAtsClean ? 'transparent' : styleConfig.primaryColor,
                  borderLeftColor: isCreative ? styleConfig.primaryColor : undefined,
                }
              }

              const renderPreviewSummary = () => effectiveSummary ? (
                <div className={previewSectionMargin}>
                  <h2 className={getSectionHeadingClass()} style={getSectionHeadingStyle()}>
                    Professional Summary
                  </h2>
                  <p className={`${previewTextSize} leading-tight sm:leading-relaxed ${previewTextColor} break-words`}>{effectiveSummary}</p>
                </div>
              ) : null

              const renderPreviewSkills = () => effectiveSkills && effectiveSkills.length > 0 ? (
                <div className={previewSectionMargin}>
                  <h2 className={getSectionHeadingClass()} style={getSectionHeadingStyle()}>
                    Skills & Tech Stack
                  </h2>
                  {typeof (effectiveSkills as any)[0] === 'string' ? (
                    <p className={`${previewTextSize} leading-tight sm:leading-relaxed ${previewTextColor} font-medium break-words`}>{(effectiveSkills as any).filter(Boolean).join(",  ")}</p>
                  ) : (
                    <div className={`${previewTextSize} leading-tight sm:leading-relaxed ${previewTextColor} font-medium space-y-0.5`}>
                      {(effectiveSkills as any).map((cat: any, idx: number) => {
                        const skillsList = Array.isArray(cat.skills) ? cat.skills.filter(Boolean) : [];
                        if (skillsList.length === 0) return null;
                        return (
                          <div key={idx} className="break-words">
                            <strong className={
                              styleConfig.primaryColor ? "" : (
                                isEmerald ? "text-emerald-800 dark:text-emerald-400" :
                                isTechFaang ? "text-blue-700 dark:text-blue-400" :
                                isExecModern ? "text-slate-900 dark:text-slate-200" :
                                isNavy ? "text-blue-900 dark:text-blue-400" :
                                isCreative ? "text-indigo-950 dark:text-indigo-300" :
                                isMinimal || isElegant || isSwiss ? "text-slate-800 dark:text-slate-200" :
                                "text-slate-950 dark:text-white"
                              )
                            } style={{ color: styleConfig.primaryColor || undefined }}>{cat.category}: </strong>
                            <span>{skillsList.join(",  ")}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null

              const renderPreviewExperience = () => effectiveJobs.filter(j => j.company || j.role).length > 0 ? (
                <div className={previewSectionMargin}>
                  <h2 className={getSectionHeadingClass()} style={getSectionHeadingStyle()}>
                    Experience
                  </h2>
                  <div className={isCompact ? "space-y-1 sm:space-y-2" : "space-y-1.5 sm:space-y-3.5"}>
                    {effectiveJobs.filter(j => j.company || j.role).map((job, idx) => (
                      <div key={idx}>
                        <div className={`flex flex-wrap items-baseline justify-between ${previewTextSize} font-bold ${
                          styleConfig.primaryColor ? "" : (
                            isEmerald ? "text-emerald-950 dark:text-emerald-200" :
                            isTechFaang ? "text-slate-950 dark:text-white" :
                            isExecModern ? "text-slate-950 dark:text-white" :
                            isNavy ? "text-blue-900 dark:text-blue-400" :
                            isCreative ? "text-slate-900 dark:text-white" :
                            isMinimal || isElegant || isSwiss ? "text-slate-800 dark:text-white" :
                            "text-slate-950 dark:text-white"
                          )
                        } mb-0.5 gap-x-1 gap-y-0.5`}>
                          <span className="break-words" style={{ color: styleConfig.primaryColor || undefined }}>{job.role || "Role"} — {job.company || "Company"}{job.location ? ` (${job.location})` : ""}</span>
                          <span className="font-semibold text-slate-500 dark:text-slate-400 text-[7.5px] sm:text-xs shrink-0">{formatExperienceDateRange(job.startDate, job.endDate, job.currentlyWorkHere)}</span>
                        </div>
                        {job.points && job.points.filter(Boolean).length > 0 && (
                          <ul className="list-disc pl-2.5 sm:pl-4 space-y-0.5">
                            {job.points.filter(Boolean).map((bullet, bIdx) => (
                              <li key={bIdx} className={`${previewTextSize} leading-tight sm:leading-relaxed ${previewTextColor} break-words`}>{renderRichText(bullet)}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null

              const renderPreviewProjects = () => effectiveProjects.filter(p => p.name).length > 0 ? (
                <div className={previewSectionMargin}>
                  <h2 className={getSectionHeadingClass()} style={getSectionHeadingStyle()}>
                    Projects
                  </h2>
                  <div className={isCompact ? "space-y-1 sm:space-y-2" : "space-y-1.5 sm:space-y-3.5"}>
                    {effectiveProjects.filter(p => p.name).map((proj, idx) => (
                      <div key={idx}>
                        <div className={`flex flex-wrap items-baseline justify-between ${previewTextSize} font-bold ${
                          styleConfig.primaryColor ? "" : (
                            isEmerald ? "text-emerald-950 dark:text-emerald-200" :
                            isTechFaang ? "text-slate-950 dark:text-white" :
                            isExecModern ? "text-slate-950 dark:text-white" :
                            isNavy ? "text-blue-900 dark:text-blue-400" :
                            isCreative ? "text-slate-900 dark:text-white" :
                            isMinimal || isElegant || isSwiss ? "text-slate-800 dark:text-white" :
                            "text-slate-950 dark:text-white"
                          )
                        } mb-0.5 gap-1`}>
                          <span className="break-words" style={{ color: styleConfig.primaryColor || undefined }}>
                            {proj.name}
                            {proj.projectLink && (
                              <span className="text-[7.5px] sm:text-[10px] font-normal text-slate-400 dark:text-slate-500 ml-1 inline-block">
                                <a href={formatUrl(proj.projectLink)} target="_blank" rel="noopener noreferrer" style={{ color: styleConfig.primaryColor || undefined }} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                  LINK
                                </a>
                              </span>
                            )}
                          </span>
                        </div>
                        {proj.techStack && proj.techStack.trim() ? (
                          <p className={`text-[7.5px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5 sm:mb-1 break-words`}>
                            Tech: {proj.techStack}
                          </p>
                        ) : null}
                        {proj.points && proj.points.filter(Boolean).length > 0 && (
                          <ul className="list-disc pl-2.5 sm:pl-4 space-y-0.5">
                            {proj.points.filter(Boolean).map((bullet, bIdx) => (
                              <li key={bIdx} className={`${previewTextSize} leading-tight sm:leading-relaxed ${previewTextColor} break-words`}>{renderRichText(bullet)}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null

              const renderPreviewEducation = () => effectiveEducation.filter(e => e.institution || e.degree).length > 0 ? (
                <div className={previewSectionMargin}>
                  <h2 className={getSectionHeadingClass()} style={getSectionHeadingStyle()}>
                    Education
                  </h2>
                  <div className={isCompact ? "space-y-1 sm:space-y-1.5" : "space-y-1 sm:space-y-3"}>
                    {effectiveEducation.filter(e => e.institution || e.degree).map((edu, idx) => (
                      <div key={idx}>
                        <div className={`flex flex-wrap items-baseline justify-between ${previewTextSize} font-bold ${
                          styleConfig.primaryColor ? "" : (
                            isEmerald ? "text-emerald-950 dark:text-emerald-200" :
                            isTechFaang ? "text-slate-950 dark:text-white" :
                            isExecModern ? "text-slate-950 dark:text-white" :
                            isNavy ? "text-blue-900 dark:text-blue-400" :
                            isCreative ? "text-slate-900 dark:text-white" :
                            isMinimal || isElegant || isSwiss ? "text-slate-800 dark:text-white" :
                            "text-slate-950 dark:text-white"
                          )
                        } gap-x-1 gap-y-0.5`}>
                          <span className="break-words" style={{ color: styleConfig.primaryColor || undefined }}>{edu.degree || "Degree"}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""} — {edu.institution || "Institution"}</span>
                          <span className="font-semibold text-slate-500 dark:text-slate-400 text-[7.5px] sm:text-xs shrink-0">{edu.year}</span>
                        </div>
                        {edu.grade && (
                          <p className={`text-[7.5px] sm:text-[11px] ${previewTextColor} font-medium mt-0.5 break-words`}>GPA/Grade: {edu.grade}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null

              const renderPreviewAchievements = () => effectiveAchievements.filter(Boolean).length > 0 ? (
                <div className={previewSectionMargin}>
                  <h2 className={getSectionHeadingClass()} style={getSectionHeadingStyle()}>
                    Achievements & Certifications
                  </h2>
                  <ul className="list-disc pl-2.5 sm:pl-4 space-y-0.5">
                    {effectiveAchievements.filter(Boolean).map((achievement, aIdx) => (
                      <li key={aIdx} className={`${previewTextSize} leading-tight sm:leading-relaxed ${previewTextColor} break-words`}>{renderRichText(achievement)}</li>
                    ))}
                  </ul>
                </div>
              ) : null

              const renderPreviewLanguages = () => effectiveLanguages.filter(Boolean).length > 0 ? (
                <div className={previewSectionMargin}>
                  <h2 className={getSectionHeadingClass()} style={getSectionHeadingStyle()}>
                    Languages
                  </h2>
                  <p className={`${previewTextSize} leading-tight sm:leading-relaxed ${previewTextColor} font-medium break-words`}>{effectiveLanguages.filter(Boolean).join(", ")}</p>
                </div>
              ) : null

              return (
                <>
             

                  <div
                    id="printable-resume-area"
                    style={{
                      color: styleConfig.textColor || undefined,
                    }}
                    className={`min-h-0 sm:min-h-[800px] w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl sm:rounded-3xl ${previewPadding} shadow-sm sm:shadow-xl shadow-slate-100 dark:shadow-none ${previewFontClass} ${previewTextColor} select-text overflow-hidden transition-all duration-350`}
                  >
                    {!hasUserData && !isPreviewingSample ? (
                      <div className="my-6 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center space-y-3 print:hidden">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Your Resume is Currently Empty
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            Fill in your details on the left, or click <strong className="text-indigo-600 dark:text-indigo-400 font-bold">Sample Preview</strong> above to see how this template looks with sample data.
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setIsPreviewingSample(true)}
                          className="h-8 text-xs font-bold border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View Sample Preview
                        </Button>
                      </div>
                    ) : (
                      <div className="text-left max-w-full animate-in fade-in duration-500">
                      {/* Modern Photo Sidebar Layout */}
                      {isPhotoSidebar ? (
                        <div className="flex flex-row gap-2.5 sm:gap-6">
                          {/* Left Sidebar (25% on desktop, 28% on mobile) */}
                          <div className="w-[28%] sm:w-[25%] shrink-0 border-r border-slate-200 dark:border-slate-800 pr-2 sm:pr-4">
                            {photoUrl && (
                              <div className="flex justify-center sm:justify-start mb-2 sm:mb-3">
                                {renderAvatar("w-14 h-14 sm:w-32 sm:h-32")}
                              </div>
                            )}
                            <div className={previewSectionMargin}>
                              <h2 className={`${previewSectionTitleSize} text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-0.5 mb-1 sm:mb-2`}>
                                Contact
                              </h2>
                              {renderContactColumn()}
                            </div>
                            {renderPreviewSkills()}
                            {renderPreviewEducation()}
                            {renderPreviewLanguages()}
                            {renderPreviewAchievements()}
                          </div>
                          {/* Right Main (72% on mobile, 75% on desktop) */}
                          <div className="flex-1 min-w-0 pl-1 sm:pl-2">
                            {(effectiveName || effectiveRole) && (
                              <div className="pb-1.5 sm:pb-3 mb-2 sm:mb-3 border-b-2 border-indigo-600" style={{ borderColor: styleConfig.primaryColor || undefined }}>
                                {effectiveName && (
                                  <div className={`${previewTitleSize} font-black text-slate-950 dark:text-white tracking-tight mb-0.5 break-words`} style={{ color: styleConfig.primaryColor || undefined }}>
                                    {effectiveName}
                                  </div>
                                )}
                                {effectiveRole && (
                                  <p className={`${previewHeadlineSize} font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider break-words`} style={{ color: styleConfig.primaryColor || undefined }}>
                                    {effectiveRole}
                                  </p>
                                )}
                              </div>
                            )}
                          {renderPreviewSummary()}
                          {renderPreviewExperience()}
                          {renderPreviewProjects()}
                        </div>
                      </div>
                    ) : isPhotoExec ? (
                      /* Executive Headshot Layout */
                      <div>
                        <div className={`flex flex-row items-center sm:items-start ${photoUrl ? "gap-2.5 sm:gap-5" : ""} pb-2.5 sm:pb-4 mb-2.5 sm:mb-4 border-b-2 border-blue-900 dark:border-blue-700`} style={{ borderColor: styleConfig.primaryColor || undefined }}>
                          {photoUrl && renderAvatar("w-14 h-14 sm:w-28 sm:h-28")}
                          <div className="flex-1 min-w-0 text-left space-y-0.5 sm:space-y-1">
                            {effectiveName && (
                              <div className={`${previewTitleSize} font-black text-blue-900 dark:text-blue-400 tracking-tight break-words`} style={{ color: styleConfig.primaryColor || undefined }}>
                                {effectiveName}
                              </div>
                            )}
                            {effectiveRole && (
                              <p className={`${previewHeadlineSize} font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider break-words`}>
                                {effectiveRole}
                              </p>
                            )}
                            {renderContactRow()}
                          </div>
                        </div>

                        {renderPreviewSummary()}
                        {renderPreviewSkills()}
                        {renderPreviewEducation()}
                        {renderPreviewExperience()}
                        {renderPreviewProjects()}
                        {renderPreviewAchievements()}
                        {renderPreviewLanguages()}
                      </div>
                    ) : isPhotoCreative ? (
                      /* Creative Portfolio Layout */
                      <div>
                        <div className={`flex flex-row items-center sm:items-start ${photoUrl ? "gap-2.5 sm:gap-5" : ""} pb-2 mb-2`}>
                          {photoUrl && renderAvatar("w-14 h-14 sm:w-28 sm:h-28")}
                          <div className="flex-1 min-w-0 text-left space-y-0.5 sm:space-y-1">
                            {effectiveName && (
                              <div className={`${previewTitleSize} font-black text-slate-950 dark:text-white tracking-tight break-words`} style={{ color: styleConfig.primaryColor || undefined }}>
                                {effectiveName}
                              </div>
                            )}
                            {effectiveRole && (
                              <p className={`${previewHeadlineSize} font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider break-words`} style={{ color: styleConfig.primaryColor || undefined }}>
                                {effectiveRole}
                              </p>
                            )}
                            {renderContactRow()}
                          </div>
                        </div>
                        <div className="h-0.5 sm:h-1 w-full bg-indigo-600 mb-2.5 sm:mb-4" style={{ backgroundColor: styleConfig.primaryColor || undefined }} />

                        {renderPreviewSummary()}
                        {renderPreviewSkills()}
                        {renderPreviewExperience()}
                        {renderPreviewProjects()}
                        {renderPreviewEducation()}
                        {renderPreviewAchievements()}
                        {renderPreviewLanguages()}
                      </div>
                    ) : isPhotoMinimal ? (
                      /* Minimal Avatar Layout */
                      <div>
                        <div className="flex flex-row items-center justify-between gap-2 pb-2 sm:pb-3 mb-2.5 sm:mb-4 border-b border-slate-200 dark:border-slate-800">
                          <div className="space-y-0.5 sm:space-y-1 text-left flex-1 min-w-0">
                            {effectiveName && (
                              <div className={`${previewTitleSize} font-bold text-slate-800 dark:text-white tracking-tight break-words`} style={{ color: styleConfig.primaryColor || undefined }}>
                                {effectiveName}
                              </div>
                            )}
                            {effectiveRole && (
                              <p className={`${previewHeadlineSize} font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider break-words`}>
                                {effectiveRole}
                              </p>
                            )}
                            {renderContactRow()}
                          </div>
                          {photoUrl && renderAvatar("w-12 h-12 sm:w-20 sm:h-20")}
                        </div>

                        {renderPreviewSummary()}
                        {renderPreviewSkills()}
                        {renderPreviewEducation()}
                        {renderPreviewExperience()}
                        {renderPreviewProjects()}
                        {renderPreviewAchievements()}
                        {renderPreviewLanguages()}
                      </div>
                    ) : isTwoColumn ? (
                      <div>
                        {/* Header */}
                        {photoUrl ? (
                          <div className="flex flex-row items-center sm:items-start justify-between gap-3 sm:gap-5 mb-2.5 sm:mb-4">
                            <div className="flex-1 min-w-0">
                              <div className={`${previewTitleSize} font-black tracking-tight mb-0.5 sm:mb-1 text-slate-950 dark:text-white break-words`} style={{ color: styleConfig.primaryColor || undefined }}>{effectiveName}</div>
                              {effectiveRole && (
                                <p className={`${previewHeadlineSize} font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 sm:mb-1.5 break-words`}>{effectiveRole}</p>
                              )}
                              {renderContactRow()}
                            </div>
                            {renderAvatar("w-14 h-14 sm:w-24 sm:h-24")}
                          </div>
                        ) : (
                          <div className={`flex flex-col text-left mb-2.5 sm:mb-4`}>
                            <div className={`${previewTitleSize} font-black tracking-tight mb-0.5 sm:mb-1 text-slate-950 dark:text-white break-words`} style={{ color: styleConfig.primaryColor || undefined }}>{effectiveName}</div>
                            {effectiveRole && (
                              <p className={`${previewHeadlineSize} font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 sm:mb-1.5 break-words`}>{effectiveRole}</p>
                            )}
                            {renderContactRow()}
                          </div>
                        )}

                        {/* 2 Column Body: 30% Left / 70% Right side-by-side */}
                        <div className="flex flex-row gap-2.5 sm:gap-6">
                          <div className="w-[30%] sm:w-[30%] shrink-0">
                            {renderPreviewSkills()}
                            {renderPreviewEducation()}
                            {renderPreviewLanguages()}
                            {renderPreviewAchievements()}
                          </div>
                          <div className="flex-1 min-w-0">
                            {renderPreviewSummary()}
                            {renderPreviewExperience()}
                            {renderPreviewProjects()}
                          </div>
                        </div>
                      </div>
                    ) : isElegant ? (
                      /* Elegant Sidebar */
                      <div className="flex flex-row gap-2.5 sm:gap-6">
                        {/* Left Sidebar (30%) */}
                        <div className="w-[30%] sm:w-[30%] shrink-0 border-r border-slate-200 dark:border-slate-800 pr-2 sm:pr-4">
                          <div className={previewSectionMargin}>
                            {photoUrl && (
                              <div className="flex justify-center sm:justify-start mb-2 sm:mb-3">
                                {renderAvatar("w-14 h-14 sm:w-24 sm:h-24")}
                              </div>
                            )}
                            <div className={`${previewTitleSize} font-black text-slate-950 dark:text-white tracking-tight mb-0.5 sm:mb-1 break-words`} style={{ color: styleConfig.primaryColor || undefined }}>{effectiveName}</div>
                            {effectiveRole && (
                              <p className={`${previewHeadlineSize} font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 sm:mb-2 break-words`}>{effectiveRole}</p>
                            )}
                            {renderContactColumn()}
                          </div>
                          {renderPreviewSkills()}
                          {renderPreviewEducation()}
                          {renderPreviewLanguages()}
                          {renderPreviewAchievements()}
                        </div>
                        {/* Right Main (70%) */}
                        <div className="flex-1 min-w-0 pl-1 sm:pl-2">
                          
                          {renderPreviewSummary()}
                          {renderPreviewExperience()}
                          {renderPreviewProjects()}
                        </div>
                      </div>
                    ) : (
                      /* Single Column Layouts: Classic Serif, Modern Minimal, Executive Navy, Compact Tech, Creative Bold, ATS Clean, Ivy League, Tech FAANG, Exec Modern, Swiss, Emerald, Compact One-Page */
                      <div>
                        {/* Header */}
                        {photoUrl ? (
                          previewHeaderAlign === "text-center" ? (
                            <div className="flex flex-col items-center text-center mb-2.5 sm:mb-4">
                              <div className="mb-2 sm:mb-3">
                                {renderAvatar("w-14 h-14 sm:w-24 sm:h-24")}
                              </div>
                              {effectiveName && (
                                <div className={`${previewTitleSize} font-black ${
                                  styleConfig.primaryColor ? "" : (
                                    isEmerald ? "text-emerald-950 dark:text-emerald-100" :
                                    isTechFaang ? "text-slate-950 dark:text-white" :
                                    isExecModern ? "text-slate-950 dark:text-white" :
                                    isNavy ? "text-blue-900 dark:text-blue-400" :
                                    isMinimal ? "text-slate-800 dark:text-white" :
                                    "text-slate-950 dark:text-white"
                                  )
                                } tracking-tight mb-0.5 sm:mb-1 break-words`} style={{ color: styleConfig.primaryColor || undefined }}>{effectiveName}</div>
                              )}
                              {effectiveRole && (
                                <p className={`${previewHeadlineSize} font-bold ${
                                  isEmerald ? "text-emerald-700 dark:text-emerald-400 font-bold" :
                                  isTechFaang ? "text-blue-600 dark:text-blue-400 font-bold" :
                                  isNavy ? "text-blue-900 dark:text-blue-400" :
                                  isCreative ? "text-indigo-600 dark:text-indigo-400 font-extrabold" :
                                  isMinimal ? "text-slate-600 dark:text-slate-450" :
                                  "text-slate-700 dark:text-slate-300"
                                } uppercase tracking-wider mb-1 sm:mb-1.5 break-words`}>{effectiveRole}</p>
                              )}
                              {isCreative && <div className="h-0.5 sm:h-1 w-full bg-indigo-600 rounded-full my-1.5 sm:my-2" style={{ backgroundColor: styleConfig.primaryColor || undefined }} />}
                              {renderContactRow()}
                            </div>
                          ) : (
                            <div className="flex flex-row items-center sm:items-start justify-between gap-3 sm:gap-5 mb-2.5 sm:mb-4">
                              <div className="flex-1 min-w-0">
                                {effectiveName && (
                                  <div className={`${previewTitleSize} font-black ${
                                    styleConfig.primaryColor ? "" : (
                                      isEmerald ? "text-emerald-950 dark:text-emerald-100" :
                                      isTechFaang ? "text-slate-950 dark:text-white" :
                                      isExecModern ? "text-slate-950 dark:text-white" :
                                      isNavy ? "text-blue-900 dark:text-blue-400" :
                                      isMinimal ? "text-slate-800 dark:text-white" :
                                      "text-slate-950 dark:text-white"
                                    )
                                  } tracking-tight mb-0.5 sm:mb-1 break-words`} style={{ color: styleConfig.primaryColor || undefined }}>{effectiveName}</div>
                                )}
                                {effectiveRole && (
                                  <p className={`${previewHeadlineSize} font-bold ${
                                    isEmerald ? "text-emerald-700 dark:text-emerald-400 font-bold" :
                                    isTechFaang ? "text-blue-600 dark:text-blue-400 font-bold" :
                                    isNavy ? "text-blue-900 dark:text-blue-400" :
                                    isCreative ? "text-indigo-600 dark:text-indigo-400 font-extrabold" :
                                    isMinimal ? "text-slate-600 dark:text-slate-450" :
                                    "text-slate-700 dark:text-slate-300"
                                  } uppercase tracking-wider mb-1 sm:mb-1.5 break-words`}>{effectiveRole}</p>
                                )}
                                {isCreative && <div className="h-0.5 sm:h-1 w-full bg-indigo-600 rounded-full my-1.5 sm:my-2" style={{ backgroundColor: styleConfig.primaryColor || undefined }} />}
                                {renderContactRow()}
                              </div>
                              {renderAvatar("w-14 h-14 sm:w-24 sm:h-24")}
                            </div>
                          )
                        ) : (
                          <div className={`flex flex-col ${previewHeaderAlign} mb-2.5 sm:mb-4`}>
                            {effectiveName && (
                              <div className={`${previewTitleSize} font-black ${
                                styleConfig.primaryColor ? "" : (
                                  isEmerald ? "text-emerald-950 dark:text-emerald-100" :
                                  isTechFaang ? "text-slate-950 dark:text-white" :
                                  isExecModern ? "text-slate-950 dark:text-white" :
                                  isNavy ? "text-blue-900 dark:text-blue-400" :
                                  isMinimal ? "text-slate-800 dark:text-white" :
                                  "text-slate-950 dark:text-white"
                                )
                              } tracking-tight mb-0.5 sm:mb-1 break-words`} style={{ color: styleConfig.primaryColor || undefined }}>{effectiveName}</div>
                            )}
                            {effectiveRole && (
                              <p className={`${previewHeadlineSize} font-bold ${
                                isEmerald ? "text-emerald-700 dark:text-emerald-400 font-bold" :
                                isTechFaang ? "text-blue-600 dark:text-blue-400 font-bold" :
                                isNavy ? "text-blue-900 dark:text-blue-400" :
                                isCreative ? "text-indigo-600 dark:text-indigo-400 font-extrabold" :
                                isMinimal ? "text-slate-600 dark:text-slate-450" :
                                "text-slate-700 dark:text-slate-300"
                              } uppercase tracking-wider mb-1 sm:mb-1.5 break-words`}>{effectiveRole}</p>
                            )}
                            {isCreative && <div className="h-0.5 sm:h-1 w-full bg-indigo-600 rounded-full my-1.5 sm:my-2" style={{ backgroundColor: styleConfig.primaryColor || undefined }} />}
                            {renderContactRow()}
                          </div>
                        )}

                        {isIvyLeague ? (
                          <>
                            {renderPreviewSummary()}
                            {renderPreviewEducation()}
                            {renderPreviewExperience()}
                            {renderPreviewProjects()}
                            {renderPreviewSkills()}
                            {renderPreviewAchievements()}
                            {renderPreviewLanguages()}
                          </>
                        ) : isTechFaang ? (
                          <>
                            {renderPreviewSummary()}
                            {renderPreviewSkills()}
                            {renderPreviewExperience()}
                            {renderPreviewProjects()}
                            {renderPreviewEducation()}
                            {renderPreviewAchievements()}
                            {renderPreviewLanguages()}
                          </>
                        ) : (
                          <>
                            {renderPreviewSummary()}
                            {renderPreviewSkills()}
                            {renderPreviewEducation()}
                            {renderPreviewExperience()}
                            {renderPreviewProjects()}
                            {renderPreviewAchievements()}
                            {renderPreviewLanguages()}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
                </div>
              </>
            )
            })()}
          </div>
        </div>
      </div>

      {/* Inline AI Assist dialog */}
      <AlertDialog open={showAiAssist} onOpenChange={setShowAiAssist}>
        <AlertDialogContent className="rounded-2xl border-slate-150 dark:border-slate-800 max-w-lg print:hidden bg-white dark:bg-slate-900 shadow-2xl backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-extrabold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-500 animate-pulse" />
              Inline AI Assistant
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

      {/* Credit Deduction Confirmation Popup */}
      <AlertDialog open={showCreditConfirmDialog} onOpenChange={setShowCreditConfirmDialog}>
        <AlertDialogContent className="rounded-2xl border-slate-200 dark:border-slate-800 max-w-md bg-white dark:bg-slate-900 shadow-2xl backdrop-blur-md">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/80 flex items-center justify-center mb-2 text-indigo-600 dark:text-indigo-400">
              <Coins className="w-6 h-6 text-amber-500" />
            </div>
            <AlertDialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white">
              Use 2 Credits to Generate Resume?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
              Generating an ATS-optimized resume with AI will deduct <strong className="text-slate-900 dark:text-white font-bold">2 credits</strong> from your account balance.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="p-3 my-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Your current balance:</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              {userTotalCredits} {userTotalCredits === 1 ? 'Credit' : 'Credits'}
            </span>
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel 
              className="rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold"
              onClick={() => setShowCreditConfirmDialog(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1"
              onClick={handleConfirmCreditDeduction}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Confirm & Use 2 Credits</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Download Resume Credit Confirmation Popup */}
      <AlertDialog open={showDownloadConfirmDialog} onOpenChange={setShowDownloadConfirmDialog}>
        <AlertDialogContent className="rounded-2xl border-slate-200 dark:border-slate-800 max-w-md bg-white dark:bg-slate-900 shadow-2xl backdrop-blur-md">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/80 flex items-center justify-center mb-2 text-indigo-600 dark:text-indigo-400">
              <Download className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <AlertDialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white">
              Download Resume PDF (1 Credit)
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
              Downloading your ATS-optimized resume as a PDF will deduct <strong className="text-slate-900 dark:text-white font-bold">1 credit</strong> from your account balance.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="p-3 my-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Your current balance:</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              {userTotalCredits} {userTotalCredits === 1 ? 'Credit' : 'Credits'}
            </span>
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel 
              className="rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold"
              onClick={() => setShowDownloadConfirmDialog(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1"
              onClick={handleConfirmDownload}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Confirm & Use 1 Credit</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
