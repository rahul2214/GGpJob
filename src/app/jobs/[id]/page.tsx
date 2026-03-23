import { Metadata, ResolvingMetadata } from 'next';
import { db } from '@/firebase/admin-config';
import type { Job } from '@/lib/types';
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
    const jobDoc = await db.collection('jobs').doc(id).get();
    
    if (!jobDoc.exists) {
        return {
           title: 'Job Not Found - Job Portal',
           description: 'The job you are looking for does not exist or has been removed.',
        };
    }
    
    const jobData = jobDoc.data() as Job;
    const title = `${jobData.title} at ${jobData.companyName}`;
    const desc = jobData.description ? 
                 (jobData.description.length > 150 ? jobData.description.substring(0, 147) + '...' : jobData.description) : 
                 `Apply for the ${jobData.title} role at ${jobData.companyName} on Job Portal.`;

    const previousImages = (await parent).openGraph?.images || [];

    return {
      title: title,
      description: desc,
      openGraph: {
        title: title,
        description: desc,
        url: `https://jobportal.com/jobs/${id}`, // Change domain on production
        type: 'website',
        images: [...previousImages], // You could dynamically generate an OG image here
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
