import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
  });
}