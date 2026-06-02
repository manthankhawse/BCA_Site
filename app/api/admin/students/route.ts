import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const students = await User.find({ role: 'student' }).select('-password').populate('enrolledCourses', 'title level').lean();
  return NextResponse.json({ students });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { name, email, password, phone, bio, rating } = await req.json();

  if (!name || !email || !password) return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });

  const existing = await User.findOne({ email });
  if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const student = await User.create({ name, email, password: hashed, role: 'student', phone, bio, rating });

  return NextResponse.json({ student: { ...student.toObject(), password: undefined } }, { status: 201 });
}
