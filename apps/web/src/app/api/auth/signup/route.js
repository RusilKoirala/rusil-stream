// Direct signup API (DEPRECATED - Use send-verification instead)
// This endpoint is kept for backward compatibility only
import { NextResponse } from 'next/server';

export async function POST(request) {
  return NextResponse.json(
    { error: 'Direct signup is disabled. Please use email verification.' },
    { status: 403 }
  );
}
