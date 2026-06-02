import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await connectDB();
    const { id } = await params;
    const coach = await User.findOne({ _id: id, role: 'coach' }).select('-password');
    if (!coach) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ coach });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await connectDB();
    const { id } = await params;
    const { name, email, phone, bio, specialization, rating, password, isActive } = await req.json();
    const update: Record<string, unknown> = { name, email, phone, bio, specialization, rating, isActive };
    if (password) update.password = await bcrypt.hash(password, 12);
    const coach = await User.findOneAndUpdate({ _id: id, role: 'coach' }, update, { new: true }).select('-password');
    if (!coach) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ coach });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await connectDB();
    const { id } = await params;
    await User.findOneAndDelete({ _id: id, role: 'coach' });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
