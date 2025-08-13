import { NextResponse } from 'next/server';
import { getGoldPriceHistory } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const goldPriceHistory = getGoldPriceHistory();
    return NextResponse.json(goldPriceHistory);
  } catch (error) {
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
