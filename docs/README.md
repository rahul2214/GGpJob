# JobsDart

> AI-Powered International Job Platform

---

# Overview

JobsDart is a modern international job platform designed to connect Job Seekers, Recruiters, and Companies through an intelligent, scalable, and AI-powered hiring ecosystem.

Unlike traditional job portals, JobsDart focuses on delivering highly personalized job recommendations, advanced search capabilities, AI-assisted career tools, and an exceptional user experience for candidates and employers worldwide.

The platform supports multiple countries, currencies, languages, and hiring models while maintaining high performance and scalability.

---

# Vision

To become the world's most intelligent AI-powered hiring platform by helping job seekers discover better opportunities and enabling companies to hire the right talent faster.

---

# Mission

- Simplify global hiring.
- Reduce hiring time.
- Improve job discovery using AI.
- Provide personalized career guidance.
- Make hiring accessible worldwide.

---

# Target Users

## Job Seekers

People searching for

- Full-Time Jobs
- Part-Time Jobs
- Internships
- Contract Jobs
- Remote Jobs
- Hybrid Jobs
- Freelance Opportunities

---

## Recruiters

Recruiters can

- Create Jobs
- Manage Applications
- Schedule Interviews
- Track Candidates
- Shortlist Applicants
- Communicate with Candidates

---

## Companies

Companies can

- Create Company Profiles
- Manage Recruiters
- Purchase Hiring Plans
- View Hiring Analytics
- Build Employer Branding

---

# Core Features

## Job Search

- AI-powered recommendations
- Keyword search
- Location search
- Remote jobs
- Salary filters
- Experience filters
- Skills matching
- Saved jobs

---

## AI Features

- AI Resume Builder
- ATS Resume Score
- AI Resume Improvement
- AI Interview Practice
- AI Career Suggestions
- AI Skill Gap Analysis

---

## Recruiter Features

- Job Posting
- Candidate Management
- Applicant Tracking
- Company Dashboard
- Hiring Analytics

---

## Company Features

- Company Profile
- Recruiter Management
- Branding
- Subscription Plans
- Analytics Dashboard

---

# Technology Stack

## Frontend

- Next.js (App Router)
- TypeScript
- React
- Tailwind CSS
- shadcn/ui

---

## Backend

- Next.js API Routes

---

## Database

- PostgreSQL
- Supabase

---

## Authentication

- Supabase Auth

---

## Storage

- Cloudflare R2

---

## Payments

- PayPal
- International Currency Support

---

## Notifications

- Email
- Push Notifications
- In-App Notifications

---

# Recommendation Philosophy

Jobs are never recommended based on Domains.

Recommendations are generated using

- Skills
- Preferred Job Titles
- Experience
- Country
- Remote Preference
- Salary
- Industry
- User Activity
- Company Quality
- Job Freshness

---

# Search Philosophy

Users should discover jobs using

- Keywords
- Skills
- Job Titles
- Company
- Country
- City
- Salary
- Experience
- Employment Type
- Remote Type

---

# International Support

The platform supports

- Multiple Countries
- Multiple Languages
- Multiple Timezones
- Multiple Currencies
- Visa Sponsorship
- Remote Worldwide Jobs

No country-specific logic should exist unless required by local regulations.

---

# User Roles

- Guest
- Job Seeker
- Recruiter
- Company Admin
- Super Admin

---

# Subscription Plans

## Job Seekers

- Free
- Premium

## Recruiters

- Starter
- Professional
- Enterprise

---

# High-Level Architecture

```
Browser
     │
     ▼
Next.js Frontend
     │
     ▼
API Routes
     │
     ▼
Business Services
     │
     ▼
Database Layer
     │
     ▼
Supabase PostgreSQL
```

---

# Repository Structure

```
app/
components/
hooks/
services/
lib/
types/
database/
public/
docs/
```

---

# Documentation

Project documentation is located inside

```
/docs
```

Important files

```
PROJECT_OVERVIEW.md
BUSINESS_RULES.md
SYSTEM_ARCHITECTURE.md
DATABASE_SCHEMA.md
API_SPECIFICATION.md
JOB_RECOMMENDATION_ENGINE.md
JOB_SEARCH_ENGINE.md
AUTHENTICATION.md
USER_ROLES.md
AI_RULES.md
IMPLEMENTATION_TASKS.md
CHANGELOG.md
```

---

# Development Principles

- Clean Architecture
- SOLID Principles
- Modular Design
- Type Safety
- Reusable Components
- API First
- Performance First
- Security First
- AI Assisted Development

---

# Coding Standards

- TypeScript Strict Mode
- No duplicated business logic
- Small reusable components
- Service Layer Pattern
- Repository Pattern
- Centralized Validation
- Proper Error Handling
- Production Logging

---

# Performance Goals

- First Load < 2 seconds
- Lighthouse > 90
- API Response < 300 ms
- Optimized Images
- Lazy Loading
- Pagination
- Query Optimization

---

# Security

- Authentication Required
- Authorization Based on Roles
- Secure API Validation
- SQL Injection Protection
- XSS Protection
- CSRF Protection
- Rate Limiting

---

# Project Status

Current Phase

International Platform Refactor

Major Focus

- Remove Domain Architecture
- International Job Matching
- AI Recommendation Engine
- Search Optimization
- Performance Improvements

---

# Maintainers

JobsDart Engineering Team

---

# License

Private Proprietary Software

Copyright © JobsDart. All Rights Reserved.