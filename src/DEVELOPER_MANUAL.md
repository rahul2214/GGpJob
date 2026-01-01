# Developer Manual: Veltria Job Portal

This document provides an overview of the project structure, setup, and key architectural concepts for the Veltria Job Portal application.

## 1. Tech Stack

-   **Frontend**: Next.js (React Framework) with App Router
-   **UI**: ShadCN UI, Tailwind CSS
-   **State Management**: React Context API (`useUser` for user session)
-   **Backend**: Next.js API Routes, Firebase (Firestore, Authentication, Storage)
-   **Generative AI**: Genkit
-   **Forms**: React Hook Form with Zod for validation

## 2. Project Structure

```
.
├── src
│   ├── app                 # Next.js App Router
│   │   ├── api             # Backend API routes
│   │   ├── admin           # Admin panel pages
│   │   ├── company         # Company (Recruiter/Employee) login/signup
│   │   ├── jobs            # Job listing, details, and posting pages
│   │   ├── profile         # User profile pages
│   │   ├── (other routes)  # Login, signup, feedback, etc.
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home/Dashboard page
│   ├── components
│   │   ├── dashboards      # Role-specific dashboards
│   │   ├── ui              # Reusable ShadCN UI components
│   │   └── (other components) # Job forms, profile forms, filters, etc.
│   ├── contexts
│   │   └── user-context.tsx  # Manages user state and authentication
│   ├── firebase
│   │   ├── admin-config.ts # Firebase Admin SDK for server-side use
│   │   └── config.ts       # Firebase client-side configuration
│   ├── hooks
│   │   ├── use-mobile.tsx    # Hook to detect mobile viewports
│   │   └── use-toast.ts      # Hook for displaying toast notifications
│   ├── lib
│   │   ├── types.ts        # TypeScript type definitions for data models
│   │   └── utils.ts        # Utility functions (e.g., `cn` for classnames)
│   └── ai
│       ├── flows           # Genkit AI flows
│       └── genkit.ts       # Genkit configuration
└── tailwind.config.ts      # Tailwind CSS configuration
```

## 3. Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn
-   Firebase Project with Firestore, Firebase Authentication (Email/Password & Google providers enabled), and Firebase Storage enabled.

### Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env.local` file in the root of the project and add your Firebase project configuration keys. You can get these from your Firebase project settings.

    ```
    # Firebase Client SDK
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...

    # Firebase Admin SDK (for server-side operations)
    # Store these as a single JSON string
    FIREBASE_SERVICE_ACCOUNT_KEY=...
    ```

### Running the Development Server

-   To run the frontend:
    ```bash
    npm run dev
    ```
-   To run the Genkit AI server (if using AI features):
    ```bash
    npm run genkit:dev
    ```

The application will be available at `http://localhost:9002`.

## 4. Key Concepts

### Authentication & User Management

-   **Firebase Authentication** is used for all user sign-ups and logins.
-   The **`UserProvider`** (`src/contexts/user-context.tsx`) is a client-side context that wraps the entire application. It listens for `onAuthStateChanged` events from Firebase to manage the user's session.
-   The `useUser` hook provides access to the current user's data and loading state throughout the app.
-   User data is stored in two separate Firestore collections: `users` for "Job Seeker" roles and `recruiters` for "Recruiter" and "Employee" roles. The user's UID from Firebase Auth is the document ID in these collections.

### Data Fetching

-   All backend logic is handled through Next.js **API Routes** located in `src/app/api`.
-   These routes interact directly with the Firebase Admin SDK (`src/firebase/admin-config.ts`) to perform database operations.
-   Client components fetch data from these API routes using the `fetch` API.

### Admin Panel

-   The admin panel is located under `/admin`. Access is restricted based on user roles (`Admin` or `Super Admin`).
-   It provides functionalities for managing users, jobs, domains, and other platform data.
-   The dashboard at `/admin/dashboard` provides analytics on platform usage.

### Job & Referral Posting

-   **Recruiters** can post "Direct" jobs.
-   **Employees** can post "Referral" jobs, which are highlighted differently in the UI.
-   All job postings expire automatically after a set period (14 days for referrals, 30 for direct jobs).

## 5. Deployment

The application is configured for deployment on Firebase App Hosting. The `apphosting.yaml` file contains the basic configuration. Ensure all necessary environment variables are set in your App Hosting backend settings.
