
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import { User } from '@/lib/types';


async function getUserDocRef(id: string): Promise<FirebaseFirestore.DocumentReference | null> {
    const userDocRef = db.collection('users').doc(id);
    const userDoc = await userDocRef.get();
    if (userDoc.exists) return userDocRef;

    const recruiterDocRef = db.collection('recruiters').doc(id);
    const recruiterDoc = await recruiterDocRef.get();
    if (recruiterDoc.exists) return recruiterDocRef;
    
    return null;
}

async function getUserStats(id: string) {
    const [eduSnap, empSnap, skillSnap, projSnap, langSnap] = await Promise.all([
        db.collection('users').doc(id).collection('education').limit(1).get(),
        db.collection('users').doc(id).collection('employment').limit(1).get(),
        db.collection('users').doc(id).collection('skills').limit(1).get(),
        db.collection('users').doc(id).collection('projects').limit(1).get(),
        db.collection('users').doc(id).collection('languages').limit(1).get(),
    ]);
    
    return {
        hasEducation: !eduSnap.empty,
        hasEmployment: !empSnap.empty,
        hasSkills: !skillSnap.empty,
        hasProjects: !projSnap.empty,
        hasLanguages: !langSnap.empty
    };
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const userDocRef = await getUserDocRef(id);

        if (!userDocRef) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        const userDoc = await userDocRef.get();
        const user = { id: userDoc.id, ...userDoc.data() } as User;

        // Fetch location if locationId exists
        if (user.locationId) {
            try {
                const locationsSnap = await db.collection('locations').where('id', '==', parseInt(user.locationId)).limit(1).get();
                if (!locationsSnap.empty) {
                    const locationDoc = locationsSnap.docs[0].data();
                    user.location = locationDoc.name;
                }
            } catch(e) {
                console.error("Could not fetch location for user", e);
            }
        }

        if (user.role === 'Job Seeker') {
            user.profileStats = await getUserStats(id);
        }
        
        return NextResponse.json(user);

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}


export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { name, email, phone, headline, locationId, domainId, linkedinUrl, notificationLastViewedAt } = body;
        
        if (!name || !email || !phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        const userDocRef = await getUserDocRef(id);

        if (!userDocRef) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        const dataToUpdate: Partial<User> = {
            name,
            email,
            phone,
            headline: headline || '',
            locationId: locationId || null,
            domainId: domainId || null,
            linkedinUrl: linkedinUrl || '',
            notificationLastViewedAt: notificationLastViewedAt || null,
        };

        await userDocRef.update(dataToUpdate);

        const updatedUserDoc = await userDocRef.get();
        const updatedUser = { id: updatedUserDoc.id, ...updatedUserDoc.data() } as User;

        if (updatedUser.role === 'Job Seeker') {
            updatedUser.profileStats = await getUserStats(id);
        }

        return NextResponse.json(updatedUser, { status: 200 });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const userDocRef = await getUserDocRef(id);

        if (!userDocRef) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await userDocRef.delete();
        // Note: This does NOT delete the Firebase Auth user. That requires the Admin SDK.
        return NextResponse.json({ message: 'User profile deleted successfully' }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
