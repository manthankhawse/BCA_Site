import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { GalleryItem } from '@/models/GalleryItem';
import { getSessionFromRequest } from '@/lib/auth';

// Public GET — returns all gallery items sorted by order
export async function GET() {
  try {
    await connectDB();
    const items = await GalleryItem.find({}).sort({ order: 1, createdAt: 1 });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Admin POST — add a new gallery item
export async function POST(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const body = await req.json();
    const item = await GalleryItem.create(body);
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
