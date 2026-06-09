"use client";

import { motion, type Easing } from 'framer-motion';
import { Star } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as Easing } }
};

interface Review {
  name: string;
  role: string;
  company: string;
  avatarGradient: string;
  text: string;
  rating: number;
}

const row1Reviews: Review[] = [
  {
    name: "Amit Sharma",
    role: "Frontend Engineer",
    company: "Google",
    avatarGradient: "from-blue-500 to-indigo-600",
    text: "The referral system here is unmatched. I got referred by a senior dev at Google and landed an interview within a week. Skip the ATS black hole!",
    rating: 5
  },
  {
    name: "Jessica Miller",
    role: "Talent Acquisition",
    company: "Microsoft",
    avatarGradient: "from-amber-500 to-orange-600",
    text: "Hiring through direct employee referrals has cut down our screening time by almost 60%. The candidates are pre-vetted and highly qualified.",
    rating: 5
  },
  {
    name: "Rajesh Patel",
    role: "Staff Engineer",
    company: "Amazon",
    avatarGradient: "from-emerald-500 to-teal-600",
    text: "As an employee, referring candidates and tracking payouts is so seamless. I've successfully referred 3 peers this quarter and earned rewards.",
    rating: 5
  },
  {
    name: "Sarah Jenkins",
    role: "Product Manager",
    company: "Figma",
    avatarGradient: "from-purple-500 to-pink-600",
    text: "The built-in ATS resume builder is fantastic. I updated my resume format using their categories and got three callbacks in one week.",
    rating: 5
  }
];

const row2Reviews: Review[] = [
  {
    name: "Daniel Kim",
    role: "Full Stack Dev",
    company: "Stripe",
    avatarGradient: "from-sky-500 to-blue-600",
    text: "No recruiters spamming you, just direct communication with referrers and hiring managers. It's how job hunting should be.",
    rating: 5
  },
  {
    name: "Helen Brooks",
    role: "Founder",
    company: "TechStart",
    avatarGradient: "from-rose-500 to-red-600",
    text: "Unlocking candidate profiles is super straightforward, and the pricing is very transparent compared to traditional job boards.",
    rating: 5
  },
  {
    name: "Priyanshu Verma",
    role: "Graduate Developer",
    company: "Cognizant",
    avatarGradient: "from-indigo-500 to-purple-600",
    text: "The pipeline simulator let me practice interview rounds. By the time I had the real one, I was fully prepared and confident.",
    rating: 4
  },
  {
    name: "Carlos Mendez",
    role: "DevOps Engineer",
    company: "Netflix",
    avatarGradient: "from-red-600 to-orange-500",
    text: "Fast payouts and verified referrals. This platform completely bridges the gap between jobseekers and internal advocates.",
    rating: 5
  }
];

export function ReviewsSection() {
  return (
    <section id="reviews" aria-label="Customer Reviews" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="container px-4 md:px-6 mx-auto mb-12 relative z-10">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }} 
          variants={fadeInUp} 
          className="text-center max-w-3xl mx-auto"
        >
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50 border border-indigo-150 text-indigo-600 uppercase tracking-widest">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-4 mb-6 tracking-tight">
            Loved by Jobseekers, Referrers, & Recruiters
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            See how JobsDart is shifting the dynamics of hiring through direct employee referrals and verified tracks.
          </p>
        </motion.div>
      </div>

      {/* Marquee Row 1: Left to Right */}
      <div className="w-full overflow-hidden flex py-4 relative">
        <div className="animate-marquee gap-6">
          {[...row1Reviews, ...row1Reviews].map((review, idx) => (
            <div 
              key={idx} 
              className="w-[350px] sm:w-[420px] bg-white rounded-2xl p-6 border border-slate-100 shadow-md flex flex-col justify-between shrink-0 hover:shadow-xl transition-all duration-350 hover:scale-[1.01]"
            >
              <div className="flex items-center gap-1.5 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < review.rating ? 'fill-current text-amber-400' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed italic mb-6 flex-1">
                "{review.text}"
              </p>
              <div className="flex items-center gap-3 border-t border-slate-50 pt-4">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.avatarGradient} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}>
                  {review.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                  <p className="text-xs text-slate-500">{review.role} @ <span className="font-semibold text-indigo-600">{review.company}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Row 2: Right to Left */}
      <div className="w-full overflow-hidden flex py-4 mt-2 relative">
        <div className="animate-marquee-reverse gap-6">
          {[...row2Reviews, ...row2Reviews].map((review, idx) => (
            <div 
              key={idx} 
              className="w-[350px] sm:w-[420px] bg-white rounded-2xl p-6 border border-slate-100 shadow-md flex flex-col justify-between shrink-0 hover:shadow-xl transition-all duration-350 hover:scale-[1.01]"
            >
              <div className="flex items-center gap-1.5 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < review.rating ? 'fill-current text-amber-400' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed italic mb-6 flex-1">
                "{review.text}"
              </p>
              <div className="flex items-center gap-3 border-t border-slate-50 pt-4">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.avatarGradient} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}>
                  {review.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                  <p className="text-xs text-slate-500">{review.role} @ <span className="font-semibold text-indigo-600">{review.company}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient Fades on Edges */}
      <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none z-10" />

      {/* CSS Stylesheet for Animations */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 45s linear infinite;
        }
        .animate-marquee-reverse {
          display: flex;
          width: max-content;
          animation: marquee-reverse 45s linear infinite;
        }
        .animate-marquee:hover, .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
