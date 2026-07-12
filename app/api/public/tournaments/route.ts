import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Tournament } from '@/models/Tournament';

// Public endpoint — returns upcoming tournaments for the landing page (no auth required)
export async function GET() {
  try {
    await connectDB();
    const tournaments = await Tournament.find({ status: 'upcoming' })
      .select('name description startDate endDate venue locationType entryFee format type maxParticipants thumbnail')
      .sort({ startDate: 1 });
    return NextResponse.json({ tournaments });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
