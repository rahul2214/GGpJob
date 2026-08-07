"use client";

import Link from 'next/link';
import { Twitter, Linkedin, Globe, Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-slate-300 py-16 border-t border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="container-xl relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="md:col-span-1">
                        <Link href="/" className="inline-flex items-center gap-2 font-black text-2xl tracking-tight mb-4 text-white hover-scale">
                            
                            Jobs<span className="text-gradient-primary">Dart</span>
                        </Link>
                        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                            The world's premium referral network. Connect directly with verified insiders at top tech companies worldwide and skip the ATS black hole.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://www.linkedin.com/company/jobsdart"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="JobsDart LinkedIn"
                                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-violet-400 hover:bg-white/10 transition-colors"
                            >
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a
                                href="https://twitter.com/jobsdart"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="JobsDart Twitter"
                                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-violet-400 hover:bg-white/10 transition-colors"
                            >
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a
                                href="https://jobsdart.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="JobsDart Platform"
                                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-violet-400 hover:bg-white/10 transition-colors"
                            >
                                <Globe className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Platform</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/jobs" className="hover:text-violet-400 transition-colors">Browse Global Jobs</Link></li>
                            <li><Link href="/companies" className="hover:text-violet-400 transition-colors">Top Companies</Link></li>
                            <li><Link href="/pricing" className="hover:text-violet-400 transition-colors">Pricing & Credits</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Resources</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/ats-score" className="hover:text-violet-400 transition-colors flex items-center gap-2">ATS Checker </Link></li>
                            <li><Link href="/resume-builder" className="hover:text-violet-400 transition-colors">Resume Builder</Link></li>
                            <li><Link href="/blog" className="hover:text-violet-400 transition-colors">Career Blog</Link></li>
                            <li><Link href="/faq" className="hover:text-violet-400 transition-colors">Help Center / FAQ</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/privacy" className="hover:text-violet-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-violet-400 transition-colors">Terms of Service</Link></li>
                            <li><Link href="/refund" className="hover:text-violet-400 transition-colors">Refund Policy</Link></li>
                            <li><Link href="/contact" className="hover:text-violet-400 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                        &copy; {new Date().getFullYear()} JobsDart Global. All rights reserved.
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        Made with <Heart className="w-3 h-3 text-red-500 fill-red-500/20" /> for the global tech community.
                    </p>
                </div>
            </div>
        </footer>
    );
}
