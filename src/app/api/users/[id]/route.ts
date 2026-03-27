import { NextResponse } from 'next/server';
import { db, auth } from '@/firebase/admin-config';
import { User } from '@/lib/types';


async function getUserDocRef(id: string): Promise<FirebaseFirestore.DocumentReference | null> {
    try {
        const userRecord = await auth.getUser(id);
        const role = userRecord.customClaims?.role;
        
        if (role) {
            let collectionName = 'users';
            if (role === 'Admin' || role === 'Super Admin') collectionName = 'admins';
            else if (role === 'Recruiter') collectionName = 'recruiters';
            else if (role === 'Employee') collectionName = 'employees';
            
            const docRef = db.collection(collectionName).doc(id);
            const doc = await docRef.get();
            if (doc.exists) return docRef;
        }
    } catch (authErr) {
        console.error('[API_USERS_ID] Failed to fetch auth claims:', authErr);
    }

    // Fallback for older accounts without custom claims
    // 1. Prioritize Admins
    const adminDocRef = db.collection('admins').doc(id);
    const adminDoc = await adminDocRef.get();
    if (adminDoc.exists) return adminDocRef;

    // 2. Prioritize recruiters
    const recruiterDocRef = db.collection('recruiters').doc(id);
    const recruiterDoc = await recruiterDocRef.get();
    if (recruiterDoc.exists) return recruiterDocRef;
    
    // 3. Check employees
    const employeeDocRef = db.collection('employees').doc(id);
    const employeeDoc = await employeeDocRef.get();
    if (employeeDoc.exists) return employeeDocRef;

    // 4. Look in users for Job Seekers
    const userDocRef = db.collection('users').doc(id);
    const userDoc = await userDocRef.get();
    if (userDoc.exists) return userDocRef;
    
    return null;
}

async function getUserStats(id: string, userData: any) {
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
        hasLanguages: !langSnap.empty,
        hasSummary: !!userData.summary
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
        const userData = userDoc.data();
        const user = { id: userDoc.id, ...userData } as User;

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
            user.profileStats = await getUserStats(id, userData);
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
        const { 
            name, 
            email, 
            phone, 
            headline, 
            summary, 
            locationId, 
            domainId, 
            linkedinUrl, 
            notificationLastViewedAt,
            gender,
            maritalStatus,
            dateOfBirth,
            category,
            disabilityStatus,
            militaryExperience,
            careerBreak,
            workStatus,
            experienceYears,
            experienceMonths,
            currentCity,
            currentArea,
            annualSalary,
            salaryBreakdown,
            noticePeriod
        } = body;
        
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
            summary: summary || '',
            locationId: locationId || null,
            domainId: domainId || null,
            linkedinUrl: linkedinUrl || '',
            notificationLastViewedAt: notificationLastViewedAt || null,
            gender: gender || null,
            maritalStatus: maritalStatus || null,
            dateOfBirth: dateOfBirth || null,
            category: category || null,
            disabilityStatus: disabilityStatus || null,
            militaryExperience: militaryExperience || null,
            careerBreak: careerBreak || null,
            workStatus: workStatus || null,
            experienceYears: experienceYears || null,
            experienceMonths: experienceMonths || null,
            currentCity: currentCity || null,
            currentArea: currentArea || null,
            annualSalary: annualSalary || null,
            salaryBreakdown: salaryBreakdown || null,
            noticePeriod: noticePeriod || null,
        };

        await userDocRef.update(dataToUpdate);

        const updatedUserDoc = await userDocRef.get();
        const updatedUserData = updatedUserDoc.data();
        const updatedUser = { id: updatedUserDoc.id, ...updatedUserData } as User;

        if (updatedUser.role === 'Job Seeker') {
            updatedUser.profileStats = await getUserStats(id, updatedUserData);
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
