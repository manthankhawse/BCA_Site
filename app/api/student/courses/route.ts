import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Course } from '@/models/Course';
import { User } from '@/models/User';
import { getSessionFromRequest } from '@/lib/auth';

// GET: student's enrolled courses
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const user = await User.findById(session.id).populate({
    path: 'enrolledCourses',
    model: Course,
  }).lean();

  return NextResponse.json({ courses: user?.enrolledCourses || [] });
}
