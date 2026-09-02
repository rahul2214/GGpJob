"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Flame,
  Compass
} from 'lucide-react';

const FEATURED_COMMUNITIES = [
  {
    id: "ai-ml-hub",
    name: "AI & Deep Learning Engineers",
    category: "Tech Hub",
    description: "Connect with LLM researchers and MLOps architects. Share paper breakdowns, model optimization techniques, and active hiring roles.",
    membersCount: "14.8k",
    postsCount: "1.2k/mo",
    activeNow: 342,
    gradient: "from-violet-500/20 via-purple-500/10 to-indigo-500/20",
    borderGlow: "border-violet-500/30",
    badgeColor: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
    icon: Sparkles,
    topics: ["LLM Fine-Tuning", "PyTorch", "GPU Clusters", "AI Engineering"],
    avatars: ["/avatars/1.jpg", "/avatars/2.jpg", "/avatars/3.jpg"],
    hotTopic: "🔥 DeepSeek V3 Architecture & Benchmarks"
  },
  {
    id: "faang-insiders",
    name: "FAANG & Big Tech Recruiter Guild",
    category: "Recruiter Guild",
    description: "Verified hiring network across Google, Meta, Apple & Amazon. Connect directly with hiring managers and interview leads.",
    membersCount: "28.4k",
    postsCount: "3.5k/mo",
    activeNow: 890,
    gradient: "from-amber-500/20 via-orange-500/10 to-yellow-500/20",
    borderGlow: "border-amber-500/30",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    icon: ShieldCheck,
    topics: ["Direct Hiring", "L6+ Compensation", "System Design", "Manager Reviews"],
    avatars: ["/avatars/4.jpg", "/avatars/5.jpg", "/avatars/6.jpg"],
    hotTopic: "⚡ Google L5/L6 Staff Engineer Hiring Megathread"
  },
  {
    id: "visa-relocation",
    name: "Global Visa & Relocation Circle",
    category: "Career Support",
    description: "Dedicated circle for H1B, O1, EU Blue Card & UK Scale-up visas. Share sponsor employer lists and legal processing timelines.",
    membersCount: "19.1k",
    postsCount: "2.1k/mo",
    activeNow: 412,
    gradient: "from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
    borderGlow: "border-emerald-500/30",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    icon: Globe,
    topics: ["H1B Transfers", "EU Blue Card", "Remote Relocation", "Tax Strategies"],
    avatars: ["/avatars/7.jpg", "/avatars/8.jpg", "/avatars/9.jpg"],
    hotTopic: "🌐 Top 50 Companies Offering Direct German Visa Sponsorship"
  },
  {
    id: "system-design",
    name: "Distributed Systems & Cloud Guild",
    category: "Tech Hub",
    description: "Deep technical breakdowns on high-throughput backend architecture, Kafka pipelines, K8s clusters, and DB scaling.",
    membersCount: "12.3k",
    postsCount: "980/mo",
    activeNow: 215,
    gradient: "from-blue-500/20 via-sky-500/10 to-indigo-500/20",
    borderGlow: "border-blue-500/30",
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    icon: Zap,
    topics: ["Kafka & Redis", "Kubernetes", "Microservices", "Latency Optimization"],
    avatars: ["/avatars/10.jpg", "/avatars/11.jpg", "/avatars/12.jpg"],
    hotTopic: "🛠️ Designing a Global Multi-Region Payment Engine"
  }
];

const COMMUNITY_SPOTLIGHTS = [
  {
    id: "referral-drops",
    title: "Exclusive Direct Hiring Drops",
    subtitle: "Direct access to active job openings posted by verified recruiters",
    tag: "Instant Direct Access",
    stats: "3,400+ Positions Open This Month",
    snippet: {
      author: "Sarah Jenkins · Lead Recruiter @ Stripe",
      time: "2 hours ago",
      text: "Our payments platform team is opening 4 Senior Backend positions in US/Remote. Apply directly for immediate team review!",
      replies: 48,
      likes: 124
    }
  },
  {
    id: "tech-amas",
    title: "Live Technical AMAs & Career Workshops",
    subtitle: "Weekly live sessions with Principal Engineers and Tech Leads",
    tag: "Weekly Interactive AMAs",
    stats: "Next Live Event: Thursday @ 6 PM UTC",
    snippet: {
      author: "Alex Rivera · Engineering Director @ OpenAI",
      time: "Scheduled Event",
      text: "Join us this Thursday for a live breakdown: 'Crack the L6 Staff Systems Design Interview'. Live Q&A and resume tear-downs included!",
      replies: 192,
      likes: 410
    }
  },
  {
    id: "ai-assistant",
    title: "AI-Powered Peer Code & Resume Reviews",
    subtitle: "Get feedback on your portfolio & system design solutions from community experts",
    tag: "AI + Human Feedback",
    stats: "24/7 Peer & AI Evaluation",
    snippet: {
      author: "JobsDart Community Bot & Experts",
      time: "Active 24/7",
      text: "Submit your system architecture diagram or resume summary for instant AI ATS scoring + peer evaluation from Senior Engineers.",
      replies: 86,
      likes: 290
    }
  }
];

