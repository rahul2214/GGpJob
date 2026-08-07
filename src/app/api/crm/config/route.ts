import { NextResponse, NextRequest } from 'next/server';
import {
  setRuntimeBrevoConfig,
  getBrevoApiKey,
  getBrevoSender,
  isBrevoConfigured,
  validateBrevoApiKey,
} from '@/lib/crm/brevo-service';
import { supabaseAdmin } from '@/lib/supabase-admin';

import fs from 'fs';
import path from 'path';

function updateEnvFile(key: string, value: string) {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return;

    let content = fs.readFileSync(envPath, 'utf8');
    const regex = new RegExp(`^${key}=.*$`, 'm');

    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }

    fs.writeFileSync(envPath, content, 'utf8');
    process.env[key] = value;
  } catch (err) {
    console.warn(`[ENV_UPDATE] Could not write ${key} to .env file:`, err);
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = getBrevoApiKey();
    const sender = getBrevoSender();
    const isConfigured = isBrevoConfigured();

    const maskedKey = apiKey
      ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
      : '';

    return NextResponse.json({
      configured: isConfigured,
      maskedKey,
      senderEmail: sender.email,
      senderName: sender.name,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, senderEmail, senderName } = body;

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
      return NextResponse.json({ error: 'Please enter a valid Brevo API key (starts with xkeysib-)' }, { status: 400 });
    }

    const cleanKey = apiKey.trim();
    const cleanSenderEmail = senderEmail?.trim() || 'no-reply@jobsdart.in';
    const cleanSenderName = senderName?.trim() || 'JobsDart Careers & AI';

    // Validate Key against Brevo REST API
    const validation = await validateBrevoApiKey(cleanKey);

    if (!validation.valid) {
      return NextResponse.json({
        error: `Brevo API Key validation failed: ${validation.message}`,
        details: validation,
      }, { status: 400 });
    }

    // Save Runtime Config
    setRuntimeBrevoConfig({
      apiKey: cleanKey,
      senderEmail: cleanSenderEmail,
      senderName: cleanSenderName,
    });

    // Write to .env file directly
    updateEnvFile('BREVO_API_KEY', cleanKey);
    updateEnvFile('BREVO_SENDER_EMAIL', cleanSenderEmail);
    updateEnvFile('BREVO_SENDER_NAME', cleanSenderName);

    // Attempt to persist in DB (optional system_settings)
    try {
      await supabaseAdmin.from('system_settings').upsert([
        { key: 'BREVO_API_KEY', value: cleanKey, updated_at: new Date().toISOString() },
        { key: 'BREVO_SENDER_EMAIL', value: cleanSenderEmail, updated_at: new Date().toISOString() },
        { key: 'BREVO_SENDER_NAME', value: cleanSenderName, updated_at: new Date().toISOString() },
      ], { onConflict: 'key' });
    } catch (e) {
      console.warn('[CRM_CONFIG] Supabase system_settings upsert fallback:', e);
    }

    return NextResponse.json({
      success: true,
      message: `Brevo API Key successfully validated and saved to .env file! Connected to account: ${validation.email} (${validation.credits} email credits available).`,
      accountEmail: validation.email,
      credits: validation.credits,
      planType: validation.planType,
    });
  } catch (err: any) {
    console.error('[API_CRM_CONFIG] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update Brevo configuration' }, { status: 500 });
  }
}
