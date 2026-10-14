import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { safeErrorResponse } from '@/lib/security';

/**
 * GET /api/screening-question-types
 * Returns all active screening question types registered in public.screening_question_types.
 */
export async function GET() {
  try {
    const { data: types, error } = await supabaseAdmin
      .from('screening_question_types')
      .select('code, label, accepts_options, answer_json_type, is_active')
      .eq('is_active', true)
      .order('code', { ascending: true });

    if (error) {
      console.warn('Failed to query screening_question_types from DB:', error.message);
      // Graceful fallback to default types
      return NextResponse.json(DEFAULT_TYPES, { status: 200 });
    }

    return NextResponse.json(types || DEFAULT_TYPES, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    return safeErrorResponse(err, 'Failed to fetch screening question types');
  }
}

const DEFAULT_TYPES = [
  { code: 'short_text', label: 'Short text', accepts_options: false, answer_json_type: 'string', is_active: true },
  { code: 'long_text', label: 'Long text', accepts_options: false, answer_json_type: 'string', is_active: true },
  { code: 'single_choice', label: 'Single choice', accepts_options: true, answer_json_type: 'string', is_active: true },
  { code: 'multiple_choice', label: 'Multiple choice', accepts_options: true, answer_json_type: 'array', is_active: true },
  { code: 'yes_no', label: 'Yes / No', accepts_options: false, answer_json_type: 'boolean', is_active: true },
  { code: 'numeric', label: 'Number', accepts_options: false, answer_json_type: 'number', is_active: true },
  { code: 'date', label: 'Date', accepts_options: false, answer_json_type: 'string', is_active: true },
  { code: 'dropdown', label: 'Dropdown', accepts_options: true, answer_json_type: 'string', is_active: true },
  { code: 'url', label: 'URL', accepts_options: false, answer_json_type: 'string', is_active: true },
];
