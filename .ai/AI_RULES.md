# AI_RULES.md

Version: 2.0

Project: JobsDart

Status: Production

---

# Purpose

This document defines how AI coding assistants must behave while working on the JobsDart codebase.

These rules override default AI behavior whenever possible.

The objective is to ensure that AI-generated code remains consistent, maintainable, scalable, secure, and aligned with the project's architecture.

---

# Before Making Any Changes

Always read the following documents before writing code.

Required Reading Order

1. README.md
2. PROJECT_OVERVIEW.md
3. BUSINESS_RULES.md
4. SYSTEM_ARCHITECTURE.md
5. DATABASE_SCHEMA.md
6. API_SPECIFICATION.md
7. IMPLEMENTATION_TASKS.md
8. CHANGELOG.md

Never start implementing features without understanding the existing architecture.

---

# Primary Goal

Your objective is NOT to generate code.

Your objective is to improve JobsDart while preserving architecture consistency.

Prefer maintainability over speed.

Prefer clean architecture over shortcuts.

Prefer reusable solutions over duplicated logic.

---

# Project Philosophy

JobsDart is

- International
- AI Powered
- Performance Focused
- Secure
- Modular
- Scalable

Every implementation must support these principles.

---

# Scope Rules

Only modify files required for the current task.

Never refactor unrelated modules.

Never modify unrelated business logic.

Never perform unnecessary formatting changes.

Never rename files unless instructed.

---

# Think Before Coding

Before modifying files

Analyze

Current architecture

Dependencies

Business rules

Potential side effects

Breaking changes

Then explain the implementation plan.

Never immediately generate code.

---

# File Modification Rules

Before editing

List every file you intend to modify.

Example

Frontend

Backend

Database

API

Types

Validation

Tests

Documentation

Do not modify additional files without explaining why.

---

# Large Tasks

Never attempt to implement an entire architectural refactor in one step.

Split work into milestones.

Each milestone should be independently testable.

Stop after completing one milestone.

Wait for approval.

---

# Git Rules

Treat every milestone as a Git commit.

Recommended commit size

5-20 files

Never generate a commit affecting hundreds of files.

---

# Architecture Rules

Follow

Clean Architecture

Service Layer

Repository Pattern

Dependency Injection where appropriate

Single Responsibility Principle

SOLID Principles

Never place business logic inside UI components.

Never place SQL inside React components.

Never duplicate business logic.

---

# Frontend Rules

Frontend responsibilities

Display data

Collect user input

Validation

Navigation

Loading states

Error states

Accessibility

Frontend must not contain business rules.

Business logic belongs in Services.

---

# Backend Rules

Backend is responsible for

Business Logic

Validation

Authorization

Recommendation

Search

Notifications

Payments

Database Operations

Never move backend logic into frontend.

---

# Database Rules

Never remove production tables without migrations.

Never modify schemas directly.

Always create migrations.

Every migration must be reversible.

Always preserve data.

Never drop columns without approval.

---

# API Rules

Every API must

Validate Input

Authorize User

Return Consistent Responses

Return Proper Status Codes

Log Errors

Support Pagination

Support Filtering

Support Sorting

Never expose internal errors.

---

# Authentication Rules

Never modify authentication unless requested.

Never bypass authorization.

Never disable validation.

Never expose secrets.

Never hardcode credentials.

---

# Recommendation Rules

Jobs are never recommended using Domains.

Recommendations use

Skills

Job Titles

Experience

Location

Salary

Remote Preference

Industry

User Behaviour

Company Quality

Freshness

Never reintroduce Domain logic.

---

# Search Rules

Search should use

Skills

Titles

Location

Salary

Employment Type

Experience

Industry

Never depend on Domain categories.

---

# International Rules

Never assume

India

Indian Currency

Indian Timezone

Indian Address Format

Every implementation must support

Multiple Countries

Multiple Currencies

Multiple Languages

Multiple Timezones

Remote Worldwide Jobs

---

# Coding Standards

Always use

TypeScript

Strict typing

Interfaces

Reusable utilities

Meaningful naming

Small functions

Avoid

any

Magic numbers

Duplicate code

Nested business logic

Large components

---

# Component Rules

Components should

Be reusable

Be composable

Remain small

Handle one responsibility

Avoid unnecessary props

Prefer composition over inheritance.

---

# Service Rules

Business logic belongs inside Services.

Examples

RecommendationService

SearchService

PaymentService

NotificationService

ResumeService

Never duplicate service logic.

---

# Validation Rules

Validation should exist

Frontend

Backend

Database

Never trust client-side validation alone.

---

# Error Handling

Never swallow exceptions.

Never expose stack traces.

Return user-friendly messages.

Log technical details.

---

# Performance Rules

Always consider

Database indexes

Caching

Pagination

Lazy loading

Query optimization

Avoid

N+1 queries

Unnecessary API calls

Repeated calculations

Large payloads

---

# Security Rules

Protect against

SQL Injection

XSS

CSRF

Broken Authentication

Broken Authorization

Sensitive Data Exposure

Never log

Passwords

Tokens

Payment details

Secrets

---

# Documentation Rules

Whenever architecture changes

Update

Architecture docs

Business rules

API docs

Database docs

Implementation tasks

Change log

Documentation is part of the feature.

---

# Testing Rules

Every feature should include

Unit Tests

Integration Tests

API Tests

Edge Cases

Validation Tests

Regression Tests

Never skip testing.

---

# Refactoring Rules

Refactor only when necessary.

Never refactor unrelated modules.

Always preserve behaviour.

Do not introduce breaking changes.

---

# Deletion Rules

Before deleting

Explain

Why it is obsolete

What replaces it

Potential impact

Never delete

Authentication

Payments

Subscriptions

Notifications

Core services

Without approval.

---

# Dependencies

Avoid introducing new packages.

Reuse existing libraries whenever possible.

Only recommend new dependencies if they provide significant value.

Explain why.

---

# AI Generated Code

Generated code must

Compile successfully

Pass linting

Pass type checking

Be documented

Follow project conventions

Avoid placeholders

Avoid TODO comments unless requested

---

# Communication

Before implementation

Provide

Implementation plan

Files affected

Dependencies

Risks

After implementation

Provide

Files modified

Summary

Remaining work

Testing completed

Known limitations

Then stop.

---

# Definition of Done

A task is complete only when

Business rules implemented

Frontend updated

Backend updated

Database updated

API updated

Validation added

Tests completed

Documentation updated

No lint errors

No type errors

No console errors

No duplicate logic

---

# Absolute Restrictions

Never

Invent database tables

Invent API endpoints

Invent business rules

Invent user roles

Invent subscription plans

Invent validation rules

Invent configuration values

If information is missing

Ask for clarification.

---

# Current Product Direction

JobsDart is migrating to an international hiring platform.

Domain-based recommendations have been permanently removed.

Recommendation is based on

Skills

Experience

Location

Job Titles

Industry

Salary

Remote Preference

User Behaviour

Company Quality

Freshness

Do not introduce any new feature that depends on Domains.

---

# Final Rule

Every decision should answer one question.

"Will this make JobsDart easier to maintain, easier to scale, and easier for users to use?"

If the answer is no,

do not implement it.

---

END OF DOCUMENT