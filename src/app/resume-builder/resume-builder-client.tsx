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
  Award, Download, Layers, Palette, X, Camera, Upload, Image as ImageIcon, Coins
} from "lucide-react"
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

interface TemplateOption {
  id: string
  name: string
  description: string
  renderThumbnail: () => React.ReactNode
}

const TEMPLATES: TemplateOption[] = [
  {
    id: "classic-serif",
    name: "Classic Serif",
    description: "Traditional academic styling with Times-Roman serif typography and centered headers.",
    renderThumbnail: () => (
      <div className="h-24 w-full bg-slate-50 dark:bg-slate-900 rounded-lg p-2 flex flex-col justify-between border border-slate-200 dark:border-slate-800 font-serif">
        <div className="text-center space-y-0.5">
          <div className="h-2 w-16 bg-slate-800 dark:bg-slate-200 mx-auto rounded-sm" />
          <div className="h-0.5 w-24 bg-slate-400 mx-auto rounded-sm" />
          <div className="h-0.5 w-full bg-slate-800 dark:bg-slate-200 my-0.5" />
        </div>
        <div className="space-y-0.5">
          <div className="h-1.5 w-12 bg-slate-600 rounded-sm" />
          <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-sm" />
          <div className="h-0.5 w-4/5 bg-slate-300 dark:bg-slate-700 rounded-sm" />
        </div>
        <div className="space-y-0.5">
          <div className="h-1.5 w-10 bg-slate-600 rounded-sm" />
          <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-sm" />
        </div>
      </div>
    )
  },
  {
    id: "modern-minimal",
    name: "Modern Minimalist",
    description: "Clean sans-serif layout with muted slate tones and left-aligned headers.",
    renderThumbnail: () => (
      <div className="h-24 w-full bg-slate-50 dark:bg-slate-900 rounded-lg p-2 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
        <div className="space-y-0.5">
          <div className="h-2.5 w-20 bg-slate-700 dark:bg-slate-300 rounded-sm" />
          <div className="h-0.5 w-14 bg-slate-400 rounded-sm" />
          <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-700 my-0.5" />
        </div>
        <div className="space-y-0.5">
          <div className="h-1.5 w-14 bg-slate-500 rounded-sm" />
          <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-sm" />
          <div className="h-0.5 w-5/6 bg-slate-300 dark:bg-slate-700 rounded-sm" />
        </div>
        <div className="space-y-0.5">
          <div className="h-1.5 w-10 bg-slate-500 rounded-sm" />
          <div className="h-0.5 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-sm" />
        </div>
      </div>
    )
  },
  {
    id: "executive-navy",
    name: "Executive Navy",
    description: "Polished corporate style featuring deep navy accents and sharp dividing lines.",
    renderThumbnail: () => (
      <div className="h-24 w-full bg-slate-50 dark:bg-slate-900 rounded-lg p-2 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
        <div className="text-center space-y-0.5">
          <div className="h-2.5 w-20 bg-blue-900 dark:bg-blue-400 mx-auto rounded-sm" />
          <div className="h-0.5 w-28 bg-blue-700 dark:bg-blue-300 mx-auto rounded-sm" />
          <div className="h-0.5 w-full bg-blue-900 dark:bg-blue-400 my-0.5" />
        </div>
        <div className="space-y-0.5">
          <div className="h-1.5 w-16 bg-blue-900 dark:bg-blue-400 rounded-sm" />
          <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-sm" />
          <div className="h-0.5 w-4/5 bg-slate-300 dark:bg-slate-700 rounded-sm" />
        </div>
        <div className="space-y-0.5">
          <div className="h-1.5 w-12 bg-blue-900 dark:bg-blue-400 rounded-sm" />
          <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-sm" />
        </div>
      </div>
    )
  },
  {
    id: "compact-tech",
    name: "Compact Tech",
    description: "High-density layout optimized for tech professionals with maximum content space.",
    renderThumbnail: () => (
      <div className="h-24 w-full bg-slate-50 dark:bg-slate-900 rounded-lg p-2 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
        <div className="space-y-0.5">
          <div className="h-2 w-16 bg-slate-800 dark:bg-slate-200 rounded-sm" />
          <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-sm" />
          <div className="h-0.5 w-full bg-slate-800 dark:bg-slate-200" />
        </div>
        <div className="space-y-0.5">
          <div className="h-1 w-10 bg-slate-700 dark:bg-slate-300 rounded-sm" />
          <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-sm" />
          <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-sm" />
        </div>
        <div className="space-y-0.5">
          <div className="h-1 w-10 bg-slate-700 dark:bg-slate-300 rounded-sm" />
          <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-sm" />
        </div>
      </div>
    )
  },
  {
    id: "two-column",
    name: "Two-Column",
    description: "30/70 split layout with skills & education on the left, experience & projects on the right.",
    renderThumbnail: () => (
      <div className="h-24 w-full bg-slate-50 dark:bg-slate-900 rounded-lg p-2 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
        <div className="space-y-0.5 pb-0.5 border-b border-slate-200 dark:border-slate-700">
          <div className="h-2 w-16 bg-slate-800 dark:bg-slate-200 rounded-sm" />
          <div className="h-0.5 w-24 bg-slate-400 rounded-sm" />
        </div>
        <div className="flex gap-1.5 flex-1 pt-1">
          <div className="w-[25%] border-r border-slate-200 dark:border-slate-700 pr-1 space-y-1">
            <div className="h-1 w-6 bg-slate-600 rounded-sm" />
            <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-sm" />
            <div className="h-0.5 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-sm" />
            <div className="h-1 w-6 bg-slate-600 rounded-sm mt-0.5" />
            <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-sm" />
          </div>
          <div className="w-[75%] space-y-1">
            <div className="h-1 w-10 bg-slate-700 dark:bg-slate-300 rounded-sm" />
            <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-sm" />
            <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-sm" />
            <div className="h-0.5 w-4/5 bg-slate-300 dark:bg-slate-700 rounded-sm" />
          </div>
        </div>
      </div>
    )
  },
  {
    id: "creative-bold",
    name: "Creative Bold",
    description: "Eye-catching design with a vibrant accent bar and border-accented section headers.",
    renderThumbnail: () => (
      <div className="h-24 w-full bg-slate-50 dark:bg-slate-900 rounded-lg p-2 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
        <div className="space-y-0.5">
          <div className="h-2.5 w-18 bg-indigo-900 dark:bg-indigo-300 rounded-sm" />
          <div className="h-0.5 w-full bg-indigo-600 rounded-full" />
          <div className="h-0.5 w-24 bg-slate-400 rounded-sm" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <div className="h-2 w-0.5 bg-indigo-600 rounded-sm" />
            <div className="h-1.5 w-12 bg-indigo-900 dark:bg-indigo-300 rounded-sm" />
          </div>
          <div className="space-y-0.5 pl-1.5">
            <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-sm" />
            <div className="h-0.5 w-4/5 bg-slate-300 dark:bg-slate-700 rounded-sm" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <div className="h-2 w-0.5 bg-indigo-600 rounded-sm" />
            <div className="h-1.5 w-10 bg-indigo-900 dark:bg-indigo-300 rounded-sm" />
          </div>
          <div className="h-0.5 w-3/4 pl-1.5 bg-slate-300 dark:bg-slate-700 rounded-sm" />
        </div>
      </div>
    )
  },
  {
    id: "elegant-sidebar",
    name: "Elegant Sidebar",
    description: "Distinct left sidebar with contact info & skills separated by a clean vertical divider.",
    renderThumbnail: () => (
      <div className="h-24 w-full bg-slate-50 dark:bg-slate-900 rounded-lg p-2 flex border border-slate-200 dark:border-slate-800">
        <div className="w-[25%] border-r border-slate-300 dark:border-slate-700 pr-1 space-y-1">
          <div className="h-2 w-10 bg-slate-900 dark:bg-white rounded-sm" />
          <div className="h-0.5 w-8 bg-slate-400 rounded-sm" />
          <div className="space-y-0.5 pt-0.5">
            <div className="h-0.5 w-full bg-slate-400 rounded-sm" />
            <div className="h-0.5 w-full bg-slate-400 rounded-sm" />
          </div>
          <div className="h-1 w-8 bg-slate-600 rounded-sm pt-0.5" />
          <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-sm" />
        </div>
        <div className="w-[75%] pl-1.5 space-y-1">
          <div className="space-y-0.5">
            <div className="h-1.5 w-12 bg-slate-700 dark:bg-slate-300 rounded-sm" />
            <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-sm" />
            <div className="h-0.5 w-4/5 bg-slate-300 dark:bg-slate-700 rounded-sm" />
          </div>
          <div className="space-y-0.5">
            <div className="h-1.5 w-12 bg-slate-700 dark:bg-slate-300 rounded-sm" />
            <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-sm" />
          </div>
        </div>
      </div>
    )
  },
  {
    id: "ats-clean",
    name: "ATS Clean",
    description: "Ultra-clean monospace layout without borders, engineered for 100% ATS readability.",
    renderThumbnail: () => (
      <div className="h-24 w-full bg-slate-50 dark:bg-slate-900 rounded-lg p-2 flex flex-col justify-between border border-slate-200 dark:border-slate-800 font-mono">
        <div className="space-y-0.5">
          <div className="h-2 w-18 bg-slate-900 dark:bg-white rounded-none" />
          <div className="h-0.5 w-24 bg-slate-400 rounded-none" />
        </div>
        <div className="space-y-1">
          <div className="h-1.5 w-14 bg-slate-800 dark:bg-slate-200 rounded-none" />
          <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-none" />
          <div className="h-0.5 w-5/6 bg-slate-300 dark:bg-slate-700 rounded-none" />
        </div>
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-slate-800 dark:bg-slate-200 rounded-none" />
          <div className="h-0.5 w-4/5 bg-slate-300 dark:bg-slate-700 rounded-none" />
        </div>
      </div>
    )
  },
  {
    id: "photo-modern-sidebar",
    name: "Modern Photo Sidebar",
    description: "Professional two-column layout with candidate photo (sharp edges), skills & contacts in a stylish left sidebar.",
    renderThumbnail: () => (
      <div className="h-24 w-full bg-slate-50 dark:bg-slate-900 rounded-lg p-2 flex border border-slate-200 dark:border-slate-800">
        <div className="w-[25%] border-r border-slate-300 dark:border-slate-700 pr-1 space-y-1 flex flex-col items-center">
          <div className="w-6 h-6 rounded-none bg-indigo-500/30 border border-indigo-400 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="w-full space-y-0.5 pt-0.5">
            <div className="h-1 w-full bg-slate-600 rounded-none" />
            <div className="h-0.5 w-3/4 bg-slate-400 rounded-none" />
            <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-none" />
          </div>
        </div>
        <div className="w-[75%] pl-1.5 space-y-1">
          <div className="space-y-0.5 pb-0.5 border-b border-indigo-500">
            <div className="h-2 w-14 bg-slate-900 dark:bg-white rounded-none" />
            <div className="h-0.5 w-10 bg-indigo-600 rounded-none" />
          </div>
          <div className="space-y-0.5">
            <div className="h-1.5 w-12 bg-slate-700 dark:bg-slate-300 rounded-none" />
            <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-none" />
            <div className="h-0.5 w-4/5 bg-slate-300 dark:bg-slate-700 rounded-none" />
          </div>
        </div>
      </div>
    )
  },
  {
    id: "photo-executive",
    name: "Executive Headshot",
    description: "Prestigious executive template with a sharp rectangular headshot and corporate navy accents.",
    renderThumbnail: () => (
      <div className="h-24 w-full bg-slate-50 dark:bg-slate-900 rounded-lg p-2 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 pb-1 border-b border-blue-900 dark:border-blue-700">
          <div className="w-6 h-6 rounded-none bg-blue-900/20 border border-blue-800 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-blue-900 dark:text-blue-400" />
          </div>
          <div className="space-y-0.5 flex-1">
            <div className="h-2 w-16 bg-blue-900 dark:bg-blue-300 rounded-none" />
            <div className="h-0.5 w-20 bg-slate-400 rounded-none" />
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="h-1.5 w-14 bg-blue-900 dark:bg-blue-400 rounded-none" />
          <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-none" />
          <div className="h-0.5 w-4/5 bg-slate-300 dark:bg-slate-700 rounded-none" />
        </div>
        <div className="space-y-0.5">
          <div className="h-1.5 w-10 bg-blue-900 dark:bg-blue-400 rounded-none" />
          <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-none" />
        </div>
      </div>
    )
  },
  {
    id: "photo-creative",
    name: "Creative Portfolio",
    description: "Dynamic layout featuring candidate headshot with clean sharp edges, vibrant indigo accents, and portfolio links.",
    renderThumbnail: () => (
      <div className="h-24 w-full bg-slate-50 dark:bg-slate-900 rounded-lg p-2 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-none bg-indigo-600/20 border border-indigo-500 flex items-center justify-center shrink-0">
            <Camera className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="space-y-0.5 flex-1">
            <div className="h-2 w-14 bg-indigo-900 dark:bg-indigo-300 rounded-none" />
            <div className="h-0.5 w-18 bg-slate-400 rounded-none" />
          </div>
        </div>
        <div className="h-0.5 w-full bg-indigo-600 rounded-none" />
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <div className="h-2 w-0.5 bg-indigo-600 rounded-none" />
            <div className="h-1.5 w-10 bg-indigo-900 dark:bg-indigo-300 rounded-none" />
          </div>
          <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-none pl-1" />
        </div>
      </div>
    )
  },
  {
    id: "photo-minimal",
    name: "Minimal Avatar",
    description: "Refined minimalist styling with a sharp rectangular profile photo badge alongside name & title.",
    renderThumbnail: () => (
      <div className="h-24 w-full bg-slate-50 dark:bg-slate-900 rounded-lg p-2 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-0.5">
            <div className="h-2 w-14 bg-slate-800 dark:bg-slate-200 rounded-none" />
            <div className="h-0.5 w-20 bg-slate-400 rounded-none" />
          </div>
          <div className="w-5 h-5 rounded-none bg-slate-300 dark:bg-slate-700 border border-slate-400 flex items-center justify-center shrink-0">
            <User className="w-3 h-3 text-slate-600 dark:text-slate-300" />
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="h-1.5 w-12 bg-slate-600 rounded-none" />
          <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-700 rounded-none" />
          <div className="h-0.5 w-4/5 bg-slate-300 dark:bg-slate-700 rounded-none" />
        </div>
        <div className="space-y-0.5">
          <div className="h-1.5 w-10 bg-slate-600 rounded-none" />
          <div className="h-0.5 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-none" />
        </div>
      </div>
    )
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

export default function ResumeBuilderPage() {
  const { user, refreshUser, loading } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  // Show promotional material only if user is NOT logged in.
  const showPromo = !user && !loading;

  // Credit & Usage State
  const isFirstTimeResumeBuilder = !(user?.hasUsedResumeBuilder ?? user?.has_used_resume_builder ?? (user as any)?.metadata?.has_used_resume_builder)
  const userTotalCredits = user ? ((user.subscriptionCredits || 0) + (user.purchasedCredits || 0) || (user.credits || 0)) : 0
  const [showCreditConfirmDialog, setShowCreditConfirmDialog] = useState(false)

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
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
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
        photoUrl: photoUrl || undefined,
        contact: { email, phone, linkedin: linkedinUrl, github: githubUrl, portfolio: portfolioUrl, location, photoUrl: photoUrl || undefined },
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
            description: errData.error || "You need at least 1 credit to generate an ATS resume with AI.",
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
        toast({ title: "Resume Generated! ✨ (1 Credit Used)", description: "Your ATS-safe resume is ready to preview or download as PDF." })
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

    if (!isFirstTimeResumeBuilder && userTotalCredits < 1) {
      toast({
        title: "Insufficient Credits 💳",
        description: "You need at least 1 credit to generate an ATS resume with AI. Please purchase credits to proceed.",
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
      router.push("/login?redirect=/resume-builder")
      return
    }

    // Construct current state snapshot of candidate data
    const currentResumeData = {
      name: name || "Your Name",
      role: role || "",
      photoUrl: photoUrl || undefined,
      contact: {
        email: email || "",
        phone: phone || "",
        linkedin: linkedinUrl || "",
        github: githubUrl || "",
        portfolio: portfolioUrl || "",
        location: location || "",
        photoUrl: photoUrl || undefined
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
        dates: formatExperienceDateRange(j.startDate, j.endDate, j.currentlyWorkHere),
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
      const response = await fetch('/api/resume/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: currentResumeData,
          template: visualTemplate
        })
      })

      if (!response.ok) {
        throw new Error('Failed to render PDF on server')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${currentResumeData.name.replace(/\s+/g, "_") || "resume"}_ATS_Optimized.pdf`
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "PDF Saved! 📄"
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

      {/* ── Premium Hero ── */}
      {showPromo && (
        <div className="relative -mx-4 sm:-mx-6 mb-10 bg-gradient-to-b from-slate-950 via-indigo-950/70 to-slate-900 overflow-hidden pt-12 pb-20 print:hidden">
          {/* Background orbs */}
          <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-purple-600/15 to-indigo-600/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tr from-indigo-500/10 to-blue-500/10 blur-[80px] pointer-events-none" />
          {/* Dot grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.05] pointer-events-none" />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 dark:from-slate-950 to-transparent" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
           

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-white">
              Build Your Perfect{" "}
              <span className="text-indigo-400">
                Resume.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Fill in your details, let our AI generate polished bullet points, score your ATS compatibility, and export a recruiter-ready PDF — all in one place.
            </p>

            

            {/* Stats row */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-3">
              {[
                { value: "Free", label: "First Resume" },
                { value: "1 min", label: "To Generate" },
                { value: "PDF", label: "ATS-Safe Export" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">{stat.label}</div>
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

          {/* Design Layout Picker Button */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">Design Layout:</span>
            <Button
              type="button"
              variant={showTemplatePicker ? "default" : "outline"}
              size="sm"
              onClick={() => setShowTemplatePicker(prev => !prev)}
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
          </div>
        </div>

        {/* Right Side: Sync from Profile + Draft Name + Save Version */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 justify-stretch sm:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-200/50 dark:border-slate-800/50">
          {user && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                populateFromUserProfile(user)
                toast({ title: "Profile Auto-Filled! ✨", description: "All experience, projects, education, summary & skills imported from your profile." })
              }}
              className="w-full sm:w-auto border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 font-bold h-9 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Sync from Profile
            </Button>
          )}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial w-full sm:w-auto">
            <Input
              value={draftTitle}
              onChange={e => setDraftTitle(e.target.value)}
              placeholder="Draft Name"
              className="flex-1 sm:w-[160px] md:w-[180px] h-9 rounded-xl border-slate-250 text-xs bg-slate-50/50"
            />
            <Button
              size="sm"
              onClick={handleSaveDraft}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shrink-0"
              disabled={isSavingDraft}
            >
              {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
              Save Version
            </Button>
          </div>
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
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  
                </div>
                <div className="flex items-center gap-1.5">
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
                {TEMPLATES.map((tmpl) => {
                  const isSelected = visualTemplate === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        setVisualTemplate(tmpl.id);
                        toast({ title: "Template Selected ✨", description: `Switched to ${tmpl.name}` });
                      }}
                      className={`group relative rounded-xl border p-2.5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between shrink-0 w-[200px] sm:w-[220px] ${
                        isSelected
                          ? "border-indigo-600 ring-2 ring-indigo-600/30 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <div className="mb-2 overflow-hidden rounded-lg">
                        {tmpl.renderThumbnail()}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {tmpl.name}
                          </h4>
                          {isSelected && (
                            <Badge className="bg-indigo-600 text-white text-[9px] h-4 px-1.5 font-bold shrink-0">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mb-2 line-clamp-2">
                          {tmpl.description}
                        </p>
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

                {/* Profile Photo Upload Section */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-indigo-500" />
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-3.5 p-3 rounded-none bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/60">
                    <div className="relative w-14 h-14 rounded-none overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-100 flex items-center justify-center shrink-0 shadow-inner">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt="Profile Preview"
                          className="w-full h-full object-cover rounded-none"
                        />
                      ) : (
                        <User className="w-7 h-7 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
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
                          className="h-8 px-3 rounded-lg text-xs font-bold border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5 mr-1" />
                          {photoUrl ? "Change Photo" : "Upload Photo"}
                        </Button>
                        {photoUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemovePhoto}
                            className="h-8 px-2.5 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                        PNG, JPG or WEBP up to 5MB. Rendered in Modern Photo Sidebar, Executive Headshot, Creative Portfolio, and Minimal Avatar templates.
                      </p>
                    </div>
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
              className="w-full py-6 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform"
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
                  {isFirstTimeResumeBuilder ? "Generate with AI (Free 1st Time)" : "Generate with AI (1 Credit)"}
                  <ChevronRight className="w-5 h-5 ml-1" />
                </>
              )}
            </Button>

            {user && (
              <div className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 rounded-xl">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  Credits left: <strong className="text-slate-900 dark:text-white font-bold">{userTotalCredits} {userTotalCredits === 1 ? 'credit' : 'credits'}</strong>
                </span>
                {isFirstTimeResumeBuilder ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5">
                    ✨ 1st Use Free
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
            <div className="flex items-center justify-between print:hidden">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                ATS Layout Preview
              </h2>
              {(name || email) && (
                <div className="flex flex-wrap gap-2">
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
              const isNavy = visualTemplate === 'executive-navy' || visualTemplate === 'photo-executive'
              const isCompact = visualTemplate === 'compact-tech'
              const isMinimal = visualTemplate === 'modern-minimal' || visualTemplate === 'photo-minimal'
              const isTwoColumn = visualTemplate === 'two-column'
              const isCreative = visualTemplate === 'creative-bold' || visualTemplate === 'photo-creative'
              const isElegant = visualTemplate === 'elegant-sidebar'
              const isAtsClean = visualTemplate === 'ats-clean'
              const isPhotoSidebar = visualTemplate === 'photo-modern-sidebar'
              const isPhotoExec = visualTemplate === 'photo-executive'
              const isPhotoCreative = visualTemplate === 'photo-creative'
              const isPhotoMinimal = visualTemplate === 'photo-minimal'

              const previewFontClass = isSerif ? "font-serif" : isAtsClean ? "font-mono" : "font-sans"
              const previewTextColor = isMinimal || isElegant ? "text-slate-700 dark:text-slate-300" : "text-slate-950 dark:text-slate-100"
              const previewPadding = isCompact ? "p-2.5 sm:p-5 md:p-7" : isAtsClean ? "p-3 sm:p-6 md:p-8" : "p-3 sm:p-8 lg:p-12"
              const previewTextSize = isCompact ? "text-[8px] sm:text-[11px]" : "text-[8.5px] sm:text-xs"
              const previewSectionTitleSize = isCompact ? "text-[8px] sm:text-[10px] font-black uppercase tracking-wider" : "text-[8.5px] sm:text-xs font-black uppercase tracking-wider"
              const previewHeadlineSize = isCompact ? "text-[7.5px] sm:text-[10px]" : "text-[8px] sm:text-[11px]"
              const previewTitleSize = isCompact ? "text-sm sm:text-2xl" : isCreative ? "text-base sm:text-3xl md:text-4xl" : "text-base sm:text-2xl md:text-3xl"
              const previewSectionMargin = isCompact ? "mb-1.5 sm:mb-3" : (isTwoColumn || isElegant || isPhotoSidebar) ? "mb-2 sm:mb-4" : "mb-2 sm:mb-5"
              const previewSectionHeaderMargin = isCompact ? "mb-0.5 sm:mb-1" : "mb-0.5 sm:mb-1.5"
              const previewSectionDividerColor = isNavy
                ? "border-blue-900 dark:border-blue-800 border-b-2"
                : isMinimal
                ? "border-slate-200 dark:border-slate-800"
                : isAtsClean || isCreative
                ? "border-none"
                : "border-slate-900 dark:border-slate-100"
              const previewHeaderAlign = (isMinimal || isCompact || isCreative || isAtsClean || isTwoColumn || isElegant || isPhotoCreative || isPhotoMinimal) ? "text-left" : "text-center"
              const previewContactJustify = (isMinimal || isCompact || isCreative || isAtsClean || isTwoColumn || isElegant || isPhotoCreative || isPhotoMinimal || isPhotoExec) ? "justify-start" : "justify-center"

              const renderAvatar = (size = "w-14 h-14 sm:w-28 sm:h-28") => {
                if (photoUrl) {
                  return (
                    <div className={`relative group/photo ${size} rounded-none overflow-hidden border-2 border-slate-900 dark:border-slate-100 shadow-sm shrink-0`}>
                      <img
                        src={photoUrl}
                        alt={name || "Candidate"}
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

                return (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection('personal')
                      photoInputRef.current?.click()
                    }}
                    className={`${size} rounded-none border-2 border-dashed border-indigo-400 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all flex flex-col items-center justify-center gap-1 text-indigo-600 dark:text-indigo-400 p-1 sm:p-2 shrink-0 group cursor-pointer print:hidden shadow-sm`}
                    title="Click to upload profile photo"
                  >
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[7.5px] sm:text-[10px] font-black uppercase tracking-tight text-center leading-tight">
                      + Photo
                    </span>
                  </button>
                )
              }

              const renderContactRow = () => (
                <div className={`text-[8px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium flex flex-wrap ${previewContactJustify} gap-x-1 sm:gap-x-3 gap-y-0.5 sm:gap-y-1 items-center`}>
                  {email && (
                    <a href={`mailto:${email.trim()}`} className="hover:underline break-all">
                      {email}
                    </a>
                  )}
                  {phone && (
                    <>
                      {email && <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>}
                      <span className="shrink-0">{phone}</span>
                    </>
                  )}
                  {location && (
                    <>
                      {(email || phone) && <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>}
                      <span className="break-words">{location}</span>
                    </>
                  )}
                  {linkedinUrl && (
                    <>
                      {(email || phone || location) && <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>}
                      <a href={formatUrl(linkedinUrl)} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold break-all">
                        LinkedIn
                      </a>
                    </>
                  )}
                  {githubUrl && (
                    <>
                      {(email || phone || location || linkedinUrl) && <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>}
                      <a href={formatUrl(githubUrl)} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold break-all">
                        GitHub
                      </a>
                    </>
                  )}
                  {portfolioUrl && (
                    <>
                      {(email || phone || location || linkedinUrl || githubUrl) && <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>}
                      <a href={formatUrl(portfolioUrl)} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold break-all">
                        Portfolio
                      </a>
                    </>
                  )}
                </div>
              )

              const renderContactColumn = () => (
                <div className="text-[7.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium flex flex-col gap-y-0.5 sm:gap-y-1 break-words">
                  {email && (
                    <a href={`mailto:${email.trim()}`} className="hover:underline break-all">
                      {email}
                    </a>
                  )}
                  {phone && <span className="break-all">{phone}</span>}
                  {location && <span className="break-words">{location}</span>}
                  {linkedinUrl && (
                    <a href={formatUrl(linkedinUrl)} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold break-all">
                      LinkedIn
                    </a>
                  )}
                  {githubUrl && (
                    <a href={formatUrl(githubUrl)} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold break-all">
                      GitHub
                    </a>
                  )}
                  {portfolioUrl && (
                    <a href={formatUrl(portfolioUrl)} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold break-all">
                      Portfolio
                    </a>
                  )}
                </div>
              )

              const renderPreviewSummary = () => professionalSummary ? (
                <div className={previewSectionMargin}>
                  <h2 className={`${previewSectionTitleSize} ${
                    isNavy ? "text-blue-900 dark:text-blue-400" :
                    isCreative ? "text-indigo-950 dark:text-indigo-300 border-l-2 sm:border-l-4 border-indigo-600 pl-1.5 sm:pl-2" :
                    isMinimal || isElegant ? "text-slate-700 dark:text-slate-400" :
                    "text-slate-905 dark:text-white"
                  } ${!isCreative && !isAtsClean ? "border-b " + previewSectionDividerColor : ""} pb-0.5 ${previewSectionHeaderMargin}`}>
                    Professional Summary
                  </h2>
                  <p className={`${previewTextSize} leading-tight sm:leading-relaxed ${previewTextColor} break-words`}>{professionalSummary}</p>
                </div>
              ) : null

              const renderPreviewSkills = () => skills && skills.length > 0 ? (
                <div className={previewSectionMargin}>
                  <h2 className={`${previewSectionTitleSize} ${
                    isNavy ? "text-blue-900 dark:text-blue-400" :
                    isCreative ? "text-indigo-950 dark:text-indigo-300 border-l-2 sm:border-l-4 border-indigo-600 pl-1.5 sm:pl-2" :
                    isMinimal || isElegant ? "text-slate-700 dark:text-slate-400" :
                    "text-slate-905 dark:text-white"
                  } ${!isCreative && !isAtsClean ? "border-b " + previewSectionDividerColor : ""} pb-0.5 ${previewSectionHeaderMargin}`}>
                    Skills & Tech Stack
                  </h2>
                  {typeof (skills as any)[0] === 'string' ? (
                    <p className={`${previewTextSize} leading-tight sm:leading-relaxed ${previewTextColor} font-medium break-words`}>{(skills as any).filter(Boolean).join(",  ")}</p>
                  ) : (
                    <div className={`${previewTextSize} leading-tight sm:leading-relaxed ${previewTextColor} font-medium space-y-0.5`}>
                      {(skills as any).map((cat: any, idx: number) => {
                        const skillsList = Array.isArray(cat.skills) ? cat.skills.filter(Boolean) : [];
                        if (skillsList.length === 0) return null;
                        return (
                          <div key={idx} className="break-words">
                            <strong className={
                              isNavy ? "text-blue-900 dark:text-blue-400" :
                              isCreative ? "text-indigo-950 dark:text-indigo-300" :
                              isMinimal || isElegant ? "text-slate-800 dark:text-slate-200" :
                              "text-slate-950 dark:text-white"
                            }>{cat.category}: </strong>
                            <span>{skillsList.join(",  ")}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null

              const renderPreviewExperience = () => jobs.filter(j => j.company || j.role).length > 0 ? (
                <div className={previewSectionMargin}>
                  <h2 className={`${previewSectionTitleSize} ${
                    isNavy ? "text-blue-900 dark:text-blue-400" :
                    isCreative ? "text-indigo-950 dark:text-indigo-300 border-l-2 sm:border-l-4 border-indigo-600 pl-1.5 sm:pl-2" :
                    isMinimal || isElegant ? "text-slate-700 dark:text-slate-400" :
                    "text-slate-905 dark:text-white"
                  } ${!isCreative && !isAtsClean ? "border-b " + previewSectionDividerColor : ""} pb-0.5 ${previewSectionHeaderMargin}`}>
                    Experience
                  </h2>
                  <div className={isCompact ? "space-y-1 sm:space-y-2" : "space-y-1.5 sm:space-y-3.5"}>
                    {jobs.filter(j => j.company || j.role).map((job, idx) => (
                      <div key={idx}>
                        <div className={`flex flex-wrap items-baseline justify-between ${previewTextSize} font-bold ${
                          isNavy ? "text-blue-900 dark:text-blue-400" :
                          isCreative ? "text-slate-900 dark:text-white" :
                          isMinimal || isElegant ? "text-slate-800 dark:text-white" :
                          "text-slate-950 dark:text-white"
                        } mb-0.5 gap-x-1 gap-y-0.5`}>
                          <span className="break-words">{job.role || "Role"} — {job.company || "Company"}{job.location ? ` (${job.location})` : ""}</span>
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

              const renderPreviewProjects = () => projects.filter(p => p.name).length > 0 ? (
                <div className={previewSectionMargin}>
                  <h2 className={`${previewSectionTitleSize} ${
                    isNavy ? "text-blue-900 dark:text-blue-400" :
                    isCreative ? "text-indigo-950 dark:text-indigo-300 border-l-2 sm:border-l-4 border-indigo-600 pl-1.5 sm:pl-2" :
                    isMinimal || isElegant ? "text-slate-700 dark:text-slate-400" :
                    "text-slate-905 dark:text-white"
                  } ${!isCreative && !isAtsClean ? "border-b " + previewSectionDividerColor : ""} pb-0.5 ${previewSectionHeaderMargin}`}>
                    Projects
                  </h2>
                  <div className={isCompact ? "space-y-1 sm:space-y-2" : "space-y-1.5 sm:space-y-3.5"}>
                    {projects.filter(p => p.name).length > 0 && projects.filter(p => p.name).map((proj, idx) => (
                      <div key={idx}>
                        <div className={`flex flex-wrap items-baseline justify-between ${previewTextSize} font-bold ${
                          isNavy ? "text-blue-900 dark:text-blue-400" :
                          isCreative ? "text-slate-900 dark:text-white" :
                          isMinimal || isElegant ? "text-slate-800 dark:text-white" :
                          "text-slate-950 dark:text-white"
                        } mb-0.5 gap-1`}>
                          <span className="break-words">
                            {proj.name}
                            {proj.projectLink && (
                              <span className="text-[7.5px] sm:text-[10px] font-normal text-slate-400 dark:text-slate-500 ml-1 inline-block">
                                <a href={formatUrl(proj.projectLink)} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
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

              const renderPreviewEducation = () => education.filter(e => e.institution || e.degree).length > 0 ? (
                <div className={previewSectionMargin}>
                  <h2 className={`${previewSectionTitleSize} ${
                    isNavy ? "text-blue-900 dark:text-blue-400" :
                    isCreative ? "text-indigo-950 dark:text-indigo-300 border-l-2 sm:border-l-4 border-indigo-600 pl-1.5 sm:pl-2" :
                    isMinimal || isElegant ? "text-slate-700 dark:text-slate-400" :
                    "text-slate-905 dark:text-white"
                  } ${!isCreative && !isAtsClean ? "border-b " + previewSectionDividerColor : ""} pb-0.5 ${previewSectionHeaderMargin}`}>
                    Education
                  </h2>
                  <div className={isCompact ? "space-y-1 sm:space-y-1.5" : "space-y-1 sm:space-y-3"}>
                    {education.filter(e => e.institution || e.degree).map((edu, idx) => (
                      <div key={idx}>
                        <div className={`flex flex-wrap items-baseline justify-between ${previewTextSize} font-bold ${
                          isNavy ? "text-blue-900 dark:text-blue-400" :
                          isCreative ? "text-slate-900 dark:text-white" :
                          isMinimal || isElegant ? "text-slate-800 dark:text-white" :
                          "text-slate-950 dark:text-white"
                        } gap-x-1 gap-y-0.5`}>
                          <span className="break-words">{edu.degree || "Degree"}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""} — {edu.institution || "Institution"}</span>
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

              const renderPreviewAchievements = () => achievements.filter(Boolean).length > 0 ? (
                <div className={previewSectionMargin}>
                  <h2 className={`${previewSectionTitleSize} ${
                    isNavy ? "text-blue-900 dark:text-blue-400" :
                    isCreative ? "text-indigo-950 dark:text-indigo-300 border-l-2 sm:border-l-4 border-indigo-600 pl-1.5 sm:pl-2" :
                    isMinimal || isElegant ? "text-slate-700 dark:text-slate-400" :
                    "text-slate-905 dark:text-white"
                  } ${!isCreative && !isAtsClean ? "border-b " + previewSectionDividerColor : ""} pb-0.5 ${previewSectionHeaderMargin}`}>
                    Achievements & Certifications
                  </h2>
                  <ul className="list-disc pl-2.5 sm:pl-4 space-y-0.5">
                    {achievements.filter(Boolean).map((achievement, aIdx) => (
                      <li key={aIdx} className={`${previewTextSize} leading-tight sm:leading-relaxed ${previewTextColor} break-words`}>{renderRichText(achievement)}</li>
                    ))}
                  </ul>
                </div>
              ) : null

              const renderPreviewLanguages = () => languages.filter(Boolean).length > 0 ? (
                <div className={previewSectionMargin}>
                  <h2 className={`${previewSectionTitleSize} ${
                    isNavy ? "text-blue-900 dark:text-blue-400" :
                    isCreative ? "text-indigo-950 dark:text-indigo-300 border-l-2 sm:border-l-4 border-indigo-600 pl-1.5 sm:pl-2" :
                    isMinimal || isElegant ? "text-slate-700 dark:text-slate-400" :
                    "text-slate-905 dark:text-white"
                  } ${!isCreative && !isAtsClean ? "border-b " + previewSectionDividerColor : ""} pb-0.5 ${previewSectionHeaderMargin}`}>
                    Languages
                  </h2>
                  <p className={`${previewTextSize} leading-tight sm:leading-relaxed ${previewTextColor} font-medium break-words`}>{languages.filter(Boolean).join(", ")}</p>
                </div>
              ) : null

              return (
                <div
                  id="printable-resume-area"
                  className={`min-h-0 sm:min-h-[800px] w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl sm:rounded-3xl ${previewPadding} shadow-sm sm:shadow-xl shadow-slate-100 dark:shadow-none ${previewFontClass} ${previewTextColor} select-text overflow-hidden transition-all duration-350`}
                >
                  <div className="text-left max-w-full animate-in fade-in duration-500">
                    {/* Modern Photo Sidebar Layout */}
                    {isPhotoSidebar ? (
                      <div className="flex flex-row gap-2.5 sm:gap-6">
                        {/* Left Sidebar (25% on desktop, 28% on mobile) */}
                        <div className="w-[28%] sm:w-[25%] shrink-0 border-r border-slate-200 dark:border-slate-800 pr-2 sm:pr-4 space-y-2 sm:space-y-4">
                          <div className="flex justify-center sm:justify-start">
                            {renderAvatar("w-14 h-14 sm:w-32 sm:h-32")}
                          </div>
                          <div>
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
                        <div className="flex-1 min-w-0 pl-1 sm:pl-2 space-y-2 sm:space-y-4">
                          <div className="pb-1.5 sm:pb-3 border-b-2 border-indigo-600">
                            <h1 className={`${previewTitleSize} font-black text-slate-950 dark:text-white tracking-tight mb-0.5 break-words`}>
                              {name || "Your Name"}
                            </h1>
                            {role && (
                              <p className={`${previewHeadlineSize} font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider break-words`}>
                                {role}
                              </p>
                            )}
                          </div>
                          {renderPreviewSummary()}
                          {renderPreviewExperience()}
                          {renderPreviewProjects()}
                        </div>
                      </div>
                    ) : isPhotoExec ? (
                      /* Executive Headshot Layout */
                      <div>
                        <div className="flex flex-row items-center sm:items-start gap-2.5 sm:gap-5 pb-2.5 sm:pb-4 mb-2.5 sm:mb-4 border-b-2 border-blue-900 dark:border-blue-700">
                          {renderAvatar("w-14 h-14 sm:w-28 sm:h-28")}
                          <div className="flex-1 min-w-0 text-left space-y-0.5 sm:space-y-1">
                            <h1 className={`${previewTitleSize} font-black text-blue-900 dark:text-blue-400 tracking-tight break-words`}>
                              {name || "Your Name"}
                            </h1>
                            {role && (
                              <p className={`${previewHeadlineSize} font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider break-words`}>
                                {role}
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
                        <div className="flex flex-row items-center sm:items-start gap-2.5 sm:gap-5 pb-2 mb-2">
                          {renderAvatar("w-14 h-14 sm:w-28 sm:h-28")}
                          <div className="flex-1 min-w-0 text-left space-y-0.5 sm:space-y-1">
                            <h1 className={`${previewTitleSize} font-black text-slate-950 dark:text-white tracking-tight break-words`}>
                              {name || "Your Name"}
                            </h1>
                            {role && (
                              <p className={`${previewHeadlineSize} font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider break-words`}>
                                {role}
                              </p>
                            )}
                            {renderContactRow()}
                          </div>
                        </div>
                        <div className="h-0.5 sm:h-1 w-full bg-indigo-600 mb-2.5 sm:mb-4" />

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
                            <h1 className={`${previewTitleSize} font-bold text-slate-800 dark:text-white tracking-tight break-words`}>
                              {name || "Your Name"}
                            </h1>
                            {role && (
                              <p className={`${previewHeadlineSize} font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider break-words`}>
                                {role}
                              </p>
                            )}
                            {renderContactRow()}
                          </div>
                          {renderAvatar("w-12 h-12 sm:w-20 sm:h-20")}
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
                        <div className={`flex flex-col text-left mb-2.5 sm:mb-4`}>
                          <h1 className={`${previewTitleSize} font-black tracking-tight mb-0.5 sm:mb-1 text-slate-950 dark:text-white break-words`}>{name || "Your Name"}</h1>
                          {role && (
                            <p className={`${previewHeadlineSize} font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 sm:mb-1.5 break-words`}>{role}</p>
                          )}
                          {renderContactRow()}
                        </div>

                        {/* 2 Column Body: 30% Left / 70% Right side-by-side */}
                        <div className="flex flex-row gap-2.5 sm:gap-6">
                          <div className="w-[30%] sm:w-[30%] shrink-0 space-y-2 sm:space-y-4">
                            {renderPreviewSkills()}
                            {renderPreviewEducation()}
                            {renderPreviewLanguages()}
                            {renderPreviewAchievements()}
                          </div>
                          <div className="flex-1 min-w-0 space-y-2 sm:space-y-4">
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
                        <div className="w-[30%] sm:w-[30%] shrink-0 border-r border-slate-200 dark:border-slate-800 pr-2 sm:pr-4 space-y-2 sm:space-y-4">
                          <div>
                            <h1 className={`${previewTitleSize} font-black text-slate-950 dark:text-white tracking-tight mb-0.5 sm:mb-1 break-words`}>{name || "Your Name"}</h1>
                            {role && (
                              <p className={`${previewHeadlineSize} font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 sm:mb-2 break-words`}>{role}</p>
                            )}
                            {renderContactColumn()}
                          </div>
                          {renderPreviewSkills()}
                          {renderPreviewEducation()}
                          {renderPreviewLanguages()}
                          {renderPreviewAchievements()}
                        </div>
                        {/* Right Main (70%) */}
                        <div className="flex-1 min-w-0 pl-1 sm:pl-2 space-y-2 sm:space-y-4">
                          <div className="pb-1.5 sm:pb-3 border-b-2 border-slate-200 dark:border-slate-800">
                            <h2 className={`${previewSectionTitleSize} text-slate-900 dark:text-white`}>
                              Overview & History
                            </h2>
                          </div>
                          {renderPreviewSummary()}
                          {renderPreviewExperience()}
                          {renderPreviewProjects()}
                        </div>
                      </div>
                    ) : (
                      /* Single Column Layouts: Classic Serif, Modern Minimal, Executive Navy, Compact Tech, Creative Bold, ATS Clean */
                      <div>
                        {/* Header */}
                        <div className={`flex flex-col ${previewHeaderAlign} mb-2.5 sm:mb-4`}>
                          <h1 className={`${previewTitleSize} font-black ${
                            isNavy ? "text-blue-900 dark:text-blue-400" :
                            isMinimal ? "text-slate-800 dark:text-white" :
                            "text-slate-950 dark:text-white"
                          } tracking-tight mb-0.5 sm:mb-1 break-words`}>{name || "Your Name"}</h1>
                          {role && (
                            <p className={`${previewHeadlineSize} font-bold ${
                              isNavy ? "text-blue-900 dark:text-blue-400" :
                              isCreative ? "text-indigo-600 dark:text-indigo-400 font-extrabold" :
                              isMinimal ? "text-slate-600 dark:text-slate-450" :
                              "text-slate-700 dark:text-slate-300"
                            } uppercase tracking-wider mb-1 sm:mb-1.5 break-words`}>{role}</p>
                          )}
                          {isCreative && <div className="h-0.5 sm:h-1 w-full bg-indigo-600 rounded-full my-1.5 sm:my-2" />}
                          {renderContactRow()}
                        </div>

                        {renderPreviewSummary()}
                        {renderPreviewSkills()}
                        {renderPreviewEducation()}
                        {renderPreviewExperience()}
                        {renderPreviewProjects()}
                        {renderPreviewAchievements()}
                        {renderPreviewLanguages()}
                      </div>
                    )}
                  </div>
                </div>
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
              Use 1 Credit to Generate Resume?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
              Generating an ATS-optimized resume with AI will deduct <strong className="text-slate-900 dark:text-white font-bold">1 credit</strong> from your account balance.
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
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md"
              onClick={handleConfirmCreditDeduction}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Confirm & Use 1 Credit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
