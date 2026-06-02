import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { Lesson } from '@/models/Lesson';
import { Course } from '@/models/Course';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; mid: string; lid: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { lid } = await params;
    const lesson = await Lesson.findById(lid);
    if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ lesson });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; mid: string; lid: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'coach')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const { lid } = await params;
    const data = await req.json();
    const lesson = await Lesson.findByIdAndUpdate(lid, data, { new: true });
    return NextResponse.json({ lesson });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; mid: string; lid: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'coach')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const { id, lid } = await params;
    await Lesson.findByIdAndDelete(lid);
    const count = await Lesson.countDocuments({ courseId: id });
    await Course.findByIdAndUpdate(id, { totalLessons: count });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
