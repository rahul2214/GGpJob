"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var admin = __importStar(require("firebase-admin"));
var supabase_js_1 = require("@supabase/supabase-js");
var dotenv = __importStar(require("dotenv"));
var uuid_1 = require("uuid");
dotenv.config();
// Deterministic namespace for Firestore ID -> UUID conversion
var MIGRATION_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Standard DNS namespace
function toUUID(id) {
    if (!id || typeof id !== 'string')
        return null;
    // If it's already a UUID, return it
    var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id))
        return id;
    try {
        // Otherwise convert to deterministic UUID
        return (0, uuid_1.v5)(id, MIGRATION_NAMESPACE);
    }
    catch (e) {
        console.error("Failed to convert ID to UUID: ".concat(id));
        return null;
    }
}
// Initialize Firebase
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: (_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
        }),
    });
}
var db = admin.firestore();
// Initialize Supabase
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
var supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
function warmUp() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Warming up Supabase schema cache...");
                    // Force PostgREST to refresh its cache by performing simple queries
                    return [4 /*yield*/, Promise.all([
                            supabase.from('profiles').select('id').limit(1),
                            supabase.from('jobs').select('id').limit(1),
                            supabase.from('applications').select('id').limit(1)
                        ])];
                case 1:
                    // Force PostgREST to refresh its cache by performing simple queries
                    _a.sent();
                    console.log("Cache warmed up.");
                    return [2 /*return*/];
            }
        });
    });
}
function migrateCollection(collectionName, tableName, transformer) {
    return __awaiter(this, void 0, void 0, function () {
        var snapshot, batch, chunkSize, i, chunk, error, retry, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n--- Migrating ".concat(collectionName, " -> ").concat(tableName, " ---"));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 11, , 12]);
                    return [4 /*yield*/, db.collection(collectionName).get()];
                case 2:
                    snapshot = _a.sent();
                    console.log("Found ".concat(snapshot.size, " documents in ").concat(collectionName));
                    batch = snapshot.docs.map(function (doc) {
                        try {
                            return transformer(__assign({ id: doc.id }, doc.data()));
                        }
                        catch (e) {
                            console.error("Error transforming doc ".concat(doc.id, ":"), e);
                            return null;
                        }
                    }).filter(Boolean);
                    if (batch.length === 0)
                        return [2 /*return*/];
                    chunkSize = 100;
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < batch.length)) return [3 /*break*/, 10];
                    chunk = batch.slice(i, i + chunkSize);
                    return [4 /*yield*/, supabase.from(tableName).upsert(chunk)];
                case 4:
                    error = (_a.sent()).error;
                    if (!error) return [3 /*break*/, 8];
                    console.error("Error migrating chunk for ".concat(tableName, ":"), error.message);
                    if (!error.message.includes('schema cache')) return [3 /*break*/, 7];
                    console.log("Retrying chunk for ".concat(tableName, " after brief wait..."));
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 2000); })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, supabase.from(tableName).upsert(chunk)];
                case 6:
                    retry = _a.sent();
                    if (retry.error)
                        console.error("Retry failed:", retry.error.message);
                    _a.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    console.log("Successfully migrated ".concat(chunk.length, " rows to ").concat(tableName));
                    _a.label = 9;
                case 9:
                    i += chunkSize;
                    return [3 /*break*/, 3];
                case 10: return [3 /*break*/, 12];
                case 11:
                    e_1 = _a.sent();
                    console.error("Failed to migrate collection ".concat(collectionName, ":"), e_1.message);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
