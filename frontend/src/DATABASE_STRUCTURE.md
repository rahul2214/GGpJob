
# Database Structure (Firestore)

This document outlines the structure of the Firestore database for the Veltria Job Portal.

## Top-Level Collections

### 1. `users`

Stores profiles for users with the "Job Seeker" role. The document ID is the user's UID from Firebase Authentication.

-   **Fields**:
    -   `name`: `string` - Full name of the user.
    -   `email`: `string` - User's email address.
    -   `phone`: `string` - User's phone number.
    -   `role`: `string` - Always "Job Seeker".
    -   `headline`: `string` - A short professional headline.
    -   `locationId`: `string` - ID corresponding to a document in the `locations` collection.
    -   `domainId`: `string` - ID corresponding to a document in the `domains` collection.
    -   `resumeUrl`: `string` - URL to the user's resume file in Firebase Storage.
    -   `linkedinUrl`: `string` - URL to the user's LinkedIn profile.

### 2. `recruiters`

Stores profiles for users with "Recruiter" or "Employee" roles. The document ID is the user's UID from Firebase Authentication.

-   **Fields**: Same as the `users` collection, but `role` is "Recruiter" or "Employee".

### 3. `admins`

Stores profiles for users with "Admin" or "Super Admin" roles. The document ID is the user's UID from Firebase Authentication.

-   **Fields**: Same as the `users` collection, but `role` is "Admin" or "Super Admin".

### 4. `jobs`

Stores all job postings, both direct and referral.

-   **Fields**:
    -   `title`: `string`
    -   `companyName`: `string`
    -   `locationId`: `string`
    -   `jobTypeId`: `string`
    -   `workplaceTypeId`: `string`
    -   `experienceLevelId`: `string`
    -   `domainId`: `string`
    -   `description`: `string`
    -   `salary`: `string` (optional)
    -   `vacancies`: `number`
    -   `role`: `string` - The specific role title (e.g., "Software Engineer").
    -   `postedAt`: `timestamp`
    -   `isReferral`: `boolean` - `true` if it's a referral job.
    -   `recruiterId`: `string` (UID of the recruiter who posted, if applicable)
    -   `employeeId`: `string` (UID of the employee who posted, if applicable)
    -   `contactEmail`: `string`
    -   `contactPhone`: `string`
    -   `employeeLinkedIn`: `string` (optional)
    -   `jobLink`: `string` (optional) - Link to the official job posting.

### 5. `applications`

Stores all job applications submitted by users.

### 6. `domains`

Stores the job domains (e.g., "Software Engineering", "Marketing").

### 7. Lookup Collections

-   `locations`
-   `job_types`
-   `workplace_types`
-   `experience_levels`
-   `application_statuses`

### 8. `portal_feedback`

Stores feedback submitted by users about the portal itself.
