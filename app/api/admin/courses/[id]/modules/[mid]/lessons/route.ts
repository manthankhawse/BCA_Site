import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { Lesson } from '@/models/Lesson';
import { Course } from '@/models/Course';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; mid: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { mid } = await params;
    const lessons = await Lesson.find({ moduleId: mid }).sort({ order: 1 });
    return NextResponse.json({ lessons });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; mid: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'coach')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const { id, mid } = await params;
    const { title, type, body, fileUrl, linkUrl, fen, duration, isPreview } = await req.json();

    const last = await Lesson.findOne({ moduleId: mid }).sort({ order: -1 });
    const order = last ? last.order + 1 : 0;

    const lesson = await Lesson.create({
      moduleId: mid, courseId: id,
      title, type, body, fileUrl, linkUrl, fen,
      duration: duration || null, order,
      isPreview: isPreview || false,
    });

    // Update totalLessons on course
    const count = await Lesson.countDocuments({ courseId: id });
    await Course.findByIdAndUpdate(id, { totalLessons: count });

    return NextResponse.json({ lesson }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
