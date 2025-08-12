import { NextResponse } from 'next/server';
import { getGoldPrice } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const goldPriceData = getGoldPrice();
    return NextResponse.json(goldPriceData);
  } catch (error) {
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
