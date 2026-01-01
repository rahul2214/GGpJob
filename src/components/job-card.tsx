import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/lib/types";
import { MapPin, Briefcase, Clock, Star, CheckCircle, BadgeDollarSign, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface JobCardProps {
  job: Job;
  isApplied?: boolean;
  isSaved?: boolean;
  hideDetails?: boolean;
  onSaveToggle?: (jobId: string, isCurrentlySaved: boolean) => void;
}

export default function JobCard({ job, isApplied = false, isSaved = false, hideDetails = false, onSaveToggle }: JobCardProps) {
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(isSaved);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSaveToggle?.(job.id, isBookmarked);
    setIsBookmarked(!isBookmarked);
    toast({
      title: !isBookmarked ? "Job Saved" : "Job Unsaved",
      description: `"${job.title}" has been ${!isBookmarked ? 'added to' : 'removed from'} your saved jobs.`,
    })
  }

  return (
    <Link href={`/jobs/${job.id}`} className="block hover:shadow-lg transition-shadow duration-300 rounded-lg h-full">
      <Card className="h-full flex flex-col md:border relative">
         {onSaveToggle && (
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={handleSaveClick}
                aria-label={isBookmarked ? 'Unsave job' : 'Save job'}
            >
                <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-primary text-primary")} />
            </Button>
         )}
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 pr-10">
              <CardTitle className="text-lg truncate">{job.title}</CardTitle>
              <CardDescription className="truncate">{job.companyName}</CardDescription>
            </div>
            {job.isReferral && (
              <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200 ml-2 shrink-0">
                <Star className="h-3 w-3" />
                Referral
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{job.location}</span>
            </div>
            {!hideDetails && (
              <>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span>{job.type}</span>
                </div>
                <div className="flex items-center gap-2">
                    <BadgeDollarSign className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">{job.salary || 'Not Disclosed'}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
          </div>
          {isApplied && (
              <Badge variant="secondary" className="flex items-center gap-1.5 border-green-300 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  Applied
              </Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
