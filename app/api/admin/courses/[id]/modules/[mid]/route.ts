import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { Module } from '@/models/Module';
import { Lesson } from '@/models/Lesson';
import { Course } from '@/models/Course';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; mid: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'coach')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const { mid } = await params;
    const data = await req.json();
    const module = await Module.findByIdAndUpdate(mid, data, { new: true });
    return NextResponse.json({ module });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; mid: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'coach')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const { id, mid } = await params;
    await Module.findByIdAndDelete(mid);
    await Lesson.deleteMany({ moduleId: mid });
    // Recalculate totalLessons
    const count = await Lesson.countDocuments({ courseId: id });
    await Course.findByIdAndUpdate(id, { totalLessons: count });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
