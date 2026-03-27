import type { Metadata } from "next";
import TalentSearch from "@/components/dashboards/talent-search";

export const metadata: Metadata = {
  title: "Talent Search | Jobs Dart",
  description: "Discover and connect with skilled candidates for your open roles.",
};

export default function TalentSearchPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="max-w-2xl">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">
              Recruiter Tools
            </p>
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Find Your Next{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Top Hire
              </span>
            </h1>
            <p className="text-slate-400 mt-4 leading-relaxed">
              Search our verified talent pool by skills, domain, and keywords.
              Every profile is a potential asset for your team.
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <TalentSearch />
      </div>
    </div>
  );
}
