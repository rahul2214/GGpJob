import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/lib/types";
import { MapPin, Briefcase, Clock, Star, CheckCircle, BadgeDollarSign, Users, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TrustScoreBadge } from "./trust-score-badge";

interface JobCardProps {
  job: Job;
  isApplied?: boolean;
  hideDetails?: boolean;
  onSaveToggle?: (jobId: string, isCurrentlySaved: boolean) => void;
}

export default function JobCard({ job, isApplied = false, hideDetails = false }: JobCardProps) {

  const isCorporateEmail = (email?: string | null) => {
    if (!email) return false;
    const lower = email.toLowerCase();
    const publicDomains = ['@gmail.', '@yahoo.', '@outlook.', '@hotmail.', '@live.', '@icloud.', '@aol.', '@ymail.', '@rocketmail.'];
    return !publicDomains.some(d => lower.includes(d));
  };

  return (
    <Link href={`/jobs/${job.uuid || job.id}`} className="block hover:shadow-lg transition-shadow duration-300 rounded-lg h-full">
      <Card className="h-full flex flex-col md:border relative">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 pr-2 sm:pr-10">
              <CardTitle className="text-base sm:text-lg truncate font-bold text-slate-900">{job.title}</CardTitle>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-indigo-600 font-semibold mt-0.5 min-w-0">
                <CardDescription className="truncate font-semibold text-indigo-600 max-w-[150px] sm:max-w-none">{job.companyName}</CardDescription>
                {job.job_role && (
                  <>
                    <span className="text-gray-300 shrink-0">•</span>
                    <span className="truncate text-slate-500 max-w-[120px] sm:max-w-none">{job.job_role}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {job.isReferral && (
                <div className="flex flex-col items-end gap-1.5">
                    <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200 ml-2 shrink-0 font-bold">
                      <Star className="h-3 w-3" />
                      Referral
                    </Badge>
                    {job.isReferral && (job as any).employeeTrustScore >= 90 && isCorporateEmail((job as any).employeeEmail) && (
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 text-[10px] font-bold uppercase tracking-tight">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified Hire
                        </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex flex-col space-y-3 text-xs sm:text-sm text-muted-foreground">
            <div className="grid grid-cols-2 gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{job.location}</span>
                </div>
                 <div className="flex items-center gap-2 min-w-0">
                    <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{job.type}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <BadgeDollarSign className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">
                {job.salaryMin && job.salaryMax 
                    ? `₹ ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                    : 'Not Disclosed'}
                </span>
            </div>

            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <div className="text-xs text-muted-foreground truncate pt-1">
                <span className="font-semibold text-slate-700">Skills:</span> {job.requiredSkills.join(', ')}
              </div>
            )}

          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t border-slate-50 pt-4">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 tracking-wider">
            <Clock className="h-4 w-4" />
            {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
          </div>
          <div className="flex items-center gap-2">
            {isApplied && (
              <Badge variant="secondary" className="flex items-center gap-1.5 border-green-300 bg-green-50 text-green-800 text-[10px]">
                <CheckCircle className="h-3 w-3" />
                Applied
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
