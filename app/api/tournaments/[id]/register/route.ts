import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { Tournament } from '@/models/Tournament';

// Register/deregister student from tournament
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const { action, rating } = await req.json(); // action: 'register' | 'withdraw'

    const tournament = await Tournament.findById(id);
    if (!tournament) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (tournament.status !== 'registration') {
      return NextResponse.json({ error: 'Registration is not open' }, { status: 400 });
    }

    if (action === 'register') {
      const alreadyIn = tournament.participants.some((p: any) => p.userId.toString() === payload.id);
      if (alreadyIn) return NextResponse.json({ error: 'Already registered' }, { status: 409 });
      if (tournament.maxParticipants && tournament.participants.length >= tournament.maxParticipants) {
        return NextResponse.json({ error: 'Tournament is full' }, { status: 400 });
      }
      tournament.participants.push({ userId: payload.id as unknown as import('mongoose').Types.ObjectId, rating: rating || 1000 });
    } else {
      tournament.participants = tournament.participants.filter((p: any) => p.userId.toString() !== payload.id);
    }

    await tournament.save();
    return NextResponse.json({ success: true, participantCount: tournament.participants.length });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
