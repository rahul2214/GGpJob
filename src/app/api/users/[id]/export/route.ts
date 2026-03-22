import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        // 1. Fetch User Data
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        const userData = userDoc.data() as any;

        // Fetch location and domain to resolve names if they are stored as IDs
        const domainDoc = userData.domainId ? await db.collection('domains').doc(userData.domainId).get() : null;
        let locationName = userData.location || '';
        
        if (userData.locationId) {
             const locSnap = await db.collection('locations').where('id', '==', parseInt(userData.locationId)).limit(1).get();
             if (!locSnap.empty) {
                 locationName = locSnap.docs[0].data().name;
             }
        }

        const preferredJobTitle = domainDoc?.exists ? domainDoc.data()?.name : 'Software Engineer';
        
        // 2. Format as AutoJobApply config.json structure
        const firstName = userData.name?.split(' ')[0] || '';
        const lastName = userData.name?.split(' ').slice(1).join(' ') || '';

        const exportData = {
            personal_info: {
                first_name: firstName,
                last_name: lastName,
                phone: userData.phone || "",
                city: locationName || "Remote",
                email: userData.email || ""
            },
            preferences: {
                resume_path: "resume.pdf",
                job_titles: [preferredJobTitle],
                locations: [locationName, "Remote"].filter(Boolean),
                workplace_type: "Remote"
            },
            qa: {
                years_of_experience: "2",
                sponsorship_required: "No",
                legally_authorized: "Yes",
                clearance: "No",
                degree: userData.educationLevel || "Bachelor's"
            },
            resume_url: userData.resumeUrl || null // Including resume URL to trigger download
        };

        return NextResponse.json(exportData);

    } catch (error: any) {
        console.error('Failed to export user profile:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
