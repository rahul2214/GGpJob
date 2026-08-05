# BUSINESS_RULES.md

Version: 2.0

Status: Production

Last Updated: 2026-08-02

---

# Purpose

This document defines every business rule implemented within JobsDart.

These rules are the source of truth for:

- Backend Development
- Frontend Development
- Database Design
- APIs
- AI Recommendation Engine
- AI Coding Agents
- QA Testing

Whenever a conflict exists between implementation and this document, this document takes priority.

---

# Product Principles

JobsDart is an International AI Powered Job Platform.

The platform is built around five principles.

1. Relevance

Users should always receive relevant jobs instead of random jobs.

---

2. Simplicity

Every workflow should require the minimum number of clicks.

---

3. International First

Every feature must work globally.

No feature should assume India-specific logic.

---

4. Performance

Every feature must scale to millions of users.

---

5. Trust

Users should trust recommendations, companies and application status.

---

# Platform Users

The platform supports the following user types.

Guest

Job Seeker

Recruiter

Company Administrator

Platform Administrator

No additional roles should exist unless approved.

---

# Guest Rules

Guests may

✔ Search jobs

✔ View companies

✔ View public job details

✔ Browse public pages

Guests cannot

✖ Apply for jobs

✖ Save jobs

✖ Chat

✖ Purchase subscriptions

✖ Access AI features

✖ View application history

---

# Job Seeker Rules

A Job Seeker owns one account.

A Job Seeker may

Create profile

Upload resume

Create multiple resumes

Use Resume Builder

Use ATS Score

Use AI Interview

Search jobs

Save jobs

Apply jobs

Receive recommendations

Track applications

Update profile

Purchase Premium

Delete account

A Job Seeker cannot

Create companies

Post jobs

Manage recruiters

Approve applications

Access admin dashboards

---

# Recruiter Rules

Every recruiter belongs to one company.

Recruiters cannot exist without a company.

Recruiters may

Create jobs

Edit jobs

Pause jobs

Close jobs

View applicants

Reject candidates

Shortlist candidates

Schedule interviews

Manage hiring stages

Recruiters cannot

Modify subscription plans

Delete company

Manage billing

Access platform analytics

Access other companies

---

# Company Rules

A company owns one company profile.

One company can have multiple recruiters.

A company administrator may

Invite recruiters

Remove recruiters

Manage branding

Purchase subscriptions

View analytics

Manage hiring

Company profiles require

Company Name

Logo

Description

Industry

Website

Country

City

Company Size

Verification Status

Incomplete profiles cannot publish jobs.

---

# Administrator Rules

Platform administrators have unrestricted access.

Administrators can

Suspend users

Suspend companies

Delete jobs

Refund payments

Approve disputes

Manage subscriptions

Configure platform settings

View analytics

Administrators should never directly modify user resumes.

---

# Registration Rules

Registration methods

Email

Google

Future

LinkedIn

GitHub

Microsoft

Every account must have

Unique email

Verified email

Password (unless OAuth)

Accepted Terms

Accepted Privacy Policy

---

# Authentication Rules

Every protected endpoint requires authentication.

Sessions expire automatically.

Expired sessions require login.

Multiple active sessions are allowed.

Password reset tokens expire.

Email verification required.

---

# User Profile Rules

Every Job Seeker profile includes

Basic Information

Skills

Experience

Education

Work Experience

Languages

Resume

Preferred Job Titles

Salary Expectations

Remote Preference

Location

Open To Relocate

Open Worldwide

Work Authorization

Visa Requirements

Missing profile information reduces recommendation quality.

---

# Resume Rules

Users may upload multiple resumes.

Only one resume can be Primary.

Supported formats

PDF

DOC

DOCX

Maximum size

10 MB

Deleted resumes cannot be recovered.

---

# Skills Rules

Skills are reusable entities.

No duplicate skills.

Skills support aliases.

Example

JS

JavaScript

Both map to JavaScript.

Skills influence

Recommendations

Search

ATS Score

Resume Builder

Analytics

---

# Preferred Job Titles

Users may choose multiple preferred job titles.

Examples

Software Engineer

Backend Engineer

Frontend Engineer

DevOps Engineer

Full Stack Engineer

