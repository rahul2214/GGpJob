"use client";

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect } from 'react';

const reviews = [
    { name: "Arjun P.", role: "Frontend Dev", company: "Meta", text: "Got a direct response from the recruiter within 20 mins. The hiring lead gave me context on the team's stack which helped me clear the interview.", date: "2 days ago", rating: 5, location: "London, UK" },
    { name: "Sarah J.", role: "Data Scientist", company: "Stripe", text: "Way better than cold outreach on LinkedIn. The transparency of the application tracking is phenomenal.", date: "1 week ago", rating: 5, location: "Toronto, CA" },
    { name: "Rahul M.", role: "Lead Recruiter", company: "Google", text: "I post roles here because the quality of candidate profiles is extremely high. Saves our team hours of screening.", date: "2 weeks ago", rating: 5, location: "Bangalore, IN" },
    { name: "Emily C.", role: "Backend Eng", company: "Netflix", text: "Direct application and in-app chat with the hiring team worked seamlessly. Smooth experience from start to finish.", date: "1 month ago", rating: 5, location: "San Francisco, US" },
    { name: "Ken T.", role: "UI/UX Designer", company: "Apple", text: "Cleanest job portal UI I've seen. Landed my dream role through direct application to a design lead here.", date: "1 month ago", rating: 5, location: "Tokyo, JP" }
];

export function ReviewsSection() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ 
        loop: true, 
        align: 'start',
        dragFree: true
    });
    
    // Auto scroll logic
    useEffect(() => {
        if (!emblaApi) return;
        const interval = setInterval(() => {
            emblaApi.scrollNext();
        }, 4000);
        return () => clearInterval(interval);
    }, [emblaApi]);

    return (
        <section className="py-24 bg-slate-50 dark:bg-[hsl(220_65%_6%)] relative overflow-hidden transition-colors duration-300">
            {/* Background */}
            <div className="absolute inset-0 bg-noise opacity-50" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

            <div className="container-xl relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    
                    <h2 className="section-heading mt-4 mb-6">
                        Trusted by <span className="text-gradient-primary">Thousands</span> Worldwide
                    </h2>
                    <p className="section-subheading mx-auto">
                        Real candidates and recruiters connecting, interviewing, and landing dream roles across the globe.
                    </p>
                </div>

                <div className="relative">
                    <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
                        <div className="flex gap-6 py-4">
                            {reviews.map((review, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" as any }}
                                    className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0"
                                >
                                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 h-full flex flex-col hover-lift group shadow-sm">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex gap-1">
                                                {[...Array(review.rating)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                ))}
                                            </div>
                                            <Quote className="w-8 h-8 text-slate-300 dark:text-white/5 group-hover:text-violet-500/20 transition-colors" />
                                        </div>
                                        
                                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-8 flex-1 italic">
                                            "{review.text}"
                                        </p>
                                        
                                        <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-100 dark:border-white/10">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                                                {review.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{review.name}</h4>
                                                <p className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold">{review.role} @ {review.company}</p>
                                                <p className="text-[9px] text-slate-500 mt-0.5">{review.location} • {review.date}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Gradient masks for smooth edges */}
                    <div className="absolute top-0 bottom-0 left-0 w-12 sm:w-24 bg-gradient-to-r  to-transparent z-10 pointer-events-none" />
                    <div className="absolute top-0 bottom-0 right-0 w-12 sm:w-24 bg-gradient-to-l  to-transparent z-10 pointer-events-none" />
                </div>
            </div>
        </section>
    );
}
