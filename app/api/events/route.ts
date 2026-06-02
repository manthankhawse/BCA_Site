import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { Event } from '@/models/Event';

export async function GET(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const filter: Record<string, unknown> = {};
    if (from || to) {
      filter.startDate = {};
      if (from) (filter.startDate as Record<string, unknown>).$gte = new Date(from);
      if (to) (filter.startDate as Record<string, unknown>).$lte = new Date(to);
    }

    const events = await Event.find(filter)
      .populate('batchId', 'name')
      .populate('courseId', 'title')
      .populate('tournamentId', 'name')
      .sort({ startDate: 1 });

    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'coach')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const data = await req.json();
    const event = await Event.create({ ...data, createdBy: payload.id });
    return NextResponse.json({ event }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'coach')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    await Event.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