Recommendations prioritize preferred titles.

---

# Location Rules

Every user profile stores

Country

State

City

Latitude

Longitude

Location is used only for recommendation relevance.

Users may enable

Open To Relocate

Open Worldwide

Remote Only

Hybrid

Onsite

---

# International Rules

JobsDart supports worldwide hiring.

No feature should assume

Indian Rupee

Indian Time

Indian Cities

Indian States

Country-specific formatting should be automatic.

---

# Currency Rules

Each user has

Preferred Currency

Jobs store

Original Currency

Converted Currency

Exchange rates are updated regularly.

Jobs should display in the user's preferred currency when conversion is available.

Original salary must always remain stored.

---

# Job Posting Rules

Every job requires

Title

Company

Location

Employment Type

Experience

Description

Responsibilities

Requirements

Salary (optional)

Skills

Expiry Date

Recruiter

Status

Draft jobs are invisible.

Expired jobs are hidden.

Closed jobs are hidden.

---

# Job Status

Allowed statuses

Draft

Published

Paused

Closed

Expired

Deleted

Only Published jobs appear in search.

---

# Employment Types

Supported

Full Time

Part Time

Internship

Contract

Temporary

Freelance

Volunteer

---

# Workplace Types

Supported

Remote

Hybrid

Onsite

Worldwide Remote

---

# Salary Rules

Salary is optional.

When provided

Minimum Salary

Maximum Salary

Currency

Salary Period

Supported salary periods

Hourly

Monthly

Yearly

Salary ranges must validate

Minimum <= Maximum

---

# Experience Rules

Supported

Fresher

0-1

1-3

3-5

5-8

8+

Jobs should never require negative experience.

---

# Skills Matching Rules

Recommendations prioritize

Exact matches

Related matches

Skill aliases

Partial overlap

Users are never required to match 100% of skills.

Skill relevance decreases gradually.

---

# Job Visibility Rules

Jobs appear only if

Published

Not expired

Recruiter active

Company active

Subscription active

Jobs violating platform policies may be hidden.

---

---

# Application Rules

The application system is the core workflow between Job Seekers and Recruiters.

Every application must be traceable throughout its lifecycle.

Applications are immutable records and must never be physically deleted unless required by legal regulations.

---

## Eligibility

A Job Seeker can apply only when:

- Account is active
- Email is verified
- Profile is completed (minimum required fields)
- Resume is available
- Job is Published
- Job has not expired
- Company is active
- Recruiter is active

Otherwise the Apply button must be disabled with an appropriate message.

---

## Duplicate Applications

A Job Seeker cannot apply to the same job more than once.

If an application already exists:

- Hide Apply button
- Show "Already Applied"
- Allow viewing application status

---

## Application Status

Allowed statuses:

Applied

Under Review

Shortlisted

Assessment Pending

Interview Scheduled

Interview Completed

Offer Extended

Offer Accepted

Offer Declined

Rejected

Withdrawn

Hired

Expired

Statuses cannot be skipped unless explicitly allowed.

Example:

Applied

↓

Under Review

↓

Shortlisted

↓

Interview Scheduled

↓

Offer Extended

↓

Hired

---

## Application History

Every status update must create a history record.

Store

- Previous Status
- New Status
- Updated By
- Timestamp
- Optional Notes

Application history must never be deleted.

---

## Withdraw Application

Job Seekers may withdraw applications until:

- Interview Scheduled

After interview scheduling, withdrawal requires recruiter approval.

---

## Resume Selection

If multiple resumes exist:

User selects one resume during application.

That resume becomes permanently linked to the application.

Future resume edits must not change submitted applications.

---

## Cover Letter

Optional.

Maximum length:

5000 characters.

Plain text and markdown supported.

HTML not allowed.

---

## Recruiter Actions

Recruiters may

- Review
- Shortlist
- Reject
- Schedule Interview
- Mark Hired
- Add Internal Notes

Recruiters cannot modify submitted resumes.

---

# Recommendation Rules

Recommendation is the most important feature in JobsDart.

Recommendations must never depend on Domains.

---

## Recommendation Philosophy

Every recommendation must maximize relevance rather than popularity.

Jobs are ranked using weighted scoring.

