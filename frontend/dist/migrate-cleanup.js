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
var MIGRATION_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
function toUUID(id) {
    if (!id || typeof id !== 'string')
        return null;
    var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id))
        return id;
    try {
        return (0, uuid_1.v5)(id, MIGRATION_NAMESPACE);
    }
    catch (e) {
        return null;
    }
}
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
var supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
function migrateCollection(collectionName, tableName, transformer) {
    return __awaiter(this, void 0, void 0, function () {
        var snapshot, batch, _i, batch_1, item, error, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n--- Cleaning Up ".concat(collectionName, " -> ").concat(tableName, " ---"));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, db.collection(collectionName).get()];
                case 2:
                    snapshot = _a.sent();
                    console.log("Found ".concat(snapshot.size, " documents in ").concat(collectionName));
                    batch = snapshot.docs.map(function (doc) {
                        try {
                            return transformer(__assign({ id: doc.id }, doc.data()));
                        }
                        catch (e) {
                            return null;
                        }
                    }).filter(Boolean);
                    if (batch.length === 0)
                        return [2 /*return*/];
                    _i = 0, batch_1 = batch;
                    _a.label = 3;
                case 3:
                    if (!(_i < batch_1.length)) return [3 /*break*/, 7];
                    item = batch_1[_i];
                    return [4 /*yield*/, supabase.from(tableName).upsert(item)];
                case 4:
                    error = (_a.sent()).error;
                    if (!error) return [3 /*break*/, 6];
                    console.error("Error migrating item ".concat(item.id, ":"), error.message);
                    if (!error.message.includes('schema cache')) return [3 /*break*/, 6];
                    console.log("Schema cache issue, waiting 5s...");
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 5000); })];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7:
                    console.log("Finished ".concat(tableName));
                    return [3 /*break*/, 9];
                case 8:
                    e_1 = _a.sent();
                    console.error("Failed ".concat(collectionName, ":"), e_1.message);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function runCleanup() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Starting cleanup migration for missed tables...");
                    // Explicitly select to force cache
                    return [4 /*yield*/, supabase.from('notifications').select('id').limit(1)];
                case 1:
                    // Explicitly select to force cache
                    _a.sent();
                    return [4 /*yield*/, supabase.from('portal_feedback').select('id').limit(1)];
                case 2:
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
                case 3:
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
                case 4:
                    _a.sent();
                    console.log("Cleanup finished.");
                    return [2 /*return*/];
            }
        });
    });
}
runCleanup();
