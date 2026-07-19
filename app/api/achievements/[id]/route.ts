import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Achiever } from '@/models/Achiever';
import { getSessionFromRequest } from '@/lib/auth';

// Admin PATCH — update an achiever
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const achiever = await Achiever.findByIdAndUpdate(id, body, { new: true });
    if (!achiever) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ achiever });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Admin DELETE — remove an achiever
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { id } = await params;
    await connectDB();
    await Achiever.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
