import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  await connectDB();
  const user = await User.findById(session.id).select('-password').populate('enrolledCourses', 'title level').lean();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  await connectDB();
  const data = await req.json();
  
  // Only allow updating safe fields
  const safeData = {
    name: data.name,
    phone: data.phone,
    bio: data.bio,
    avatar: data.avatar,
  };

  const user = await User.findByIdAndUpdate(
    session.id,
    { $set: safeData },
    { new: true }
  ).select('-password').lean();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({ user });
}
