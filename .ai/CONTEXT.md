# CONTEXT.md

Version: 2.0

Project: JobsDart

Status: Active Development

Last Updated: 2026-08-02

---

# Project Identity

JobsDart is an AI-powered international hiring platform.

The platform connects

- Job Seekers
- Recruiters
- Companies

JobsDart is NOT a referral platform.

Referral functionality has been permanently removed from the product roadmap.

The platform is evolving into a scalable international job marketplace with AI-powered career tools.

---

# Product Vision

Build the world's most intelligent AI-powered hiring platform.

The platform should provide

- Personalized recommendations
- Fast search
- AI career assistance
- AI resume tools
- AI interview preparation
- International hiring

Every engineering decision should support this vision.

---

# Current Product Direction

Current Sprint

International Platform Migration

Objectives

- Remove referral architecture
- Remove domain architecture
- Refactor database
- Improve recommendation engine
- Improve search engine
- Support international hiring
- Improve scalability

---

# Product Principles

The platform should always be

Simple

Fast

Reliable

Secure

Scalable

Maintainable

International

AI Powered

---

# Users

Guest

Job Seeker

Recruiter

Company Administrator

Platform Administrator

No additional roles exist.

---

# Recommendation Philosophy

Recommendations NEVER use Domains.

Recommendations are generated using

Skills

Preferred Job Titles

Experience

Industry

Salary Expectations

Location

Remote Preference

User Activity

Saved Jobs

Recently Viewed Jobs

Application History

Company Quality

Job Freshness

If any code depends on Domains, it is legacy code and should be removed.

---

# Search Philosophy

Search uses

Keywords

Skills

Job Titles

Companies

Country

City

Salary

Experience

Employment Type

Remote Type

Industry

Search should prioritize relevance.

Never exact matching only.

---

# AI Features

Current

Resume Builder

ATS Score

AI Interview

Future

Career Coach

Salary Prediction

Learning Recommendations

Skill Gap Analysis

Resume Optimization

Company Insights

AI features should remain independent services.

---

# International Rules

The platform supports

All Countries

All Currencies

All Languages

All Timezones

Remote Worldwide Jobs

Visa Sponsorship

Work Authorization

Never hardcode

INR

India

Indian States

Indian Cities

Country-specific assumptions

---

# Tech Stack

Frontend

Next.js

React

TypeScript

Tailwind CSS

shadcn/ui

Backend

Next.js API Routes

Database

Supabase PostgreSQL

Authentication

Supabase Auth

Storage

Cloudflare R2

Payments

PayPal

Deployment

Vercel

---

# Preferred Architecture

Presentation Layer

↓

API Layer

↓

Service Layer

↓

Repository Layer

↓

Database

Business logic belongs inside Services.

Database access belongs inside Repositories.

---

# Current Folder Structure

app/

components/

features/

services/

repositories/

hooks/

lib/

types/

database/

public/

docs/

.ai/

The project should remain modular.

---

# Database Principles

Use PostgreSQL.

Every table requires

Primary Key

Created At

Updated At

Soft Delete support where applicable

Foreign Keys

Indexes

Never remove data without migrations.

---

# Coding Standards

TypeScript Strict Mode

Small Components

Reusable Hooks

Reusable Services

Centralized Validation

Consistent Naming

No duplicated logic

Meaningful file names

No hardcoded values

---

# API Standards

REST APIs

Versioned Endpoints

Consistent Responses

Validation

Authorization

Pagination

Sorting

Filtering

Proper Error Codes

---

# Security Principles

Authentication required.

Authorization required.

Input validation required.

Parameterized queries only.

Never expose secrets.

Never expose stack traces.

Never trust client input.

---

# Performance Principles

Lazy Loading

Pagination

Caching

Optimized Images

Indexed Database

Minimal Queries

Background Processing

Avoid N+1 Queries

---

# Deprecated Architecture

The following systems are deprecated and should not be used in new development.

Referral Engine

Domain-based Recommendations

Domain-based Homepage

Domain Preferences

Referral Credits

Referral Rewards

Referral Chat

Referral Dashboard

Legacy Recommendation Logic

Legacy Search Logic

---

# Active Modules

Authentication

User Profiles

Companies

Recruiters

Jobs

Applications

Recommendations

Search

Resume Builder

ATS Score

AI Interview

Notifications

Payments

Subscriptions

Analytics

Administration

---

# Future Modules

Career Coach

Resume Marketplace

Salary Intelligence

Learning Platform

Interview Scheduling

Video Interviews

Company Reviews

Employer Branding

Recruiter AI Assistant

Company AI Assistant

---

# Engineering Rules

Prefer

Reuse

Composition

Small Functions

Services

Repository Pattern

Do not

Duplicate Logic

Hardcode Values

Modify Unrelated Files

Introduce Breaking Changes

Refactor Unrelated Code

---

# AI Development Workflow

Before coding

Read

CONTEXT.md

↓

AI_RULES.md

↓

CURRENT_SPRINT.md

↓

BUSINESS_RULES.md

↓

SYSTEM_ARCHITECTURE.md

↓

DATABASE_SCHEMA.md

↓

IMPLEMENTATION_TASKS.md

After reading

Explain the implementation plan.

List affected files.

Identify risks.

Implement one task only.

Update CHANGELOG.md.

Stop.

---

# Current Priorities

Priority 1

Remove legacy referral system.

Priority 2

Remove domain architecture.

Priority 3

Database migration.

Priority 4

Recommendation Engine.

Priority 5

Search Engine.

Priority 6

Homepage Personalization.

Priority 7

Frontend Cleanup.

Priority 8

Testing.

---

# Files That Must Never Be Modified Without Approval

Authentication

Payment Gateway

Subscription Logic

Database Migrations (existing)

Environment Configuration

Security Middleware

Role Permissions

---

# Definition of Success

JobsDart should become

International

AI Powered

Fast

Reliable

Maintainable

Scalable

Secure

Developer Friendly

AI Friendly

Every implementation should move the project closer to these goals.

---

# Final Rule

Whenever there is uncertainty

Do not guess.

Read the documentation.

If documentation is missing

Ask for clarification instead of inventing functionality.

---

END OF DOCUMENT