function runMigration() {
    return __awaiter(this, void 0, void 0, function () {
        var profileTransformer_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, warmUp()];
                case 1:
                    _a.sent();
                    console.log("Starting full data migration (Deterministic UUIDs)...");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 17, , 18]);
                    // 1. Reference Metadata
                    return [4 /*yield*/, migrateCollection('domains', 'domains', function (doc) {
                            var _a;
                            return ({
                                id: toUUID(doc.id),
                                name: doc.name,
                                created_at: ((_a = doc.createdAt) === null || _a === void 0 ? void 0 : _a._seconds) ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
                            });
                        })];
                case 3:
                    // 1. Reference Metadata
                    _a.sent();
                    return [4 /*yield*/, migrateCollection('locations', 'locations', function (doc) {
                            var _a;
                            return ({
                                id: toUUID(doc.id),
                                name: doc.name,
                                country: doc.country || 'India',
                                created_at: ((_a = doc.createdAt) === null || _a === void 0 ? void 0 : _a._seconds) ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
                            });
                        })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, migrateCollection('job_types', 'job_types', function (doc) {
                            var _a;
                            return ({
                                id: toUUID(doc.id),
                                name: doc.name,
                                created_at: ((_a = doc.createdAt) === null || _a === void 0 ? void 0 : _a._seconds) ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
                            });
                        })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, migrateCollection('workplace_types', 'workplace_types', function (doc) {
                            var _a;
                            return ({
                                id: toUUID(doc.id),
                                name: doc.name,
                                created_at: ((_a = doc.createdAt) === null || _a === void 0 ? void 0 : _a._seconds) ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
                            });
                        })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, migrateCollection('skills', 'skills', function (doc) {
                            var _a;
                            return ({
                                id: toUUID(doc.id),
                                name: doc.name,
                                created_at: ((_a = doc.createdAt) === null || _a === void 0 ? void 0 : _a._seconds) ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
                            });
                        })];
                case 7:
                    _a.sent();
                    profileTransformer_1 = function (doc, role) {
                        var _a;
                        return ({
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
                            created_at: ((_a = doc.createdAt) === null || _a === void 0 ? void 0 : _a._seconds) ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
                        });
                    };
                    return [4 /*yield*/, migrateCollection('users', 'profiles', function (doc) { return profileTransformer_1(doc, 'Job Seeker'); })];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, migrateCollection('recruiters', 'profiles', function (doc) { return profileTransformer_1(doc, 'Recruiter'); })];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, migrateCollection('admins', 'profiles', function (doc) { return profileTransformer_1(doc, 'Admin'); })];
                case 10:
                    _a.sent();
                    // 3. Jobs
                    return [4 /*yield*/, migrateCollection('jobs', 'jobs', function (doc) {
                            var _a;
                            return ({
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
                                created_at: doc.postedAt ? new Date(doc.postedAt).toISOString() : (((_a = doc.createdAt) === null || _a === void 0 ? void 0 : _a._seconds) ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString()),
                            });
                        })];
                case 11:
                    // 3. Jobs
                    _a.sent();
                    // 4. Applications
                    return [4 /*yield*/, migrateCollection('applications', 'applications', function (doc) {
                            var _a;
                            return ({
                                id: toUUID(doc.id),
                                job_id: doc.jobId ? toUUID(doc.jobId) : null,
                                user_id: doc.userId ? toUUID(doc.userId) : null,
                                status_id: doc.statusId || 1,
                                applied_at: ((_a = doc.appliedAt) === null || _a === void 0 ? void 0 : _a._seconds) ? new Date(doc.appliedAt._seconds * 1000).toISOString() : (doc.timestamp ? new Date(doc.timestamp).toISOString() : new Date().toISOString()),
                                rating: doc.rating || null,
                                feedback: doc.feedback || '',
                            });
                        })];
                case 12:
                    // 4. Applications
                    _a.sent();
                    // 5. Coupons, Payments, Notifications, Feedback
                    return [4 /*yield*/, migrateCollection('coupons', 'coupons', function (doc) {
                            var _a, _b;
                            return ({
                                id: toUUID(doc.id),
                                code: doc.code,
                                discount_percent: doc.discountPercent,
                                expires_at: ((_a = doc.expiresAt) === null || _a === void 0 ? void 0 : _a._seconds) ? new Date(doc.expiresAt._seconds * 1000).toISOString() : (doc.expiresAt ? new Date(doc.expiresAt).toISOString() : new Date().toISOString()),
                                max_uses: doc.maxUses || 100,
                                current_uses: doc.currentUses || 0,
                                applicable_plan: doc.applicablePlan || 'all',
                                is_active: doc.isActive !== false,
                                created_at: ((_b = doc.createdAt) === null || _b === void 0 ? void 0 : _b._seconds) ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
                            });
                        })];
                case 13:
                    // 5. Coupons, Payments, Notifications, Feedback
                    _a.sent();
                    return [4 /*yield*/, migrateCollection('payments', 'payments', function (doc) {
                            var _a;
                            return ({
                                id: toUUID(doc.id),
                                user_id: doc.userId ? toUUID(doc.userId) : null,
                                order_id: doc.orderId,
                                payment_id: doc.paymentId,
                                amount: doc.amount,
                                plan_id: doc.planId,
                                coupon_code: doc.couponCode || null,
                                timestamp: ((_a = doc.timestamp) === null || _a === void 0 ? void 0 : _a._seconds) ? new Date(doc.timestamp._seconds * 1000).toISOString() : new Date().toISOString(),
                            });
                        })];
                case 14:
                    _a.sent();
                    return [4 /*yield*/, migrateCollection('notifications', 'notifications', function (doc) {
                            var _a;
                            return ({
                                id: toUUID(doc.id),
                                user_id: doc.userId ? toUUID(doc.userId) : null,
                                message: doc.message,
                                type: doc.type || 'info',
                                job_id: doc.jobId ? toUUID(doc.jobId) : null,
                                is_read: doc.isRead || false,
                                created_at: ((_a = doc.createdAt) === null || _a === void 0 ? void 0 : _a._seconds) ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
                            });
                        })];
                case 15:
                    _a.sent();
                    return [4 /*yield*/, migrateCollection('portal_feedback', 'portal_feedback', function (doc) {
                            var _a;
                            return ({
                                id: toUUID(doc.id),
                                user_id: doc.userId ? toUUID(doc.userId) : null,
                                rating: doc.rating,
                                feedback: doc.feedback,
                                created_at: ((_a = doc.createdAt) === null || _a === void 0 ? void 0 : _a._seconds) ? new Date(doc.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
                            });
                        })];
                case 16:
                    _a.sent();
                    console.log("\nMigration completed successfully (Deterministic UUIDs)!");
                    return [3 /*break*/, 18];
                case 17:
                    error_1 = _a.sent();
                    console.error("Migration failed:", error_1);
                    return [3 /*break*/, 18];
                case 18: return [2 /*return*/];
            }
        });
    });
}
runMigration();
