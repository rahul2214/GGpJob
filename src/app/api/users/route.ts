
import { NextResponse } from 'next/server';
import { db, auth } from '@/firebase/admin-config';
import type { User } from '@/lib/types';

// GET all users OR a specific user by UID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (uid) {
        let userDoc: any = null;
        let userData: any = null;

        try {
            const userRecord = await auth.getUser(uid);
            const role = userRecord.customClaims?.role;
            
            if (role) {
                let collectionName = 'users';
                if (role === 'Admin' || role === 'Super Admin') collectionName = 'admins';
                else if (role === 'Recruiter') collectionName = 'recruiters';
                else if (role === 'Employee') collectionName = 'employees';
                
                userDoc = await db.collection(collectionName).doc(uid).get();
                if (userDoc.exists) userData = userDoc.data();
            }
        } catch (authErr) {
            console.error('[API_USERS_GET] Failed to fetch custom claims:', authErr);
        }

        // Fallback for legacy users without custom claims
        if (!userData) {
            userDoc = await db.collection('admins').doc(uid).get();
            if (userDoc.exists) userData = userDoc.data();
            else {
                userDoc = await db.collection('recruiters').doc(uid).get();
                if (userDoc.exists) userData = userDoc.data();
                else {
                    userDoc = await db.collection('employees').doc(uid).get();
                    if (userDoc.exists) userData = userDoc.data();
                    else {
                        userDoc = await db.collection('users').doc(uid).get();
                        if (userDoc.exists) userData = userDoc.data();
                    }
                }
            }
        }

        if (userData) {
            const user = { id: userDoc.id, ...userData } as User;
            
            if (user.role === 'Job Seeker') {
                const [eduSnap, empSnap, skillSnap, projSnap, langSnap] = await Promise.all([
                    db.collection('users').doc(uid).collection('education').limit(1).get(),
                    db.collection('users').doc(uid).collection('employment').limit(1).get(),
                    db.collection('users').doc(uid).collection('skills').limit(1).get(),
                    db.collection('users').doc(uid).collection('projects').limit(1).get(),
                    db.collection('users').doc(uid).collection('languages').limit(1).get(),
                ]);

                user.profileStats = {
                    hasEducation: !eduSnap.empty,
                    hasEmployment: !empSnap.empty,
                    hasSkills: !skillSnap.empty,
                    hasProjects: !projSnap.empty,
                    hasLanguages: !langSnap.empty,
                    hasSummary: !!userData.summary
                };
            }

            return NextResponse.json(user);
        } 
        
        return NextResponse.json({ error: 'User profile not found in database.' }, { status: 404 });
    }

    // Admin view: get all users across all collections
    const [usersSnap, recruitersSnap, employeesSnap, adminsSnap] = await Promise.all([
        db.collection('users').get(),
        db.collection('recruiters').get(),
        db.collection('employees').get(),
        db.collection('admins').get()
    ]);
    
    const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const recruiters = recruitersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const employees = employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const admins = adminsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json([...users, ...recruiters, ...employees, ...admins]);
  } catch (e: any) {
    console.error("[API_USERS_GET] Error:", e.message);
    return NextResponse.json({ error: 'Failed to fetch users', details: e.message }, { status: 500 });
  }
}

// POST a new user (create profile after signup)
export async function POST(request: Request) {
  try {
    const { id, name, email, role, phone, domainId } = await request.json();

    if (!id || !name || !email || !role) {
        return NextResponse.json({ error: 'Missing required fields for profile creation' }, { status: 400 });
    }
    
    const dataToSave: Omit<User, 'id'> = {
        name,
        email,
        role,
        phone: phone || '',
        headline: '',
        summary: '',
        resumeUrl: '',
    };
    
    if (domainId) {
        dataToSave.domainId = domainId;
    }
    
    let collectionName = 'users';
    if (role === 'Admin' || role === 'Super Admin') {
        collectionName = 'admins';
    } else if (role === 'Recruiter') {
        collectionName = 'recruiters';
    } else if (role === 'Employee') {
        collectionName = 'employees';
    }

    await db.collection(collectionName).doc(id).set(dataToSave);
    
    // Set custom user claim for O(1) reads later
    // Wrapped in its own try-catch so a claim failure never blocks profile creation
    try {
        await auth.setCustomUserClaims(id, { role });
    } catch (claimsErr: any) {
        console.error('[API_USERS_POST] Failed to set custom claims (non-fatal):', claimsErr.message);
    }
    
    return NextResponse.json({ id, ...dataToSave }, { status: 201 });
  } catch (e: any) {
    console.error("[API_USERS_POST] Error:", e);
    return NextResponse.json({ error: 'Failed to create user profile in Firestore', details: e.message }, { status: 500 });
  }
}
