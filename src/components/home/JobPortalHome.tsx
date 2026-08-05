"use client";

import { HeroSection } from './HeroSection';
import { LogoCloudSection } from './LogoCloudSection';
import { ComparisonSection } from './ComparisonSection';
import { ChatWidget } from './ChatWidget';
import { RoleTabs } from './RoleTabs';
import { CommunitiesSection } from './CommunitiesSection';
import { JobsGrid } from './JobsGrid';
import { ReviewsSection } from './ReviewsSection';
import { FaqSection } from './FaqSection';
import { CtaSection } from './CtaSection';

const JobPortalHome = () => {
    return (
        <div id="job-portal-page" className="overflow-hidden font-sans bg-white dark:bg-[hsl(220_65%_6%)] min-h-screen text-slate-900 dark:text-white selection:bg-violet-500/30 selection:text-white transition-colors duration-300">
            {/* pt-[70px] offsets the fixed navbar height */}
            <div>
                <HeroSection />
                <LogoCloudSection />
                <ComparisonSection />
                <ChatWidget />
                <RoleTabs />
                <CommunitiesSection />
                <JobsGrid />
                <ReviewsSection />
                <FaqSection />
                <CtaSection />
            </div>
        </div>
    );
};

export default JobPortalHome;
