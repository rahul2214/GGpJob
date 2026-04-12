import * as admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { v5 as uuidv5 } from 'uuid';

dotenv.config();

// Deterministic namespace for Firestore ID -> UUID conversion
const MIGRATION_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Standard DNS namespace

function toUUID(id: string | null | undefined): string | null {
    if (!id || typeof id !== 'string') return null;
    // If it's already a UUID, return it
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) return id;
    try {
        // Otherwise convert to deterministic UUID
        return uuidv5(id, MIGRATION_NAMESPACE);
    } catch (e) {
        console.error(`Failed to convert ID to UUID: ${id}`);
        return null;
    }
}

// Initialize Firebase
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

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function warmUp() {
    console.log("Warming up Supabase schema cache...");
    // Force PostgREST to refresh its cache by performing simple queries
    await Promise.all([
        supabase.from('profiles').select('id').limit(1),
        supabase.from('jobs').select('id').limit(1),
        supabase.from('applications').select('id').limit(1)
    ]);
    console.log("Cache warmed up.");
}

async function migrateCollection(collectionName: string, tableName: string, transformer: (doc: any) => any) {
    console.log(`\n--- Migrating ${collectionName} -> ${tableName} ---`);
    try {
        const snapshot = await db.collection(collectionName).get();
        console.log(`Found ${snapshot.size} documents in ${collectionName}`);

        const batch = snapshot.docs.map(doc => {
            try {
                return transformer({ id: doc.id, ...doc.data() });
            } catch (e) {
                console.error(`Error transforming doc ${doc.id}:`, e);
                return null;
            }
        }).filter(Boolean);

        if (batch.length === 0) return;

        const chunkSize = 100;
        for (let i = 0; i < batch.length; i += chunkSize) {
            const chunk = batch.slice(i, i + chunkSize);
            const { error } = await supabase.from(tableName).upsert(chunk);
            if (error) {
                console.error(`Error migrating chunk for ${tableName}:`, error.message);
                // On error, let's try one more time for this chunk as it might still be a cache issue
                if (error.message.includes('schema cache')) {
                   console.log(`Retrying chunk for ${tableName} after brief wait...`);
                   await new Promise(r => setTimeout(r, 2000));
                   const retry = await supabase.from(tableName).upsert(chunk);
                   if (retry.error) console.error(`Retry failed:`, retry.error.message);
                }
            } else {
                console.log(`Successfully migrated ${chunk.length} rows to ${tableName}`);
            }
        }
    } catch (e: any) {
        console.error(`Failed to migrate collection ${collectionName}:`, e.message);
    }
}

