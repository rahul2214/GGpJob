import sys; sys.path.insert(0, 'scratch/sec')
from patchlib import patch

patch('src/app/api/crm/config/route.ts', [
(
r"""import { supabaseAdmin } from '@/lib/supabase-admin';

import fs from 'fs';
import path from 'path';

function updateEnvFile(key: string, value: string) {
  try {""",
r"""import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth-server';

import fs from 'fs';
import path from 'path';

/**
 * Values written to .env must not be able to terminate their own `KEY=value`
 * line, otherwise a caller could append arbitrary environment variables.
 */
function isSafeEnvValue(value: string): boolean {
  return typeof value === 'string' && !/[\r\n\u0000]/.test(value);
}

function updateEnvFile(key: string, value: string) {
  if (!isSafeEnvValue(value)) {
    throw new Error('Refusing to persist a configuration value containing line breaks.');
  }
  try {"""
),
(
r"""export async function GET(request: NextRequest) {
  try {
    const apiKey = getBrevoApiKey();""",
r"""export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const apiKey = getBrevoApiKey();"""
),
(
r"""export async function POST(request: NextRequest) {
  try {
    const body = await request.json();""",
r"""export async function POST(request: NextRequest) {
  try {
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();"""
),
(
r"""    const cleanSenderName = senderName?.trim() || 'JobsDart Careers & AI';

    // Validate Key against Brevo REST API""",
r"""    const cleanSenderName = senderName?.trim() || 'JobsDart Careers & AI';

    // These values are persisted into .env, so reject anything that could break
    // out of its own line, and bound the free-text field.
    if (![cleanKey, cleanSenderEmail, cleanSenderName].every(isSafeEnvValue)) {
      return NextResponse.json({ error: 'Configuration values must not contain line breaks.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanSenderEmail)) {
      return NextResponse.json({ error: 'Sender email is not a valid address.' }, { status: 400 });
    }
    if (cleanSenderName.length > 100) {
      return NextResponse.json({ error: 'Sender name must be 100 characters or fewer.' }, { status: 400 });
    }

    // Validate Key against Brevo REST API"""
),
])
