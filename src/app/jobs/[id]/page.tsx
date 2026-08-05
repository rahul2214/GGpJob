import { Metadata, ResolvingMetadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import JobDetailsClient from './job-details-client';

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;

  try {
    const { data: jobData, error } = await supabaseAdmin
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error || !jobData) {
        return {
           title: 'Job Not Found - Job Portal',
           description: 'The job you are looking for does not exist or has been removed.',
        };
    }
    
    const title = `${jobData.title} at ${jobData.company_name}`;
    const desc = jobData.description ? 
                 (jobData.description.length > 150 ? jobData.description.substring(0, 147) + '...' : jobData.description) : 
                 `Apply for the ${jobData.title} role at ${jobData.company_name} on Job Portal.`;

    const previousImages = (await parent).openGraph?.images || [];

    return {
      title: title,
      description: desc,
      openGraph: {
        title: title,
        description: desc,
        url: `https://jobportal.com/jobs/${id}`, 
        type: 'website',
        images: [...previousImages],
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: desc,
      }
    };
  } catch(error) {
     return { title: 'Job Details - Job Portal' };
  }
}

export default function JobDetailsPage() {
    return <JobDetailsClient />;
}
