import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { Attendance } from '@/models/Attendance';
import { Batch } from '@/models/Batch';

export async function GET(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'coach')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batchId');
    const date = searchParams.get('date');

    const filter: Record<string, unknown> = {};
    if (batchId) filter.batchId = batchId;
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      filter.date = { $gte: d, $lt: next };
    }

    const attendance = await Attendance.find(filter)
      .populate('records.studentId', 'name avatar')
      .populate('batchId', 'name')
      .sort({ date: -1 });

    return NextResponse.json({ attendance });
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
    const { batchId, date, records } = await req.json();
    if (!batchId || !date || !records) {
      return NextResponse.json({ error: 'batchId, date, and records required' }, { status: 400 });
    }

    // Upsert attendance for this batch+date
    const attendance = await Attendance.findOneAndUpdate(
      { batchId, date: new Date(date) },
      { batchId, date: new Date(date), records, markedBy: payload.id },
      { upsert: true, new: true }
    ).populate('records.studentId', 'name avatar');

    return NextResponse.json({ attendance });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