async function runMigration() {
    await warmUp();
    console.log("Starting full data migration (Deterministic UUIDs)...");

    try {
        // 1. Reference Metadata
        await migrateCollection('domains', 'domains', (doc) => ({
            id: toUUID(doc.id),
            name: doc.name,
            created_at: doc.createdAt?._seconds ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
        }));

        await migrateCollection('locations', 'locations', (doc) => ({
            id: toUUID(doc.id),
            name: doc.name,
            country: doc.country || 'India',
            created_at: doc.createdAt?._seconds ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
        }));

        await migrateCollection('job_types', 'job_types', (doc) => ({
            id: toUUID(doc.id),
            name: doc.name,
            created_at: doc.createdAt?._seconds ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
        }));

        await migrateCollection('workplace_types', 'workplace_types', (doc) => ({
            id: toUUID(doc.id),
            name: doc.name,
            created_at: doc.createdAt?._seconds ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
        }));

        await migrateCollection('skills', 'skills', (doc) => ({
            id: toUUID(doc.id),
            name: doc.name,
            created_at: doc.createdAt?._seconds ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
        }));

        // 2. Profiles (Uified from users, recruiters, admins)
        const profileTransformer = (doc: any, role: string) => ({
            id: toUUID(doc.id),
            name: doc.name || doc.fullName || '',
            email: doc.email,
            phone: doc.phone || '',
            role: role,
            headline: doc.headline || '',
            summary: doc.summary || doc.bio || '',
            location_id: doc.locationId ? toUUID(doc.locationId) : null,
            domain_id: doc.domainId ? toUUID(doc.domainId) : null,
            work_status: doc.workStatus || 'Experienced',
            experience_years: doc.experienceYears || 0,
            experience_months: doc.experienceMonths || 0,
            current_city: doc.currentCity || '',
            resume_url: doc.resumeUrl || '',
            is_paid: doc.isPaid || false,
            plan_type: doc.planType || 'none',
            metadata: doc.metadata || {},
            created_at: doc.createdAt?._seconds ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
        });

        await migrateCollection('users', 'profiles', (doc) => profileTransformer(doc, 'Job Seeker'));
        await migrateCollection('recruiters', 'profiles', (doc) => profileTransformer(doc, 'Recruiter'));
        await migrateCollection('admins', 'profiles', (doc) => profileTransformer(doc, 'Admin'));

        // 3. Jobs
        await migrateCollection('jobs', 'jobs', (doc) => ({
            id: toUUID(doc.id),
            title: doc.jobTitle || doc.title,
            description: doc.jobDescription || doc.description,
            company_name: doc.companyName,
            company_logo: doc.companyLogo,
            domain_id: doc.domainId ? toUUID(doc.domainId) : null,
            job_type_id: doc.jobTypeId ? toUUID(doc.jobTypeId) : null,
            workplace_type_id: doc.workplaceTypeId ? toUUID(doc.workplaceTypeId) : null,
            location_ids: Array.isArray(doc.locationIds) ? doc.locationIds.map(toUUID) : (doc.locationId ? [toUUID(doc.locationId)] : []),
            job_link: doc.jobLink,
            address: doc.address || '',
            is_referral: doc.isReferral || false,
            skill_ids: Array.isArray(doc.skillIds) ? doc.skillIds.map(toUUID) : [],
            created_at: doc.postedAt ? new Date(doc.postedAt).toISOString() : (doc.createdAt?._seconds ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString()),
        }));

        // 4. Applications
        await migrateCollection('applications', 'applications', (doc) => ({
            id: toUUID(doc.id),
            job_id: doc.jobId ? toUUID(doc.jobId) : null,
            user_id: doc.userId ? toUUID(doc.userId) : null,
            status_id: doc.statusId || 1,
            applied_at: doc.appliedAt?._seconds ? new Date(doc.appliedAt._seconds * 1000).toISOString() : (doc.timestamp ? new Date(doc.timestamp).toISOString() : new Date().toISOString()),
            rating: doc.rating || null,
            feedback: doc.feedback || '',
        }));

        // 5. Coupons, Payments, Notifications, Feedback
        await migrateCollection('coupons', 'coupons', (doc) => ({
            id: toUUID(doc.id),
            code: doc.code,
            discount_percent: doc.discountPercent,
            expires_at: doc.expiresAt?._seconds ? new Date(doc.expiresAt._seconds * 1000).toISOString() : (doc.expiresAt ? new Date(doc.expiresAt).toISOString() : new Date().toISOString()),
            max_uses: doc.maxUses || 100,
            current_uses: doc.currentUses || 0,
            applicable_plan: doc.applicablePlan || 'all',
            is_active: doc.isActive !== false,
            created_at: doc.createdAt?._seconds ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
        }));

        await migrateCollection('payments', 'payments', (doc) => ({
            id: toUUID(doc.id),
            user_id: doc.userId ? toUUID(doc.userId) : null,
            order_id: doc.orderId,
            payment_id: doc.paymentId,
            amount: doc.amount,
            plan_id: doc.planId,
            coupon_code: doc.couponCode || null,
            timestamp: doc.timestamp?._seconds ? new Date(doc.timestamp._seconds * 1000).toISOString() : new Date().toISOString(),
        }));

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

        console.log("\nMigration completed successfully (Deterministic UUIDs)!");
    } catch (error) {
        console.error("Migration failed:", error);
    }
}

runMigration();
