import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Achiever } from '@/models/Achiever';
import { getSessionFromRequest } from '@/lib/auth';

// Public GET — all achievers sorted by order
export async function GET() {
  try {
    await connectDB();
    const achievers = await Achiever.find({}).sort({ order: 1, createdAt: 1 });
    return NextResponse.json({ achievers });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Admin POST — add an achiever
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const body = await req.json();
    const achiever = await Achiever.create(body);
    return NextResponse.json({ achiever }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
