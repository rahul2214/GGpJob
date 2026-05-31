import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendFirebaseVerificationEmail } from '@/lib/auth-utils';

const DISALLOWED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
  'icloud.com', 'mail.com', 'aol.com', 'zoho.com', 'yandex.com',
  'protonmail.com', 'gmx.com', 'lycos.com',
];

export async function POST(request: Request) {
  try {
    const { name, email, password, role, phone, companyName, companyWebsite, designation, department } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if ((role === 'Recruiter' || role === 'Employee') && (!companyName || !designation)) {
      return NextResponse.json({ error: 'Missing required company details.' }, { status: 400 });
    }

    // Validate corporate email for Recruiters
    if (role === 'Recruiter') {
      const domain = email.split('@')[1]?.toLowerCase();
      if (DISALLOWED_DOMAINS.includes(domain)) {
        return NextResponse.json({
          error: 'Recruiters must use a corporate email address (Gmail/Yahoo etc. are not allowed).',
        }, { status: 400 });
      }
    }

    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      phone: phone ? `+91${phone}` : undefined,
      email_confirm: false, // Do not auto-confirm; Firebase will send the verification
      phone_confirm: false, // Do not auto-confirm phone; stored for record only
      user_metadata: {
        name,
        role,
        phone: phone ? `+91${phone}` : undefined,
        companyName: companyName || undefined,
        companyWebsite: companyWebsite || undefined,
        designation: designation || undefined,
        department: department || undefined,
      },
    });

    if (createError) {
      const errMsg = createError.message?.toLowerCase() || '';
      if (errMsg.includes('phone')) {
        return NextResponse.json({ error: 'An account with this phone number already exists.' }, { status: 409 });
      }
      if (errMsg.includes('already registered') || errMsg.includes('already exists')) {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
      }
      throw createError;
    }

    // ✅ AUTOMATED PROFILE CREATION
    // Determine the correct table and role_id
    let table = 'jobseekers';
    let roleId = 1; 
    
    if (role === 'Recruiter') {
        table = 'recruiters';
        roleId = 2;
    } else if (role === 'Employee') {
        table = 'employees';
        roleId = 3;
    } else if (role === 'Admin') {
        table = 'admins';
        roleId = 4;
    }

    let formattedWebsite = companyWebsite || '';
    if (formattedWebsite && !/^https?:\/\//i.test(formattedWebsite)) {
        formattedWebsite = `https://${formattedWebsite}`;
    }

    const profileInsertData: any = {
        uuid: authData.user.id,
        name,
        email,
        phone: phone ? `+91${phone}` : '',
        role_id: roleId,
        ...(table === 'jobseekers' ? { 
            plan_type: 'free', 
            is_paid: false,
            subscription_credits: 2,
            subscription_allowance: 2
        } : {}),
        ...(table === 'admins' ? { is_super_admin: false } : {}),
        ...(role === 'Recruiter' ? {
            company_name: companyName,
            company_website: formattedWebsite,
            designation: designation,
            company_logo: companyWebsite ? `https://logo.clearbit.com/${companyWebsite.replace(/^(https?:\/\/)?(www\.)?/, '')}` : null,
            is_paid: false,
            plan_type: 'none',
            job_post_limit: 1,
        } : {}),
        ...(role === 'Employee' ? {
            company_name: companyName,
            company_website: formattedWebsite,
            designation: designation,
            department: department,
            company_logo: companyWebsite ? `https://logo.clearbit.com/${companyWebsite.replace(/^(https?:\/\/)?(www\.)?/, '')}` : null,
            is_paid: false,
            plan_type: 'none',
            job_post_limit: 5,
            trust_score: 100,
            xp: 0,
            level: 1
        } : {})
    };

    const { error: profileError } = await supabaseAdmin
        .from(table)
        .insert(profileInsertData);

    if (profileError) {
        console.error(`[signup] Failed to create ${table} profile:`, profileError);
        // We don't throw here to avoid failing the whole signup if just the profile row fails,
        // but we log it so it can be fixed. The Self-Healing GET will handle it later.
    }

    // Trigger Firebase email verification
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9002';
      const redirectUrl = role === 'Job Seeker'
        ? `${process.env.NEXT_PUBLIC_APP_URL || baseUrl}/login`
        : `${process.env.NEXT_PUBLIC_APP_URL || baseUrl}/company/login`;

      await sendFirebaseVerificationEmail(email, name, redirectUrl);
    } catch (emailErr) {
      console.error('[signup] Firebase verification email failed (non-fatal):', emailErr);
    }

    return NextResponse.json(
      { success: true, message: 'Account created. Verification email sent via Firebase.' },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('[API_SIGNUP] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create account.' }, { status: 500 });
  }
}
