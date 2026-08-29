"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Search, MapPin, ChevronRight, Check, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// ─── Cycling role words ────────────────────────────────────────────────────────
const ROLES = [
    "Engineers",
    "Designers",
    "Product Managers",
    "Data Scientists",
    "DevOps Engineers",
    "Finance Analysts",
    "AI Researchers",
];

// ─── Live hires ───────────────────────────────────────────────────────────────
const HIRES = [
    { initials: "AK", name: "Ananya K.", role: "Frontend Engineer", company: "Stripe", country: "London" },
    { initials: "JR", name: "James R.", role: "Data Scientist", company: "Google", country: "NYC" },
    { initials: "SC", name: "Sofia C.", role: "Product Manager", company: "Shopify", country: "Toronto" },
    { initials: "TM", name: "Tariq M.", role: "DevOps Lead", company: "Amazon", country: "Dubai" },
    { initials: "CW", name: "Chen W.", role: "ML Engineer", company: "Meta", country: "Singapore" },
];

// ─── Feature list ─────────────────────────────────────────────────────────────
const FEATURES = [
    "Direct recruiter access",
    "ATS resume checker",
    "AI job matching",
    "Global & remote roles",
];

// ─── Recent jobs feed ─────────────────────────────────────────────────────────
const RECENT_JOBS = [
    { title: "Senior Frontend Engineer", company: "Stripe", location: "Remote · UK", tag: "Full-time", salary: "£90–120K", dot: "#635BFF" },
    { title: "Staff Product Designer", company: "Figma", location: "San Francisco, US", tag: "Hybrid", salary: "$140–170K", dot: "#0ACF83" },
    { title: "Data Scientist II", company: "Netflix", location: "Los Gatos, US", tag: "On-site", salary: "$160–200K", dot: "#E50914" },
    { title: "Engineering Manager", company: "Atlassian", location: "Remote · AUS", tag: "Full-time", salary: "A$180–220K", dot: "#0052CC" },
];

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(words: string[], typingSpeed = 70, pause = 2400, deletingSpeed = 40) {
    const [text, setText] = useState(words[0]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [wordIndex, setWordIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(words[0].length);

    useEffect(() => {
        const current = words[wordIndex];
        let timer: NodeJS.Timeout;

        if (!isDeleting && charIndex < current.length) {
            timer = setTimeout(() => setCharIndex(i => i + 1), typingSpeed);
        } else if (!isDeleting && charIndex === current.length) {
            timer = setTimeout(() => setIsDeleting(true), pause);
        } else if (isDeleting && charIndex > 0) {
            timer = setTimeout(() => setCharIndex(i => i - 1), deletingSpeed);
        } else {
            setIsDeleting(false);
            setWordIndex(w => (w + 1) % words.length);
        }

        setText(current.slice(0, charIndex));
        return () => clearTimeout(timer);
    }, [charIndex, isDeleting, wordIndex, words, typingSpeed, pause, deletingSpeed]);

    return text;
}

// ─── Animated number ──────────────────────────────────────────────────────────
function AnimatedNumber({ to, suffix = "" }: { to: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const duration = 1400;
        const step = 16;
        const increment = to / (duration / step);
        const timer = setInterval(() => {
            start += increment;
            if (start >= to) { setCount(to); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, step);
        return () => clearInterval(timer);
    }, [inView, to]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function HeroSection() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [location, setLocation] = useState("");
    const [hireIdx, setHireIdx] = useState(0);

    const typedRole = useTypewriter(ROLES);

    useEffect(() => {
        const id = setInterval(() => setHireIdx(i => (i + 1) % HIRES.length), 4000);
        return () => clearInterval(id);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const p = new URLSearchParams();
        if (query) p.set("search", query);
        if (location) p.set("location", location);
        router.push(`/jobs?${p.toString()}`);
    };

    const hire = HIRES[hireIdx];

    return (
        <section className="relative bg-white dark:bg-[hsl(220_65%_6%)] pt-16 pb-0 overflow-hidden">

            {/* ── Very subtle noise texture overlay ───────────────────────── */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.022] dark:opacity-[0.04]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                    backgroundSize: "128px",
                }}
            />



            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ═══════════════════ MAIN ROW ════════════════════════════ */}
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-start py-16 lg:py-24">

                    {/* ── LEFT ── */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.1 } }, hidden: {} }}
                        className="space-y-8"
                    >
                       

                        {/* Headline */}
                        <motion.div
                            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                        >
                            <h1 className="text-[2.75rem] sm:text-5xl lg:text-[3.4rem] leading-[1.1] font-bold text-slate-900 dark:text-white tracking-tight">
                                The world is hiring{" "}
                                <br className="hidden sm:block" />
                                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                                    {typedRole}
                                    <span
                                        className="inline-block w-[2px] h-[0.85em] bg-indigo-600 dark:bg-indigo-400 rounded-sm align-middle ml-0.5"
                                        style={{ animation: "blink 1s step-end infinite" }}
                                    />
                                </span>
                            </h1>
                        </motion.div>

                        {/* Sub copy */}
                        <motion.p
                            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
                            className="text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-lg"
                        >
                            Apply directly to verified recruiters worldwide. No middlemen, no spam —
                            just real jobs matched to your skills.
                        </motion.p>

                        {/* Feature checklist */}
                        <motion.ul
                            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
                            className="grid grid-cols-2 gap-x-6 gap-y-2"
                        >
                            {FEATURES.map(f => (
                                <motion.li
                                    key={f}
                                    variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3 } } }}
                                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
                                >
                                    <span className="w-4 h-4 rounded-full border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
                                        <Check className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" />
                                    </span>
                                    {f}
                                </motion.li>
                            ))}
                        </motion.ul>

                        {/* Search form */}
                        <motion.form
                            variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                            onSubmit={handleSearch}
                        >
                            {/* Wrapper — vertical on mobile, horizontal on sm+ */}
                            <div className="flex flex-col sm:flex-row bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-200">
                                {/* Job title field */}
                                <label className="flex items-center gap-2.5 flex-1 px-4 py-3.5 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 cursor-text">
                                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        placeholder="Job title or keyword"
                                        className="flex-1 w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border-0 ring-0 outline-0 focus:border-0 focus:ring-0 focus:outline-none min-w-0"
                                    />
                                </label>
                                {/* Location field */}
                                <label className="flex items-center gap-2.5 flex-1 px-4 py-3.5 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 cursor-text">
                                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={e => setLocation(e.target.value)}
                                        placeholder="Location or Remote"
                                        className="flex-1 w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border-0 ring-0 outline-0 focus:border-0 focus:ring-0 focus:outline-none min-w-0"
                                    />
                                </label>
                                {/* Submit button */}
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto text-center px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold transition-colors duration-150 whitespace-nowrap"
                                >
                                    Search Jobs
                                </button>
                            </div>

                            {/* Popular searches */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3">
                                <span className="text-[11px] text-slate-400 dark:text-slate-500">Popular:</span>
                                {["Remote", "React Developer", "Product Manager", "Python", "UI Designer"].map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => { setQuery(s); router.push(`/jobs?search=${encodeURIComponent(s)}`); }}
                                        className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium underline-offset-2 hover:underline"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </motion.form>

                        {/* Stats row */}
                        <motion.div
                            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5, delay: 0.1 } } }}
                            className="flex items-center gap-8 pt-2 border-t border-slate-100 dark:border-slate-800"
                        >
                            {[
                                { to: 50000, suffix: "+", label: "Open roles" },
                                { to: 120, suffix: "+", label: "Countries" },
                                { to: 10000, suffix: "+", label: "Recruiters" },
                            ].map(stat => (
                                <div key={stat.label}>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                                        <AnimatedNumber to={stat.to} suffix={stat.suffix} />
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* ── RIGHT — Jobs panel ─────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="hidden lg:block"
                    >
                        {/* Panel shell */}
                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-900">

                            {/* Panel header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                                </div>
                                
                                <div className="w-16" />
                            </div>

                            {/* Job list */}
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {RECENT_JOBS.map((job, i) => (
                                    <motion.div
                                        key={job.title}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1, duration: 0.35 }}
                                        onClick={() => router.push(`/jobs?search=${encodeURIComponent(job.title)}`)}
                                        className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer group transition-colors duration-150"
                                    >
                                        {/* Company dot */}
                                        <div
                                            className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-white font-bold text-sm"
                                            style={{ backgroundColor: job.dot + "22", border: `1px solid ${job.dot}33` }}
                                        >
                                            <span style={{ color: job.dot }} className="text-sm font-black">
                                                {job.company.charAt(0)}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{job.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {job.company} · {job.location}
                                            </p>
                                        </div>

                                        {/* Right */}
                                        <div className="text-right shrink-0">
                                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{job.salary}</p>
                                            <span className="inline-block mt-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                                {job.tag}
                                            </span>
                                        </div>

                                        {/* Arrow — visible on hover */}
                                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors shrink-0" />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Panel footer */}
                            <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                                <span className="text-xs text-slate-400 dark:text-slate-500">Updated a moment ago</span>
                                <button
                                    onClick={() => router.push("/jobs")}
                                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                >
                                    Browse all jobs
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {/* Live hire notification below panel */}
                        <div className="mt-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={hireIdx}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm"
                                >
                                    {/* Avatar initials */}
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-xs font-bold shrink-0">
                                        {hire.initials}
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{hire.name}</span>
                                        {" "}landed a{" "}
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{hire.role}</span>
                                        {" "}role at{" "}
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{hire.company}</span>
                                    </p>
                                    
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                
            </div>

            {/* Blink cursor keyframe */}
            <style jsx>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </section>
    );
}