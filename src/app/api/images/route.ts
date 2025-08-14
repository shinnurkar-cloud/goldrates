import { NextResponse } from 'next/server';
import { getCarouselImages } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const images = getCarouselImages();
    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}