---

## Primary Ranking Factors

Skills Match

Preferred Job Titles

Experience

Location

Remote Preference

Salary

Employment Type

Industry

Visa Sponsorship

Work Authorization

---

## Secondary Ranking Factors

Job Freshness

Company Verification

Company Rating

Recruiter Activity

Application Success Rate

User Search Behaviour

Saved Jobs

Recently Viewed Jobs

---

## Skills Matching

Exact matches receive highest score.

Related skills receive lower score.

Skill aliases are supported.

Example:

React

↓

ReactJS

↓

Frontend Development

↓

JavaScript

All are related.

---

## Experience Matching

Perfect match receives maximum score.

Small mismatch receives reduced score.

Large mismatch receives very low score.

Example

User

3 years

Jobs

2-4 ✔

3-5 ✔

5-8 Moderate

10+ Low

---

## Location Matching

Priority

Current City

↓

Nearby Cities

↓

Current State

↓

Current Country

↓

Remote

↓

Worldwide Remote

↓

International

---

## Remote Preference

If Remote Only

Prioritize

Remote

Worldwide Remote

If Hybrid

Show Hybrid first.

If Onsite

Nearby jobs first.

---

## Salary Matching

Jobs within expected range receive higher ranking.

Jobs significantly below expected salary receive lower ranking.

Jobs without salary should not automatically rank last.

---

## Freshness

Suggested weights

Today

100

Yesterday

95

3 Days

90

7 Days

80

14 Days

70

30 Days

60

Older

Progressively lower

---

## Recommendation Exclusions

Never recommend

Expired jobs

Closed jobs

Deleted jobs

Jobs already applied

Blocked companies

Hidden jobs

Jobs violating work authorization

---

# Search Rules

Search must prioritize relevance.

Not exact matching.

---

Supported search

Job Title

Skills

Company

Country

State

City

Industry

Employment Type

Remote Type

Salary

Experience

---

Search Features

Autocomplete

Typo tolerance

Synonyms

Partial matches

Recent searches

Popular searches

Search suggestions

---

Search Ranking

Priority

Exact Title

↓

Skill Match

↓

Location

↓

Salary

↓

Recent

↓

Company Quality

---

Saved Searches

Premium users may save searches.

Each saved search stores

Keywords

Filters

Sort

Notification Preference

---

# Saved Jobs Rules

Users may save unlimited jobs.

Saved jobs remain until

Removed

Deleted

Expired

If job expires

Keep bookmark

Display

Expired

instead of removing.

---

# AI Resume Builder

Users may create multiple resumes.

One resume may be Primary.

Generated resumes remain editable.

AI suggestions never overwrite user content automatically.

Every AI change requires user approval.

---

# ATS Scoring Rules

ATS score generated using

Skills

Formatting

Sections

Keywords

Experience

Education

Grammar

Readability

Scores range

0-100

Scores update only after analysis.

---

# AI Interview Rules

Interview sessions are generated from

Job Title

Skills

Experience

Industry

Difficulty

Each interview stores

Questions

Answers

Scores

Feedback

Completion Time

Users may retake interviews.

Previous attempts remain stored.

---

# Notifications

Notification channels

Email

Push

In-App

SMS (Future)

Users control notification preferences.

Critical security notifications cannot be disabled.

---

# Email Rules

Send email for

Registration

Verification

Password Reset

Application Submitted

Interview Scheduled

Offer Received

Subscription Purchased

Payment Failed

---

# Subscription Rules

Subscription activation occurs after successful payment.

Expired subscriptions immediately lose premium privileges.

Grace period

Optional.

No manual activation.

---

# Premium Features

Examples

Unlimited AI Resume Builder

Unlimited ATS Analysis

Unlimited AI Interviews

Advanced Search

Saved Searches

Priority Recommendations

Application Insights

Premium badge

---

# Payment Rules

Every payment creates

Payment Record

Invoice

Audit Log

Refund Record (if applicable)

Payments cannot be modified.

Only refunded.

---

# Refund Rules

Refunds require

Successful payment

Eligible plan

Within refund window

Refund history must remain permanent.

---

# Company Verification

Verified companies receive

Verification Badge

Higher recommendation weight

