import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { Channel } from '@/models/Channel';

export async function GET(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const channels = await Channel.find().sort({ isDefault: -1, createdAt: 1 });
    return NextResponse.json({ channels });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await connectDB();
    const { name, description, type, slug, icon, isDefault, allowStudentPost } = await req.json();
    if (!name || !slug) return NextResponse.json({ error: 'Name and slug required' }, { status: 400 });
    const channel = await Channel.create({
      name, description, type: type || 'general',
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      icon, isDefault: isDefault || false,
      allowStudentPost: allowStudentPost !== false,
      createdBy: payload.id,
    });
    return NextResponse.json({ channel }, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
