import { NextResponse } from 'next/server';
import { getMessage } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const messageData = getMessage();
    return NextResponse.json(messageData);
  } catch (error) {
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