Higher search visibility

Lower fraud risk score

Verification never guarantees recommendation priority.

Relevance always wins.

---

---

# Administration Rules

Platform Administrators are responsible for maintaining the integrity of JobsDart.

Administrators must never bypass business rules unless performing an approved maintenance or recovery operation.

Every administrative action must be logged.

---

## Administrator Permissions

Administrators may:

- Suspend Users
- Suspend Recruiters
- Suspend Companies
- Suspend Jobs
- Approve Company Verification
- Reject Company Verification
- Manage Subscription Plans
- Refund Payments
- View Platform Analytics
- Manage Categories
- Manage Skills
- Manage Industries
- Manage Countries
- Configure Feature Flags
- Review Reports
- Handle Abuse Cases

Administrators must not modify user-generated content directly unless required for moderation.

---

# Company Verification Rules

Company verification is intended to increase platform trust.

Verification requires manual or automated review.

Required verification documents may include:

- Company Registration Certificate
- Business Tax Identification
- Official Company Website
- Official Email Domain

Verification Status:

- Pending
- Under Review
- Verified
- Rejected
- Suspended

Verification does not guarantee recommendation priority.

Relevance always takes precedence over verification.

---

# Moderation Rules

JobsDart must actively prevent fraudulent content.

The following content is prohibited:

- Fake jobs
- Misleading salaries
- Spam postings
- Duplicate jobs
- Offensive language
- Illegal employment opportunities
- Discriminatory hiring requirements
- Copyright infringement

Violations may result in:

- Job Removal
- Recruiter Suspension
- Company Suspension
- Permanent Ban

---

# Report System

Users may report:

- Jobs
- Companies
- Recruiters

Report categories include:

- Spam
- Fraud
- Offensive Content
- Duplicate Job
- Incorrect Salary
- Misleading Description
- Other

Each report creates a moderation ticket.

---

# Analytics Rules

Analytics are aggregated and anonymous where possible.

Track:

- Job Views
- Job Clicks
- Applications
- Search Keywords
- Saved Jobs
- Recommendation Click Rate
- Resume Builder Usage
- ATS Usage
- AI Interview Usage
- Subscription Conversion
- Recruiter Response Time

Personal data must never be exposed in analytics dashboards.

---

# Audit Logging

The following actions must create audit logs:

- Login
- Logout
- Password Change
- Email Change
- Subscription Purchase
- Payment
- Refund
- Job Creation
- Job Update
- Job Deletion
- Application Submission
- Status Changes
- Company Verification
- Admin Actions

Audit logs are immutable.

---

# Soft Delete Policy

JobsDart follows a Soft Delete strategy by default.

Entities supporting Soft Delete:

- Users
- Companies
- Recruiters
- Jobs
- Applications
- Resumes

Soft Deleted records:

- Hidden from users
- Excluded from search
- Retained for recovery
- Available to administrators

Hard Delete is reserved for:

- Legal Requests
- GDPR Requests
- Data Retention Expiry
- Security Incidents

---

# Data Retention

Minimum retention periods:

Applications:
5 Years

Payments:
7 Years

Invoices:
7 Years

Audit Logs:
5 Years

Notifications:
1 Year

Search History:
180 Days

AI Sessions:
2 Years

Resume Analysis:
2 Years

Saved Jobs:
Until user removes them

---

# Privacy Rules

JobsDart follows privacy-by-design principles.

Users control:

- Profile Visibility
- Resume Visibility
- Recruiter Visibility
- Search Visibility

Users may:

- Download personal data
- Delete account
- Export applications
- Export resumes

---

# Security Rules

All sensitive operations require authorization.

Passwords:

- Never stored in plain text
- Always hashed

Authentication:

- Secure Sessions
- Token Validation
- Refresh Tokens

API Security:

- Input Validation
- Authorization
- Rate Limiting

Database Security:

- Parameterized Queries
- Least Privilege Access
- Encrypted Connections

Storage Security:

- Private Object Storage
- Signed URLs
- File Validation

---

# Password Policy

Minimum Length:

8 Characters

Recommended:

12+

Must support:

Uppercase

Lowercase

Number

Special Character

Passwords must never be recoverable.

Only resettable.

