/**
 * Everything that renders on /blog.
 *
 * Post content lives one file per post in src/content/blog/, named after its
 * slug. This module is the only place that knows the full set, so adding a post
 * means creating its file and adding one import line here.
 *
 * Held in plain, dependency-free modules (no CMS, no markdown parser) so the
 * pages can be statically prerendered at build time. That matters here: static
 * pages were the only ones that stayed up — and stayed indexed — during the
 * serverless outage, and a blog only earns its keep if crawlers can always
 * reach it.
 *
 * Each post targets a keyword cluster around AI and hiring, and links back to
 * the ATS checker, the resume builder and the job search so the traffic has
 * somewhere to convert.
 *
 * A post's `slug` is its public URL. Renaming a file is free; changing a slug
 * breaks a live URL and needs a redirect, so treat slugs as permanent.
 */

import type { BlogPost } from './types';

import howToUseAiForJobSearch from '@/content/blog/how-to-use-ai-for-job-search';
import willAiTakeMyJob from '@/content/blog/will-ai-take-my-job';
import howApplicantTrackingSystemsWork from '@/content/blog/how-applicant-tracking-systems-work';
import aiResumeWritingGuide from '@/content/blog/ai-resume-writing-guide';
import highestPayingAiJobs from '@/content/blog/highest-paying-ai-jobs';
import aiInterviewPreparation from '@/content/blog/ai-interview-preparation';
import aiSkillsInDemand from '@/content/blog/ai-skills-in-demand';
import whatIsAgi from '@/content/blog/what-is-agi';
import promptEngineeringJobs from '@/content/blog/prompt-engineering-jobs';
import aiJobsForFreshers from '@/content/blog/ai-jobs-for-freshers';
import howToLearnAiFromScratch from '@/content/blog/how-to-learn-ai-from-scratch';
import aiEngineerVsDataScientist from '@/content/blog/ai-engineer-vs-data-scientist';
import whatAreAiAgents from '@/content/blog/what-are-ai-agents';
import aiJobsWithoutCoding from '@/content/blog/ai-jobs-without-coding';
import areAiCertificationsWorthIt from '@/content/blog/are-ai-certifications-worth-it';
import howCompaniesUseAiInHiring from '@/content/blog/how-companies-use-ai-in-hiring';

// Batch 1 — AI engineering, security and governance
import whatIsContextEngineering from '@/content/blog/what-is-context-engineering';
import mcpExplainedForDevelopers from '@/content/blog/mcp-explained-for-developers';
import vibeCoding from '@/content/blog/vibe-coding';
import llmopsVsMlops from '@/content/blog/llmops-vs-mlops';
import aiSecurityJobs from '@/content/blog/ai-security-jobs';
import howToBecomeAnAiSecurityEngineer from '@/content/blog/how-to-become-an-ai-security-engineer';
import aiEvaluationLlmEvals from '@/content/blog/ai-evaluation-llm-evals';
import aiGovernanceJobs from '@/content/blog/ai-governance-jobs';
import physicalAiRoboticsJobs from '@/content/blog/physical-ai-robotics-jobs';
import aiInferenceEngineer from '@/content/blog/ai-inference-engineer';

// Batch 2 — career roadmaps and developer tech
import aiProductManagerRoadmap from '@/content/blog/ai-product-manager-roadmap';
import dataEngineerRoadmap from '@/content/blog/data-engineer-roadmap';
import cloudEngineerRoadmap from '@/content/blog/cloud-engineer-roadmap';
import cybersecurityRoadmap from '@/content/blog/cybersecurity-roadmap';
import devopsEngineerRoadmap from '@/content/blog/devops-engineer-roadmap';
import pythonDeveloperRoadmap from '@/content/blog/python-developer-roadmap';
import fullStackDeveloperRoadmap from '@/content/blog/full-stack-developer-roadmap';
import react19ForDevelopers from '@/content/blog/react-19-for-developers';
import nextjs16ForDevelopers from '@/content/blog/nextjs-16-for-developers';
import dotnet10Csharp14 from '@/content/blog/dotnet-10-csharp-14';

// Batch 3 — global careers, job search safety and interview guides
import gccJobsInIndia from '@/content/blog/gcc-jobs-in-india';
import internationalJobsFromIndia from '@/content/blog/international-jobs-from-india';
import remoteTechJobs from '@/content/blog/remote-tech-jobs';
import visaSponsorshipTechJobs from '@/content/blog/visa-sponsorship-tech-jobs';
import fakeJobOfferScams from '@/content/blog/fake-job-offer-scams';
import fakeRecruiterScams from '@/content/blog/fake-recruiter-scams';
import aiEngineerInterviewQuestions from '@/content/blog/ai-engineer-interview-questions';
import aiAgentInterviewQuestions from '@/content/blog/ai-agent-interview-questions';
import dataEngineerInterviewQuestions from '@/content/blog/data-engineer-interview-questions';
import cybersecurityInterviewQuestions from '@/content/blog/cybersecurity-interview-questions';

