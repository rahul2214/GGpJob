import { firebaseAdminAuth } from './firebase-admin';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

/**
 * Sends a Firebase verification email to the specified user.
 * Finds the user in Firebase Auth or creates a stub entry if they don't exist.
 */
export async function sendFirebaseVerificationEmail(
  email: string,
  name?: string,
  redirectUrl?: string
) {
  if (!email) throw new Error('Email is required for verification.');

  // 1. Find or create the Firebase Auth user
  let firebaseUid: string;
  try {
    const existingUser = await firebaseAdminAuth.getUserByEmail(email);
    firebaseUid = existingUser.uid;
  } catch {
    // User doesn't exist in Firebase — create a stub entry so we can send the verification
    const newUser = await firebaseAdminAuth.createUser({
      email,
      displayName: name || undefined,
      emailVerified: false,
    });
    firebaseUid = newUser.uid;
  }

  // 2. Create a custom token and exchange for an ID token via Firebase REST API
  const customToken = await firebaseAdminAuth.createCustomToken(firebaseUid);

  const signInRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );

  if (!signInRes.ok) {
    const err = await signInRes.json();
    console.error('[auth-utils] signInWithCustomToken failed:', err);
    throw new Error(`Failed to authenticate with Firebase: ${JSON.stringify(err)}`);
  }

  const { idToken } = await signInRes.json();

  // 3. Ask Firebase to send the verification email natively via REST API
  const sendRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestType: 'VERIFY_EMAIL',
        idToken,
        // continueUrl is where the user goes AFTER the Firebase verification page finishes
        continueUrl: redirectUrl || undefined 
      }),
    }
  );

  if (!sendRes.ok) {
    const err = await sendRes.json();
    console.error('[auth-utils] sendOobCode failed:', err);
    throw new Error(`Firebase failed to send verification email: ${JSON.stringify(err)}`);
  }

  const result = await sendRes.json();
  console.log(`[auth-utils] Firebase sent verification email to ${result.email}`);
  
  return result;
}
