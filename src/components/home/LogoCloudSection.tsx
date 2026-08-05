"use client";

import { motion } from "framer-motion";

const row1 = [
  { name: "Google", flag: "🇺🇸" },
  { name: "Microsoft", flag: "🇺🇸" },
  { name: "Amazon", flag: "🇬🇧" },
  { name: "Meta", flag: "🇺🇸" },
  { name: "Apple" },
  { name: "Netflix" },
  { name: "Stripe", flag: "🇬🇧" },
  { name: "Shopify", flag: "🇨🇦" },
  { name: "Atlassian", flag: "🇦🇺" },
  { name: "Salesforce" },
];

const row2 = [
  { name: "Adobe" },
  { name: "Airbnb", flag: "🇺🇸" },
  { name: "Uber", flag: "🇺🇸" },
  { name: "Spotify", flag: "🇸🇪" },
  { name: "Twitter/X" },
  { name: "Dropbox" },
  { name: "Zoom", flag: "🇸🇬" },
  { name: "LinkedIn" },
  { name: "GitHub" },
  { name: "Figma", flag: "🇩🇪" },
];

const stats = [
  "10,000+ Verified Recruiters",
  "50+ countries",
  "98% verification rate",
  "100,000+ Direct Hires",
];

function CompanyPill({ name, flag }: { name: string; flag?: string }) {
  // Deterministic color based on name length and first char code for visual variety
  const hue = (name.charCodeAt(0) * 15 + name.length * 10) % 360;
  
  return (
    <div className="bg-white dark:bg-white/5 flex items-center gap-3 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 shrink-0 shadow-sm">
      <div
        className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
        style={{
          backgroundColor: `hsl(${hue} 70% 50% / 0.2)`,
          color: `hsl(${hue} 70% 40%)`,
        }}
      >
        {name.charAt(0)}
      </div>
      <span className="text-sm font-medium text-slate-800 dark:text-white/90">
        {name} {flag}
      </span>
    </div>
  );
}

export function LogoCloudSection() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="bg-slate-50 dark:bg-[hsl(220_65%_6%)] py-16 overflow-hidden transition-colors duration-300"
    >
      <div className="container-xl mx-auto">
        <h2 className="text-center text-sm font-semibold tracking-wider text-slate-500 dark:text-white/50 uppercase mb-8">
          Global Companies Hiring
        </h2>

        {/* Mask image for fade effect on left and right edges */}
        <div 
          className="relative flex flex-col gap-4"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
        >
          {/* Row 1 - Left to Right */}
          <div className="flex w-max gap-4 animate-marquee">
            {[...row1, ...row1].map((company, i) => (
              <CompanyPill key={`r1-${i}`} name={company.name} flag={company.flag} />
            ))}
          </div>

          {/* Row 2 - Right to Left */}
          <div className="flex w-max gap-4 animate-marquee [animation-direction:reverse]">
            {[...row2, ...row2].map((company, i) => (
              <CompanyPill key={`r2-${i}`} name={company.name} flag={company.flag} />
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {stats.map((stat, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="badge-violet px-4 py-1.5 rounded-full text-sm font-medium border border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300"
            >
              {stat}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