/**
 * Declaration order is not display order — getAllPosts sorts by date — so a new
 * post can simply be appended.
 */
export const BLOG_POSTS: BlogPost[] = [
  howToUseAiForJobSearch,
  willAiTakeMyJob,
  howApplicantTrackingSystemsWork,
  aiResumeWritingGuide,
  highestPayingAiJobs,
  aiInterviewPreparation,
  aiSkillsInDemand,
  whatIsAgi,
  promptEngineeringJobs,
  aiJobsForFreshers,
  howToLearnAiFromScratch,
  aiEngineerVsDataScientist,
  whatAreAiAgents,
  aiJobsWithoutCoding,
  areAiCertificationsWorthIt,
  howCompaniesUseAiInHiring,

  whatIsContextEngineering,
  mcpExplainedForDevelopers,
  vibeCoding,
  llmopsVsMlops,
  aiSecurityJobs,
  howToBecomeAnAiSecurityEngineer,
  aiEvaluationLlmEvals,
  aiGovernanceJobs,
  physicalAiRoboticsJobs,
  aiInferenceEngineer,

  aiProductManagerRoadmap,
  dataEngineerRoadmap,
  cloudEngineerRoadmap,
  cybersecurityRoadmap,
  devopsEngineerRoadmap,
  pythonDeveloperRoadmap,
  fullStackDeveloperRoadmap,
  react19ForDevelopers,
  nextjs16ForDevelopers,
  dotnet10Csharp14,

  gccJobsInIndia,
  internationalJobsFromIndia,
  remoteTechJobs,
  visaSponsorshipTechJobs,
  fakeJobOfferScams,
  fakeRecruiterScams,
  aiEngineerInterviewQuestions,
  aiAgentInterviewQuestions,
  dataEngineerInterviewQuestions,
  cybersecurityInterviewQuestions,
];

export * from './types';

/** Anchor id for a section heading, used by the in-article table of contents. */
export function sectionId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}

/**
 * The fields a listing card needs, and nothing else.
 *
 * The blog index filters and searches on the client, so this data crosses the
 * server/client boundary and is serialised into the page payload. Passing whole
 * posts would ship every article body — roughly 300KB of prose nobody reading
 * the index has asked for. This keeps that payload proportional to the cards
 * actually rendered.
 */
export interface BlogPostSummary {
  slug: string;
  heading: string;
  excerpt: string;
  category: string;
  readingMinutes: number;
  publishedAt: string;
}

export function getPostSummaries(): BlogPostSummary[] {
  return getAllPosts().map(({ slug, heading, excerpt, category, readingMinutes, publishedAt }) => ({
    slug,
    heading,
    excerpt,
    category,
    readingMinutes,
    publishedAt,
  }));
}

/**
 * Cards per page on the blog index.
 *
 * Page 1 lives at /blog, the rest at /blog/page/2 onwards. Page 1 spends one of
 * its slots on the featured card, so every page shows this many posts either
 * way.
 */
export const POSTS_PER_PAGE = 20;

export function getTotalPages(): number {
  return Math.max(1, Math.ceil(BLOG_POSTS.length / POSTS_PER_PAGE));
}

/** True for a page number that actually exists, used to 404 the rest. */
export function isValidPage(page: number): boolean {
  return Number.isInteger(page) && page >= 1 && page <= getTotalPages();
}

/** Summaries shown on one page, newest first. Pages are 1-indexed. */
export function getPageSummaries(page: number): BlogPostSummary[] {
  const start = (page - 1) * POSTS_PER_PAGE;
  return getPostSummaries().slice(start, start + POSTS_PER_PAGE);
}

/**
 * Full posts for one page, used to build that page's JSON-LD.
 *
 * Each page lists only its own posts: repeating all of them on every page would
 * tell a crawler the same thing three times and describe content that is not on
 * the page it is reading.
 */
export function getPagePosts(page: number): BlogPost[] {
  const start = (page - 1) * POSTS_PER_PAGE;
  return getAllPosts().slice(start, start + POSTS_PER_PAGE);
}

export function getRelatedPosts(post: BlogPost): BlogPost[] {
  return (post.related || [])
    .map(getPostBySlug)
    .filter((p): p is BlogPost => Boolean(p));
}

/** Word count drives the reading estimate shown on the index and article pages. */
export function wordCount(post: BlogPost): number {
  const body = post.sections
    .flatMap(s => [s.heading, ...s.paragraphs, ...(s.bullets || [])])
    .join(' ');
  const faqs = (post.faqs || []).flatMap(f => [f.q, f.a]).join(' ');
  return `${post.excerpt} ${body} ${faqs}`.split(/\s+/).filter(Boolean).length;
}
