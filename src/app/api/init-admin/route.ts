
import { NextResponse } from 'next/server';

/**
 * This route has been disabled as the initial admin setup is complete.
 */
export async function GET() {
  return new NextResponse(null, { status: 404 });
}
