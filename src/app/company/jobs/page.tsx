import type { Metadata } from "next";
import RecruiterDashboard from "@/components/dashboards/recruiter-dashboard";

export const metadata: Metadata = {
  title: "My Job Postings | Jobs Dart",
  description: "Manage your company's open positions and track candidate applications.",
};

export default function CompanyJobsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <RecruiterDashboard onlyPostings={true} />
    </div>
  );
}
