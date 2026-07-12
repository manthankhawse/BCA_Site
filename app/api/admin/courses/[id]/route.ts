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

  // Admins see everything; enrolled students see published content only
  if (session.role !== 'admin') {
    const user = await User.findById(session.id);
    const enrolled = user?.enrolledCourses?.some((c: any) => c.toString() === id);
    if (!enrolled) return NextResponse.json({ error: 'Not enrolled' }, { status: 403 });
  }

  let courseQuery = Course.findById(id);
  if (session.role === 'admin') {
    courseQuery = courseQuery.populate('enrolledStudents', 'name email avatar rating');
  }
  const course = await courseQuery.lean();
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

  const contentsQuery = session.role === 'admin' ? { course: id } : { course: id, isPublished: true };
  const contents = await Content.find(contentsQuery)
    .populate('comments.author', 'name role')
    .sort({ createdAt: 1 })
    .lean();
  const assignments = await Assignment.find({ course: id }).lean();

  return NextResponse.json({ course, contents, assignments });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const data = await req.json();
  const course = await Course.findByIdAndUpdate(id, data, { new: true });
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  return NextResponse.json({ course });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();

  await Content.deleteMany({ course: id });
  await Assignment.deleteMany({ course: id });
  await User.updateMany({ enrolledCourses: id }, { $pull: { enrolledCourses: id } });
  await Course.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}

// Enroll/unenroll students
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { studentId, action } = await req.json(); // action: 'enroll' | 'unenroll'

  await connectDB();

  if (action === 'enroll') {
    await Course.findByIdAndUpdate(id, { $addToSet: { enrolledStudents: studentId } });
    await User.findByIdAndUpdate(studentId, { $addToSet: { enrolledCourses: id } });
  } else {
    await Course.findByIdAndUpdate(id, { $pull: { enrolledStudents: studentId } });
    await User.findByIdAndUpdate(studentId, { $pull: { enrolledCourses: id } });
  }

  return NextResponse.json({ success: true });
}
