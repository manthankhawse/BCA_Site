import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Course } from '@/models/Course';
import { User } from '@/models/User';
import { Notification } from '@/models/Notification';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const courses = await Course.find().populate('enrolledStudents', 'name email avatar').lean();
  return NextResponse.json({ courses });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { title, description, level, thumbnail, instructor, duration } = await req.json();

  if (!title || !description || !level) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  const course = await Course.create({ title, description, level, thumbnail, instructor, duration });

  // Notify all students about the new course
  try {
    const students = await User.find({ role: 'student' }).select('_id').lean() as any[];
    const notifications = students.map((u: any) => ({
      userId: u._id,
      type: 'new_course',
      title: `New course available: ${title}`,
      body: description?.slice(0, 100) || `A new ${level} course is now available.`,
      link: `/student/courses`,
    }));
    if (notifications.length) await Notification.insertMany(notifications);
  } catch (_) {}

  return NextResponse.json({ course }, { status: 201 });
}

