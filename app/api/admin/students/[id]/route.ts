import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Course } from '@/models/Course';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const student = await User.findById(id).select('-password').populate('enrolledCourses', 'title level').lean();
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  return NextResponse.json({ student });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const { name, email, password, phone, bio, rating, avatar } = await req.json();

  const update: Record<string, unknown> = { name, email, phone, bio, rating, avatar };
  if (password) update.password = await bcrypt.hash(password, 12);

  const student = await User.findByIdAndUpdate(id, update, { new: true }).select('-password');
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  return NextResponse.json({ student });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();

  // Remove from all courses
  await Course.updateMany({ enrolledStudents: id }, { $pull: { enrolledStudents: id } });
  await User.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
