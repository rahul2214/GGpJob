
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
import { CheckCircle, GraduationCap, Layers, ThumbsUp } from 'lucide-react';

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'Super Admin' || user.role === 'Admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [user, loading, router]);
  

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
       return (
         <div className="flex flex-col">
            <section className="h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center p-4 bg-background">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Welcome to VELTRIA Job Portal</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                Your premier destination for connecting with top talent and finding the perfect job opportunity. Explore thousands of listings today.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button asChild size="lg">
                    <Link href="/login">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/jobs">Browse Jobs</Link>
                </Button>
                </div>
            </section>

             <section className="py-16 sm:py-24 bg-muted/40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight">Hiring in Top MNCs</h2>
                        <p className="mt-4 text-lg text-muted-foreground">Join the world's leading companies.</p>
                    </div>
                    <div className="mt-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
                        {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix'].map((company) => (
                            <div key={company} className="flex justify-center">
                                <span className="text-2xl font-semibold text-muted-foreground/80">{company}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

             <section className="py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight">Find Your Perfect Fit</h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Whatever your career goals, we have an opportunity for you. Explore a wide range of jobs tailored to your skills and aspirations.
                        </p>
                    </div>
                     <div className="mt-12 grid md:grid-cols-3 gap-8">
                        <Card>
                            <CardHeader className="items-center text-center">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <Layers className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle>Diverse Job Domains</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-muted-foreground">From tech and finance to creative arts, explore opportunities across a wide spectrum of industries.</p>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader className="items-center text-center">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <ThumbsUp className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle>Exclusive Referrals</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                               <p className="text-muted-foreground">Get a competitive edge with jobs posted by company insiders. Referrals increase your chances of getting hired.</p>
                            </CardContent>
                        </Card>
                         <Card>
                             <CardHeader className="items-center text-center">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <GraduationCap className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle>Internship Opportunities</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-muted-foreground">Kickstart your career. Find paid internships and entry-level positions at top companies to gain valuable experience.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-24 bg-muted/40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1">
                             <h2 className="text-3xl font-bold tracking-tight">Unlock Your Career with Referrals</h2>
                             <p className="mt-4 text-lg text-muted-foreground">
                                Get an edge in your job search. Employee referrals are one of the most effective ways to land your dream job.
                             </p>
                             <ul className="mt-6 space-y-4">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-6 w-6 text-primary mt-1" />
                                    <div>
                                        <h3 className="font-semibold">Stand Out from the Crowd</h3>
                                        <p className="text-muted-foreground">Referred candidates are often fast-tracked through the application process.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-6 w-6 text-primary mt-1" />
                                    <div>
                                        <h3 className="font-semibold">Gain Insider Information</h3>
                                        <p className="text-muted-foreground">Connect with employees to learn about company culture and the role.</p>
                                    </div>
                                </li>
                                 <li className="flex items-start gap-3">
                                    <CheckCircle className="h-6 w-6 text-primary mt-1" />
                                    <div>
                                        <h3 className="font-semibold">Increase Your Chances</h3>
                                        <p className="text-muted-foreground">Studies show referrals have a significantly higher chance of getting hired.</p>
                                    </div>
                                </li>
                             </ul>
                        </div>
                         <div className="order-1 md:order-2">
                             <Image 
                                src="https://picsum.photos/seed/referral/600/500"
                                alt="Job Referrals"
                                width={600}
                                height={500}
                                className="rounded-lg shadow-lg"
                                data-ai-hint="team collaboration"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
       );
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
        // Redirect is handled by useEffect, show a loader or null
        return (
             <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <p>Loading Admin Dashboard...</p>
             </div>
        )
      default:
         router.push('/login');
         return null;
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {renderDashboard()}
    </div>
  );
}
