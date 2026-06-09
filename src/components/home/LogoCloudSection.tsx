"use client";

import { motion, type Easing } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as Easing } }
};

interface Company {
  name: string;
  icon?: React.ReactNode;
}

export function LogoCloudSection() {
  const companies: Company[] = [
    {
      name: "Google",
      icon: (
        <svg className="h-5 w-auto shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.51 0-6.38-2.87-6.38-6.38 0-3.51 2.87-6.38 6.38-6.38 1.54 0 2.97.55 4.09 1.55l3.1-3.1C18.99 1.76 15.84 1 12.24 1 6.036 1 1 6.036 1 12.24s5.036 11.24 11.24 11.24c6.438 0 11.24-4.522 11.24-11.24 0-.766-.078-1.503-.223-2.195H12.24z" />
        </svg>
      )
    },
    {
      name: "Microsoft",
      icon: (
        <svg className="h-4.5 w-auto shrink-0" viewBox="0 0 23 23" fill="currentColor">
          <path d="M0 0h11v11H0zM12 0h11v11H12zM0 12h11v11H0zM12 12h11v11H12z" />
        </svg>
      )
    },
    {
      name: "Amazon"
    },
    {
      name: "Meta",
      icon: (
        <svg className="h-4.5 w-auto shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 6C13.8 6 11.9 7.3 10.7 9.1c-1.2-1.8-3.1-3.1-5.7-3.1C2.2 6 0 8.2 0 11s2.2 5 5 5c2.6 0 4.5-1.3 5.7-3.1 1.2 1.8 3.1 3.1 5.7 3.1 2.8 0 5-2.2 5-5s-2.2-5-5-5zm-11.5 8c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm11.5 0c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
        </svg>
      )
    },
    {
      name: "Netflix"
    },
    {
      name: "Stripe"
    },
    {
      name: "Apple",
      icon: (
        <svg className="h-5 w-auto shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-.1 3.81 1.5 1.24 1.02 2.13 2.42 2.63 3.54-2.73 1.65-2.28 5.17.48 6.25-.57 1.44-1.29 2.89-2.32 3.96zM15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.84-.98 2.94 1.07.08 2.15-.52 2.81-1.33z" />
        </svg>
      )
    },
    {
      name: "GitHub",
      icon: (
        <svg className="h-5 w-auto shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      )
    },
    {
      name: "Slack",
      icon: (
        <svg className="h-4.5 w-auto shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.823a2.528 2.528 0 0 1-2.52-2.52v-5.042zM8.823 5.043a2.528 2.528 0 0 1 2.52-2.522 2.528 2.528 0 0 1 2.522 2.522v2.52h-2.522a2.528 2.528 0 0 1-2.52-2.52zm0 1.261a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.522H3.78a2.528 2.528 0 0 1-2.52-2.522V8.824a2.528 2.528 0 0 1 2.52-2.52h5.043zm10.135 3.761a2.528 2.528 0 0 1 2.52-2.52 2.528 2.528 0 0 1 2.522 2.52 2.528 2.528 0 0 1-2.522 2.52h-2.52v-2.52zm-1.262 0a2.528 2.528 0 0 1-2.52 2.52h-5.043a2.528 2.528 0 0 1-2.522-2.52V3.78a2.528 2.528 0 0 1 2.522-2.52h5.043a2.528 2.528 0 0 1 2.52 2.52v5.043zm-3.78 10.135a2.528 2.528 0 0 1-2.52 2.522 2.528 2.528 0 0 1-2.522-2.522v-2.52h2.522a2.528 2.528 0 0 1 2.52 2.52zm0-1.262a2.528 2.528 0 0 1-2.52-2.52v-5.043a2.528 2.528 0 0 1 2.52-2.522h5.043a2.528 2.528 0 0 1 2.52 2.522v5.043a2.528 2.528 0 0 1-2.52 2.52h-5.043z" />
        </svg>
      )
    },
    {
      name: "Adobe"
    },
    {
      name: "Razorpay"
    },
    {
      name: "Uber"
    },
    {
      name: "Salesforce"
    },
    {
      name: "Zoom"
    }
  ];

  return (
    <section className="py-6 bg-white border-y border-slate-100 relative overflow-hidden z-20">
      <div className="container px-4 md:px-6 mx-auto relative z-10 mb-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center max-w-4xl mx-auto"
        >
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            Trusted by insiders and referrers from the world's leading organizations
          </p>
        </motion.div>
      </div>

      {/* Auto scrolling marquee */}
      <div className="w-full overflow-hidden flex py-2 relative pt-12">
        <div className="animate-logo-marquee gap-12 sm:gap-16 items-center opacity-70">
          {[...companies, ...companies].map((company, idx) => (
            <div 
              key={idx} 
              className="text-slate-400 hover:text-slate-800 transition-colors duration-300 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {company.icon}
              <span className={`text-base select-none ${
                company.name === "Google" ? "font-extrabold tracking-tight" :
                company.name === "Microsoft" ? "font-bold tracking-tight" :
                company.name === "Amazon" ? "font-black italic tracking-tight" :
                company.name === "Meta" ? "font-extrabold tracking-tight" :
                company.name === "Netflix" ? "font-black tracking-tighter uppercase" :
                company.name === "Stripe" ? "font-extrabold tracking-tight" :
                company.name === "Apple" ? "font-extrabold tracking-tight" :
                company.name === "GitHub" ? "font-bold tracking-tight" :
                company.name === "Slack" ? "font-extrabold tracking-tight" :
                company.name === "Razorpay" ? "font-black tracking-tight" :
                company.name === "Uber" ? "font-black tracking-tight uppercase" :
                company.name === "Salesforce" ? "font-black tracking-tight" :
                company.name === "Zoom" ? "font-black tracking-tight" :
                "font-bold"
              }`}>
                {company.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Gradients on Left/Right edges */}
      <div className="absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />

      {/* CSS style tag */}
      <style jsx>{`
        @keyframes logo-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-logo-marquee {
          display: flex;
          width: max-content;
          animation: logo-marquee 35s linear infinite;
        }
        .animate-logo-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
  
}
