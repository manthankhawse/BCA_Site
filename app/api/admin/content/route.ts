import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Content } from '@/models/Content';
import { Course } from '@/models/Course';
import { Notification } from '@/models/Notification';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const courseId = req.nextUrl.searchParams.get('courseId');
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });

  await connectDB();
  const contents = await Content.find({ course: courseId }).sort({ createdAt: 1 }).lean();
  return NextResponse.json({ contents });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const data = await req.json();
  if (!data.course || !data.title || !data.type) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  const content = await Content.create(data);

  // Notify enrolled students
  try {
    const course = await Course.findById(data.course).select('title enrolledStudents').lean() as any;
    if (course && course.enrolledStudents?.length > 0) {
      const notifications = course.enrolledStudents.map((studentId: any) => ({
        userId: studentId,
        type: 'content_update',
        title: `New content in ${course.title}`,
        body: `"${data.title}" has been added to the course.`,
        link: `/student/courses/${data.course}`,
      }));
      await Notification.insertMany(notifications);
    }
  } catch (_) {}

  return NextResponse.json({ content }, { status: 201 });
}

