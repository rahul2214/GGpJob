import * as admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { v5 as uuidv5 } from 'uuid';

dotenv.config();

const MIGRATION_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

function toUUID(id: string | null | undefined): string | null {
    if (!id || typeof id !== 'string') return null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) return id;
    try {
        return uuidv5(id, MIGRATION_NAMESPACE);
    } catch (e) {
        return null;
    }
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function migrateCollection(collectionName: string, tableName: string, transformer: (doc: any) => any) {
    console.log(`\n--- Cleaning Up ${collectionName} -> ${tableName} ---`);
    try {
        const snapshot = await db.collection(collectionName).get();
        console.log(`Found ${snapshot.size} documents in ${collectionName}`);

        const batch = snapshot.docs.map(doc => {
            try {
                return transformer({ id: doc.id, ...doc.data() });
            } catch (e) {
                return null;
            }
        }).filter(Boolean);

        if (batch.length === 0) return;

        for (const item of batch) {
            const { error } = await supabase.from(tableName).upsert(item);
            if (error) {
                console.error(`Error migrating item ${item.id}:`, error.message);
                if (error.message.includes('schema cache')) {
                    console.log("Schema cache issue, waiting 5s...");
                    await new Promise(r => setTimeout(r, 5000));
                }
            }
        }
        console.log(`Finished ${tableName}`);
    } catch (e: any) {
        console.error(`Failed ${collectionName}:`, e.message);
    }
}

async function runCleanup() {
    console.log("Starting cleanup migration for missed tables...");
    
    // Explicitly select to force cache
    await supabase.from('notifications').select('id').limit(1);
    await supabase.from('portal_feedback').select('id').limit(1);

    await migrateCollection('notifications', 'notifications', (doc) => ({
        id: toUUID(doc.id),
        user_id: doc.userId ? toUUID(doc.userId) : null,
        message: doc.message,
        type: doc.type || 'info',
        job_id: doc.jobId ? toUUID(doc.jobId) : null,
        is_read: doc.isRead || false,
        created_at: doc.createdAt?._seconds ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
    }));

    await migrateCollection('portal_feedback', 'portal_feedback', (doc) => ({
        id: toUUID(doc.id),
        user_id: doc.userId ? toUUID(doc.userId) : null,
        rating: doc.rating,
        feedback: doc.feedback,
        created_at: doc.createdAt?._seconds ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
    }));

    console.log("Cleanup finished.");
}

runCleanup();
