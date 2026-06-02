import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { Module } from '@/models/Module';
import { Course } from '@/models/Course';
import { Lesson } from '@/models/Lesson';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const modules = await Module.find({ courseId: id }).sort({ order: 1 });
    const modulesWithLessons = await Promise.all(
      modules.map(async (m) => {
        const lessons = await Lesson.find({ moduleId: m._id }).sort({ order: 1 });
        return { ...m.toObject(), lessons };
      })
    );
    return NextResponse.json({ modules: modulesWithLessons });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'coach')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const { id } = await params;
    const { title, description } = await req.json();

    const lastModule = await Module.findOne({ courseId: id }).sort({ order: -1 });
    const order = lastModule ? lastModule.order + 1 : 0;

    const module = await Module.create({ courseId: id, title, description, order });
    return NextResponse.json({ module }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
