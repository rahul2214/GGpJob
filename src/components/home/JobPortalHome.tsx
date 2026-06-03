"use client";

import { HeroSection } from './HeroSection';
import { ComparisonSection } from './ComparisonSection';
import { PipelineSimulator } from './PipelineSimulator';
import { ChatWidget } from './ChatWidget';
import { RoleTabs } from './RoleTabs';
import { LeaderboardSection } from './LeaderboardSection';
import { JobsGrid } from './JobsGrid';
import { FaqSection } from './FaqSection';
import { CtaSection } from './CtaSection';

const JobPortalHome = () => {
    return (
        <div id="job-portal-page" className="overflow-hidden font-sans bg-slate-50 min-h-screen text-slate-900 selection:bg-indigo-500 selection:text-white">
            <HeroSection />
            <ComparisonSection />
            <PipelineSimulator />
            <ChatWidget />
            <RoleTabs />
            <LeaderboardSection />
            <JobsGrid />
            <FaqSection />
            <CtaSection />
        </div>
    );
};

export default JobPortalHome;
