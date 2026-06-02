import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Assignment } from '@/models/Assignment';
import { Course } from '@/models/Course';
import { Notification } from '@/models/Notification';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const courseId = req.nextUrl.searchParams.get('courseId');
  await connectDB();
  const query = courseId ? { course: courseId } : {};
  const assignments = await Assignment.find(query).populate('course', 'title').lean();
  return NextResponse.json({ assignments });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const data = await req.json();
  if (!data.course || !data.title || !data.description) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  const assignment = await Assignment.create({ ...data, createdBy: session.id });

  // Notify enrolled students
  try {
    const course = await Course.findById(data.course).select('title enrolledStudents').lean() as any;
    if (course && course.enrolledStudents?.length > 0) {
      const dueStr = data.dueDate ? ` Due: ${new Date(data.dueDate).toLocaleDateString()}.` : '';
      const notifications = course.enrolledStudents.map((studentId: any) => ({
        userId: studentId,
        type: 'new_assignment',
        title: `New assignment in ${course.title}`,
        body: `"${data.title}" has been posted.${dueStr}`,
        link: `/student/assignments/${assignment._id}`,
      }));
      await Notification.insertMany(notifications);
    }
  } catch (_) {}

  return NextResponse.json({ assignment }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id, ...data } = await req.json();
  const assignment = await Assignment.findByIdAndUpdate(id, data, { new: true });
  if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ assignment });
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await connectDB();
  await Assignment.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

