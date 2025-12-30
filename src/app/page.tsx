
"use client";

import { useUser } from '@/contexts/user-context';
import { useRouter } from 'next/navigation';
import JobSeekerDashboard from "@/components/dashboards/job-seeker-dashboard";
import RecruiterDashboard from "@/components/dashboards/recruiter-dashboard";
import EmployeeDashboard from "@/components/dashboards/employee-dashboard";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { CheckCircle, GraduationCap, LayoutGrid, ThumbsUp, Users, DollarSign, Zap, Rocket, Lightbulb, TrendingUp, Network, UserCheck, Trophy, FileSignature, Globe, UserRound, Apple, Bot, GitMerge, Clapperboard, Code } from 'lucide-react';
import { AnimatedCounter } from '@/components/animated-counter';

const JobPortalHome = () => {
    const router = useRouter();

    useEffect(() => {
        const animateOnScroll = () => {
            const elements = document.querySelectorAll('.feature-card, .step, .stat-item, .referral-card, .company-card');
            elements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                if (elementTop < windowHeight - 100) {
                    element.classList.add('animate');
                }
            });
        };

        window.addEventListener('load', animateOnScroll);
        window.addEventListener('scroll', animateOnScroll);

        const buttons = document.querySelectorAll<HTMLElement>('#job-portal-page .btn');
        buttons.forEach(button => {
            const mouseEnterHandler = () => {
                button.style.transform = 'translateY(-3px)';
            };
            const mouseLeaveHandler = () => {
                button.style.transform = 'translateY(0)';
            };
            button.addEventListener('mouseenter', mouseEnterHandler);
            button.addEventListener('mouseleave', mouseLeaveHandler);
        });

        // Animate stats on scroll
        const statsSection = document.getElementById('stats');
        if (statsSection) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    const statItems = statsSection.querySelectorAll('.stat-item');
                    statItems.forEach(item => item.classList.add('animate'));
                    observer.disconnect();
                }
            }, { threshold: 0.5 });
            observer.observe(statsSection);
        }


        return () => {
            window.removeEventListener('load', animateOnScroll);
            window.removeEventListener('scroll', animateOnScroll);
            buttons.forEach(button => {
                 button.removeEventListener('mouseenter', () => {});
                 button.removeEventListener('mouseleave', () => {});
            })
        };
    }, []);

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const searchQuery = formData.get('search') as string;
        const newParams = new URLSearchParams();
        if (searchQuery) {
            newParams.set('search', searchQuery);
        }
        router.push(`/jobs?${newParams.toString()}`);
    };


    return (
        <div id="job-portal-page">
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1>Find Your Dream Job or Top Talent</h1>
                            <p>Your premier destination for connecting with top talent and finding the perfect job opportunity. Explore thousands of listings today.</p>
                            <form className="search-box" onSubmit={handleSearch}>
                                <input name="search" type="text" placeholder="Job title, keywords, or company" />
                                <input type="text" placeholder="City, state, or remote" disabled />
                                <button type="submit" className="btn btn-primary">Search Jobs</button>
                            </form>
                        </div>
                        <div className="hero-image">
                            <div className="floating-card">
                                <h3>Senior Developer</h3>
                                <p>Tech Company • Remote • $90k-$120k</p>
                                <ThumbsUp className="h-4 w-4" style={{ position: 'absolute', right: '20px', bottom: '20px', color: '#f72585' }} />
                            </div>
                            <div className="floating-card">
                                <h3>Marketing Manager</h3>
                                <p>Creative Agency • New York • $75k-$95k</p>
                            </div>
                            <div className="floating-card">
                                <h3>UX Designer</h3>
                                <p>Startup • Hybrid • $80k-$110k</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="features" id="features">
                <div className="container">
                    <div className="section-title">
                        <h2>Why Choose Job Portal?</h2>
                        <p>Our platform is designed to make job hunting and hiring simple, effective, and accessible to everyone.</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Users />
                            </div>
                            <h3>Inclusive Platform</h3>
                            <p>We believe everyone deserves equal opportunities. Our platform is designed to be accessible to job seekers and employers from all backgrounds.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <DollarSign />
                            </div>
                            <h3>Completely Free</h3>
                            <p>Post jobs, apply for positions, and connect with potential employers or employees without any fees. We have removed the financial barriers.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Zap />
                            </div>
                            <h3>Quick & Easy</h3>
                            <p>Our streamlined process makes job posting and application submission fast and straightforward. Save time with our intuitive interface.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="how-it-works" id="how-it-works">
                <div className="container">
                    <div className="section-title">
                        <h2>How It Works</h2>
                        <p>Getting started with Job Portal is simple for both job seekers and employers.</p>
                    </div>
                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Create Your Profile</h3>
                            <p>Sign up and build your professional profile in minutes. Highlight your skills, experience, and what you are looking for.</p>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Post or Search</h3>
                            <p>Employers can post jobs for free. Job seekers can browse thousands of opportunities across various industries.</p>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Connect & Succeed</h3>
                            <p>Apply for jobs or review applications. Our platform facilitates direct communication between employers and candidates.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="stats" id="stats">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <h3 className="flex items-center justify-center">
                                <AnimatedCounter value={50} />K+
                            </h3>
                            <p>Jobs Posted</p>
                        </div>
                        <div className="stat-item">
                            <h3 className="flex items-center justify-center">
                                <AnimatedCounter value={200} />K+
                            </h3>
                            <p>Active Users</p>
                        </div>
                        <div className="stat-item">
                            <h3 className="flex items-center justify-center">
                                <AnimatedCounter value={85} />%
                            </h3>
                            <p>Success Rate</p>
                        </div>
                        <div className="stat-item">
                             <h3 className="flex items-center justify-center">
                                <AnimatedCounter value={150} />+
                            </h3>
                            <p>Countries</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="top-mncs" id="top-mncs">
                <div className="container">
                    <div className="mncs-header">
                        <h2>Hiring in Top MNCs</h2>
                        <p>Join the worlds leading companies. Explore opportunities at these industry giants.</p>
                    </div>
                    <div className="companies-grid">
                        <div className="company-card">
                            <div className="hiring-badge">Hiring!</div>
                            <div className="company-logo">
                                <Bot />
                            </div>
                            <div className="company-name">Google</div>
                            <div className="company-jobs">120+ Open Roles</div>
                        </div>
                        <div className="company-card">
                            <div className="hiring-badge">Hiring!</div>
                            <div className="company-logo">
                                <Code />
                            </div>
                            <div className="company-name">Microsoft</div>
                            <div className="company-jobs">95+ Open Roles</div>
                        </div>
                        <div className="company-card">
                            <div className="hiring-badge">Hiring!</div>
                            <div className="company-logo">
                                <GitMerge />
                            </div>
                            <div className="company-name">Amazon</div>
                            <div className="company-jobs">150+ Open Roles</div>
                        </div>
                        <div className="company-card">
                            <div className="hiring-badge">Hiring!</div>
                            <div className="company-logo">
                                <ThumbsUp />
                            </div>
                            <div className="company-name">Meta</div>
                            <div className="company-jobs">80+ Open Roles</div>
                        </div>
                        <div className="company-card">
                            <div className="hiring-badge">Hiring!</div>
                            <div className="company-logo">
                                <Apple />
                            </div>
                            <div className="company-name">Apple</div>
                            <div className="company-jobs">65+ Open Roles</div>
                        </div>
                        <div className="company-card">
                            <div className="hiring-badge">Hiring!</div>
                            <div className="company-logo">
                                <Clapperboard />
                            </div>
                            <div className="company-name">Netflix</div>
                            <div className="company-jobs">45+ Open Roles</div>
                        </div>
                    </div>
                </div>
            </section>

             <section className="referral-benefits" id="job-referrals">
                <div className="container">
                    <div className="benefits-container">
                        <div className="benefits-content">
                            <h2>Unlock Your Career with Referrals</h2>
                            <p>Get an edge in your job search. Employee referrals are one of the most effective ways to land your dream job.</p>
                            <ul className="benefits-list">
                                <li>
                                    <Rocket className="h-6 w-6 text-green-500 mr-4" />
                                    <span><strong>Stand Out from the Crowd:</strong> Referred candidates are often fast-tracked through the application process.</span>
                                </li>
                                <li>
                                    <Lightbulb className="h-6 w-6 text-yellow-500 mr-4" />
                                    <span><strong>Gain Insider Information:</strong> Connect with employees to learn about company culture and the role.</span>
                                </li>
                                <li>
                                    <TrendingUp className="h-6 w-6 text-blue-500 mr-4" />
                                    <span><strong>Increase Your Chances:</strong> Studies show referrals have a significantly higher chance of getting hired.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="benefits-visual">
                            <div className="floating-element">
                                <div className="element-icon"><Network /></div>
                                <div className="element-text">Stronger Network</div>
                            </div>
                            <div className="floating-element">
                                <div className="element-icon"><UserCheck /></div>
                                <div className="element-text">Priority Review</div>
                            </div>
                            <div className="floating-element">
                                <div className="element-icon"><Trophy /></div>
                                <div className="element-text">Higher Success</div>
                            </div>
                            <div className="floating-element">
                                <div className="element-icon"><FileSignature /></div>
                                <div className="element-text">Get Hired Faster</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="referrals-showcase" id="referrals">
                <div className="container">
                    <div className="referrals-header">
                        <h2>Find Your Perfect Fit</h2>
                        <p>Get an edge in your job search. Employee referrals are one of the most effective ways to land your dream job.</p>
                    </div>
                    
                    <div className="referrals-grid">
                        <div className="referral-card">
                            <div className="referral-icon">
                                <Globe />
                            </div>
                            <h3>Diverse Job Domains</h3>
                            <p>From tech and finance to creative arts, explore opportunities across a wide spectrum of industries. Find your perfect fit in any field.</p>
                            <div className="referral-stats">
                                <div className="stat">
                                    <span className="stat-value">50+</span>
                                    <span className="stat-label">Industries</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">10K+</span>
                                    <span className="stat-label">Companies</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="referral-card">
                            <div className="referral-icon">
                                <UserRound />
                            </div>
                            <h3>Exclusive Referrals</h3>
                            <p>Get a competitive edge with jobs posted by company insiders. Referrals increase your chances of getting hired by up to 15x.</p>
                            <div className="referral-stats">
                                <div className="stat">
                                    <span className="stat-value">5x</span>
                                    <span className="stat-label">More Interviews</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">40%</span>
                                    <span className="stat-label">Hire Rate</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="referral-card">
                            <div className="referral-icon">
                                <GraduationCap />
                            </div>
                            <h3>Internship Opportunities</h3>
                            <p>Kickstart your career. Find paid internships and entry-level positions at top companies to gain valuable experience.</p>
                            <div className="referral-stats">
                                <div className="stat">
                                    <span className="stat-value">5K+</span>
                                    <span className="stat-label">Internships</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">70%</span>
                                    <span className="stat-label">Convert to FT</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className="referral-cta">
                <div className="container">
                    <h2>Ready to Boost Your Career with Referrals?</h2>
                    <p>Join thousands of job seekers who have landed their dream jobs through our referral-powered platform. Employees can post referrals and help others while building their professional network.</p>
                    <div className="cta-buttons">
                        <Link href="/jobs?isReferral=true" className="btn btn-outline btn-large">Browse Referral Jobs</Link>
                        <Link href="/referrals/post" className="btn btn-primary btn-large">Post a Referral</Link>
                    </div>
                </div>
            </section>

            <section className="cta" id="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Find Your Next Opportunity?</h2>
                        <p>Join thousands of employers and job seekers who have already found success with Job Portal.</p>
                        <div className="cta-buttons">
                            <Button asChild className="btn btn-primary btn-large">
                                <Link href="/company/signup">Post a Job for Free</Link>
                            </Button>
                            <Button asChild className="btn btn-outline btn-large" style={{borderColor: 'var(--job-portal-primary)', color: 'var(--job-portal-primary)'}}>
                                <Link href="/jobs">Browse Jobs</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center p-4">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2" />
             <div className="mt-8 flex flex-wrap justify-center gap-4">
               <Skeleton className="h-12 w-32" />
               <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    if (!user) {
       return <JobPortalHome />;
    }
    
    switch(user.role) {
      case "Job Seeker":
        return <JobSeekerDashboard />;
      case "Recruiter":
        return <RecruiterDashboard />;
      case "Employee":
        return <EmployeeDashboard />;
      case "Admin":
      case "Super Admin":
        router.push('/admin/dashboard');
        return (
             <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <p>Redirecting to Admin Dashboard...</p>
             </div>
        )
      default:
         router.push('/login');
         return null;
    }
  }

  return (
    <div>
      {renderDashboard()}
    </div>
  );
}
