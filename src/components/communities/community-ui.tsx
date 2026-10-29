import {
  Apple, Atom, Braces, Building2, Cloud, Coffee, Compass, Cpu, Database, FileText, Framer,
  GitBranch, Globe, GraduationCap, Laptop, Layers, Palette, Server, ShieldAlert, Smartphone, Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Icons an admin can assign to a community.
 *
 * Listed explicitly instead of `import * as Icons from "lucide-react"`, which
 * pulled the entire icon library into every community page bundle.
 */
const COMMUNITY_ICONS: Record<string, LucideIcon> = {
  Apple, Atom, Braces, Building2, Cloud, Coffee, Compass, Cpu, Database, FileText, Framer,
  GitBranch, Globe, GraduationCap, Laptop, Layers, Palette, Server, ShieldAlert, Smartphone, Users,
  Android: Smartphone,
};

export function CommunityIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && COMMUNITY_ICONS[name]) || Users;
  return <Icon className={className} aria-hidden="true" />;
}

export const COMMUNITY_CATEGORIES = [
  { value: "All", label: "All" },
  { value: "Technology", label: "Technology" },
  { value: "Career", label: "Career" },
  { value: "Countries", label: "Countries" },
  { value: "Companies", label: "Companies" },
] as const;

export const POST_TYPE_LABELS: Record<string, string> = {
  discussion: "Discussion",
  question: "Question",
  experience: "Interview experience",
  review: "Resume review",
  resource: "Resource",
  job: "Job",
  announcement: "Announcement",
};

export function postTypeLabel(type?: string | null) {
  if (!type) return "Discussion";
  return POST_TYPE_LABELS[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1);
}

export function PostTypeBadge({ type, className }: { type?: string | null; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300", className)}>
      {postTypeLabel(type)}
    </span>
  );
}

/** "3h ago", "2d ago", then a short date — readable and stable across locales. */
export function formatRelativeDate(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
}

export function Avatar({ name, size = "md" }: { name?: string | null; size?: "sm" | "md" }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
        size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm"
      )}
    >
      {initial}
    </span>
  );
}
