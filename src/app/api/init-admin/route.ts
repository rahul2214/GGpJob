
import { NextResponse } from 'next/server';
import { db, auth } from '@/firebase/admin-config';

/**
 * One-time setup route to initialize the default admin user.
 * After deployment, visit /api/init-admin in your browser to create the account.
 * 
 * IMPORTANT: This route should be removed or secured after the initial setup
 * to prevent unauthorized account creation.
 */
export async function GET() {
  const email = 'veltria.in@gmail.com';
  const password = '12345678';
  const name = 'Veltria Admin';

  try {
    // 1. Check if user already exists in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        // Create the user in Firebase Auth
        userRecord = await auth.createUser({
          email,
          password,
          displayName: name,
          emailVerified: true,
        });
      } else {
        throw e;
      }
    }

    // 2. Assign custom claims for the 'Admin' role
    await auth.setCustomUserClaims(userRecord.uid, { role: 'Admin' });

    // 3. Create or update the profile in the dedicated 'admins' Firestore collection
    const adminProfile = {
      name,
      email,
      phone: '1234567890',
      role: 'Admin',
      headline: 'Platform Administrator',
    };

    await db.collection('admins').doc(userRecord.uid).set(adminProfile, { merge: true });

    return NextResponse.json({
      success: true,
      message: `Admin user "${email}" has been initialized. You can now log in at /admin/login`,
      uid: userRecord.uid,
    });
  } catch (error: any) {
    console.error('Initialization Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
