import Link from 'next/link';
import { Linkedin, Instagram, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 py-16 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          
          {/* Col 1: Brand & Social External Links */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 font-black text-2xl tracking-tight mb-4 text-white hover-scale">
              <img src="/logo.png" alt="JobsDart Logo" className="h-8 w-auto object-contain" />
              <span>Jobs<span className="text-gradient-primary">Dart</span></span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              India&apos;s leading employee referral network. Connect directly with verified insiders at 500+ MNCs and bypass the ATS black hole.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <a
                href="https://www.instagram.com/jobsdartofficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="JobsDart Official Instagram Profile"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-pink-400 hover:bg-white/10 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/veltria"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="JobsDart Official LinkedIn Page"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:bg-white/10 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Popular Categories */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Top Job Roles</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/jobs?category=software-engineering" className="hover:text-violet-400 transition-colors">Software Engineering Jobs</Link></li>
              <li><Link href="/jobs?category=frontend" className="hover:text-violet-400 transition-colors">Frontend Developer Roles</Link></li>
              <li><Link href="/jobs?category=backend" className="hover:text-violet-400 transition-colors">Backend Engineer Jobs</Link></li>
              <li><Link href="/jobs?category=ai-ml" className="hover:text-violet-400 transition-colors">AI &amp; Machine Learning Jobs</Link></li>
              <li><Link href="/jobs?category=product-management" className="hover:text-violet-400 transition-colors">Product Management Roles</Link></li>
              <li><Link href="/jobs?category=devops" className="hover:text-violet-400 transition-colors">DevOps &amp; Cloud Jobs</Link></li>
            </ul>
          </div>

          {/* Col 3: Popular Locations */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Jobs by Location</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/jobs?location=Bengaluru" className="hover:text-violet-400 transition-colors">Jobs in Bengaluru</Link></li>
              <li><Link href="/jobs?location=Hyderabad" className="hover:text-violet-400 transition-colors">Jobs in Hyderabad</Link></li>
              <li><Link href="/jobs?location=Pune" className="hover:text-violet-400 transition-colors">Jobs in Pune</Link></li>
              <li><Link href="/jobs?location=Gurugram" className="hover:text-violet-400 transition-colors">Jobs in Gurugram</Link></li>
              <li><Link href="/jobs?location=Remote" className="hover:text-violet-400 transition-colors">Remote Work Opportunities</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform Resources */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Resources &amp; Tools</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/jobs" className="hover:text-violet-400 transition-colors">Browse All Global Jobs</Link></li>
              <li><Link href="/companies" className="hover:text-violet-400 transition-colors">Explore Top MNC Companies</Link></li>
              <li><Link href="/ats-score" className="hover:text-violet-400 transition-colors">Free ATS Resume Checker</Link></li>
              <li><Link href="/resume-builder" className="hover:text-violet-400 transition-colors">AI Resume Builder Tool</Link></li>
              <li><Link href="/communities" className="hover:text-violet-400 transition-colors">Tech &amp; Career Communities</Link></li>
              <li><Link href="/pricing" className="hover:text-violet-400 transition-colors">Pricing &amp; Credit Plans</Link></li>
            </ul>
          </div>

          {/* Col 5: Account & Legal */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Account &amp; Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/login" className="hover:text-violet-400 transition-colors">Candidate Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-violet-400 transition-colors">Create Free Account</Link></li>
              <li><Link href="/privacy" className="hover:text-violet-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-violet-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-violet-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
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
