import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { GalleryItem } from '@/models/GalleryItem';
import { getSessionFromRequest } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const { id } = await params;
    const item = await GalleryItem.findById(id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (item.isDefault) return NextResponse.json({ error: 'Cannot delete default gallery items' }, { status: 400 });
    await item.deleteOne();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