import { useUser } from '@/contexts/user-context';
import { useRouter } from 'next/navigation';

export function CommunitiesSection() {
  const { user } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("referral-drops");

  const joinTarget = user ? '/communities' : '/login';

  const currentSpotlight = COMMUNITY_SPOTLIGHTS.find(s => s.id === activeTab) || COMMUNITY_SPOTLIGHTS[0];

  return (
    <section id="communities" aria-label="Global Professional Communities" className="py-24 relative overflow-hidden bg-slate-50 dark:bg-[hsl(220_65%_7%)] transition-colors duration-300">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 dot-grid-faint opacity-40" />

      <div className="container-xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mt-4 mb-6">
              Vibrant Professional <span className="text-gradient-primary">Communities</span>
            </h2>

            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed mx-auto">
              Join specialized domain circles, connect with verified recruiters, attend live AMAs, and level up your career alongside top global engineers.
            </p>
          </motion.div>
        </div>

        {/* 4 Featured Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {FEATURED_COMMUNITIES.map((comm, index) => {
            const Icon = comm.icon;
            return (
              <motion.div
                key={comm.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between relative group shadow-sm dark:shadow-none hover:shadow-xl transition-all duration-300 overflow-hidden ${comm.borderGlow}`}
              >
                {/* Background ambient gradient glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${comm.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl`} />

                <div className="relative z-10">
                  {/* Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <Icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${comm.badgeColor}`}>
                      {comm.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                    {comm.name}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3">
                    {comm.description}
                  </p>

                  {/* Hot topic ticker pill */}
                  <div className="mb-4 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl p-2.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                    {comm.hotTopic}
                  </div>

                  {/* Topic pills */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {comm.topics.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer stats + Join button */}
                <div className="relative z-10 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                      <Users className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                      {comm.membersCount} Members
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {comm.activeNow} Online Now
                    </span>
                  </div>

                  <Link
                    href={joinTarget}
                    className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform"
                  >
                    Join <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Feature Spotlight Container */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Interactive Nav Tabs */}
            <div className="lg:col-span-5 space-y-4">
              
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Why Top Tech Professionals Belong Here
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                Connect directly with peers and hiring teams, gain career insights, and accelerate your growth.
              </p>

              <div className="space-y-3">
                {COMMUNITY_SPOTLIGHTS.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-1 ${
                        isActive
                          ? "bg-violet-500/10 border-violet-500/40 shadow-sm"
                          : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isActive ? "text-violet-600 dark:text-violet-400" : "text-slate-700 dark:text-slate-300"}`}>
                          {item.title}
                        </span>
                        {isActive && <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 animate-pulse" />}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {item.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Live Mock Discussion Box */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSpotlight.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 dark:border-white/10 shadow-2xl relative"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-bold text-slate-300">{currentSpotlight.tag}</span>
                    </div>
                    <span className="text-xs font-semibold text-violet-400 bg-violet-500/20 px-2.5 py-1 rounded-full border border-violet-500/30">
                      {currentSpotlight.stats}
                    </span>
                  </div>

                  {/* Post Snippet */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-xs">
                          {currentSpotlight.snippet.author[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{currentSpotlight.snippet.author}</p>
                          <p className="text-[10px] text-slate-400">{currentSpotlight.snippet.time}</p>
                        </div>
                      </div>
                      <span className="badge-violet text-[10px]">Verified Post</span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed my-3 font-medium">
                      "{currentSpotlight.snippet.text}"
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-white/5">
                      <span className="flex items-center gap-1 hover:text-white cursor-pointer">
                        <MessageSquare className="w-3.5 h-3.5 text-violet-400" /> {currentSpotlight.snippet.replies} Responses
                      </span>
                      <span className="flex items-center gap-1 hover:text-white cursor-pointer">
                        <Flame className="w-3.5 h-3.5 text-amber-400" /> {currentSpotlight.snippet.likes} Helpful Reactions
                      </span>
                    </div>
                  </div>

                  {/* CTA Banner inside box */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <p className="text-xs text-slate-400">
                      Join 50,000+ engineers discussing tech, career growth & active hiring opportunities.
                    </p>
                    <Link
                      href={joinTarget}
                      className="btn-primary py-2 px-5 text-xs whitespace-nowrap w-full sm:w-auto text-center"
                    >
                      Join Communities <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* Bottom CTA Button to Communities Page */}
        <div className="text-center mt-12">
          <Link
            href={joinTarget}
            className="btn-secondary px-8 py-3.5 text-sm font-bold shadow-sm hover:shadow-md"
          >
            Explore All 50+ Tech & Career Guilds <Compass className="w-4 h-4 ml-1 text-violet-600 dark:text-violet-400" />
          </Link>
        </div>

      </div>
    </section>
  );
}
