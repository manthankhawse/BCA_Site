import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Content } from '@/models/Content';
import { getSessionFromRequest } from '@/lib/auth';
import { deleteObject } from '@/lib/r2';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const data = await req.json();
  const content = await Content.findByIdAndUpdate(id, data, { new: true });
  if (!content) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ content });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const content = await Content.findById(id);
  if (!content) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Delete from R2 if file exists
  if (content.fileKey) {
    try { await deleteObject(content.fileKey); } catch { /* ignore */ }
  }

  await content.deleteOne();
  return NextResponse.json({ success: true });
}
