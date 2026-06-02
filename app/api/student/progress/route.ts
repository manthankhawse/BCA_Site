import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { Progress } from '@/models/Progress';
import { Lesson } from '@/models/Lesson';
import { Module } from '@/models/Module';
import { Course } from '@/models/Course';

// GET progress for a student+course
export async function GET(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });

    const progress = await Progress.findOne({ userId: payload.id, courseId });
    return NextResponse.json({ progress });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST — mark a lesson complete
export async function POST(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { lessonId, courseId } = await req.json();
    if (!lessonId || !courseId) return NextResponse.json({ error: 'lessonId and courseId required' }, { status: 400 });

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

    let progress = await Progress.findOne({ userId: payload.id, courseId });
    if (!progress) {
      progress = await Progress.create({
        userId: payload.id, courseId,
        completedLessons: [lessonId],
        lastAccessedLessonId: lessonId,
        lastAccessedAt: new Date(),
      });
    } else {
      if (!progress.completedLessons.map(String).includes(lessonId)) {
        progress.completedLessons.push(lessonId as unknown as import('mongoose').Types.ObjectId);
      }
      progress.lastAccessedLessonId = lessonId as unknown as import('mongoose').Types.ObjectId;
      progress.lastAccessedAt = new Date();
    }

    // Check if module is fully complete
    const moduleLessons = await Lesson.find({ moduleId: lesson.moduleId }).select('_id');
    const moduleCompleted = moduleLessons.every(l =>
      progress!.completedLessons.map(String).includes(l._id.toString())
    );
    if (moduleCompleted && !progress.completedModules.map(String).includes(lesson.moduleId.toString())) {
      progress.completedModules.push(lesson.moduleId);
    }

    // Recalculate overall progress
    const course = await Course.findById(courseId);
    const totalLessons = course?.totalLessons || 1;
    progress.progressPercent = Math.round((progress.completedLessons.length / totalLessons) * 100);

    await progress.save();
    return NextResponse.json({ progress });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