---

# Resume Upload Validation

Allowed:

PDF

DOC

DOCX

Maximum Size:

10 MB

Blocked:

Executable Files

Scripts

Archives

Unsupported Formats

Virus scanning should occur before permanent storage.

---

# API Rules

Every API must:

Validate Input

Authenticate User

Authorize Role

Return Consistent Responses

Log Errors

Use HTTP Status Codes Correctly

Support Pagination

Support Filtering

Support Sorting

Support Versioning

---

# API Versioning

Example

/api/v1/jobs

/api/v2/jobs

Breaking changes require a new API version.

---

# Rate Limiting

Public APIs:

100 Requests / Minute

Authenticated APIs:

500 Requests / Minute

Authentication APIs:

20 Requests / Minute

AI APIs:

Plan-dependent

---

# Performance Rules

Every page should load efficiently.

Requirements:

Pagination

Lazy Loading

Caching

Image Optimization

Database Indexes

Minimal Queries

No N+1 Queries

Background Processing

---

# Database Integrity Rules

Every Foreign Key must be valid.

Cascade Deletes should be avoided unless explicitly required.

Transactions must be used for multi-step operations.

Indexes should exist for:

- Email
- Company
- Skills
- Job Title
- Country
- City
- Posted Date
- Status

---

# Search Performance Rules

Search should return results in under 500 milliseconds under normal load.

Autocomplete should return within 150 milliseconds.

Recommendation generation should be cached where appropriate.

---

# Caching Rules

Cache:

Job Recommendations

Popular Searches

Company Profiles

Skill Lists

Countries

Currencies

Industries

Do not cache:

Authentication

Payments

Application Status

User Permissions

---

# International Rules

Every feature must support:

Multiple Countries

Multiple Languages

Multiple Timezones

Multiple Currencies

Visa Sponsorship

Remote Worldwide

Country-specific formatting

Never hardcode:

Currency

Timezone

Date Format

Phone Format

Address Format

---

# Feature Flag Rules

New features should be released behind feature flags.

Feature flags allow:

Gradual Rollout

Testing

Rollback

Regional Availability

---

# Error Handling

Never expose:

Stack Traces

Database Errors

Secrets

Tokens

Internal Paths

Users receive friendly error messages.

Detailed errors are stored in logs.

---

# Logging Rules

Log:

API Errors

Server Errors

Authentication Failures

Payment Failures

Background Job Failures

AI Errors

Database Errors

Never log:

Passwords

Tokens

Sensitive Personal Information

Payment Credentials

---

# Notification Rules

Duplicate notifications should not be sent.

Critical notifications always have higher priority.

Notification retries should be automatic.

---

# Engineering Rules

Business logic belongs only in Services.

Controllers remain thin.

Database access belongs in repositories.

UI components remain presentation-only.

Validation should be centralized.

Configuration should never be hardcoded.

Magic numbers should be avoided.

Every feature requires documentation.

Every feature requires testing.

Every migration must be reversible.

Every API must be documented.

---

# AI Development Rules

AI-generated code must:

Follow project coding standards.

Reuse existing services.

Avoid duplication.

Respect business rules.

Never invent database fields.

Never bypass authorization.

Never remove unrelated functionality.

Always update documentation after architectural changes.

---

# Definition of Done

A feature is complete only when:

- Business Rules Implemented
- Backend Complete
- Frontend Complete
- Database Updated
- API Updated
- Validation Added
- Tests Passing
- Documentation Updated
- Code Reviewed
- Performance Verified
- Security Reviewed

---

# Future Expansion Principles

JobsDart should remain modular.

Future modules may include:

- AI Career Coach
- Salary Prediction
- Company Reviews
- Video Interviews
- Resume Marketplace
- Learning Platform
- Skill Assessments
- Career Roadmaps
- Employer Branding
- Enterprise Hiring Suite

New modules must integrate with existing architecture without breaking current functionality.

---

# Business Rule Governance

This document is the authoritative source for JobsDart business behavior.

All architectural decisions, implementations, APIs, and AI-generated code must comply with these rules.

If implementation conflicts with this document, the implementation must be updated.

Changes to this document require review before adoption.

---

# End of BUSINESS_RULES.md