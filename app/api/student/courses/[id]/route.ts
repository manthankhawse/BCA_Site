import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Course } from '@/models/Course';
import { Content } from '@/models/Content';
import { Assignment } from '@/models/Assignment';
import { User } from '@/models/User';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();

  // Admin bypasses enrollment check; students must be enrolled
  if (session.role !== 'admin') {
    const user = await User.findById(session.id);
    const isEnrolled = user?.enrolledCourses?.some((c: any) => c.toString() === id);
    if (!isEnrolled) return NextResponse.json({ error: 'Not enrolled' }, { status: 403 });
  }

  const course = await Course.findById(id).lean();
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const contentsQuery = session.role === 'admin' ? { course: id } : { course: id, isPublished: true };
  const contents = await Content.find(contentsQuery).sort({ createdAt: 1 }).lean();
  const assignments = await Assignment.find({ course: id }).lean();

  return NextResponse.json({ course, contents, assignments });
}

