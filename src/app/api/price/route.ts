import { NextResponse } from 'next/server';
import { getGoldPrice } from '@/lib/data';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const headersList = headers();
  const authHeader = headersList.get('Authorization');
  const apiKey = process.env.GOLD_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ message: 'API key is not configured on the server.' }, { status: 500 });
  }

  const expectedAuthHeader = `Bearer ${apiKey}`;

  if (!authHeader || authHeader !== expectedAuthHeader) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const goldPriceData = getGoldPrice();
    return NextResponse.json(goldPriceData);
  } catch (error) {
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
