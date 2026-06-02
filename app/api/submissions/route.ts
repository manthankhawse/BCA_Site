import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Submission } from '@/models/Submission';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const assignmentId = req.nextUrl.searchParams.get('assignmentId');
  await connectDB();

  const query = session.role === 'admin'
    ? assignmentId ? { assignment: assignmentId } : {}
    : { student: session.id, ...(assignmentId ? { assignment: assignmentId } : {}) };

  const submissions = await Submission.find(query).populate('student', 'name email').populate('assignment', 'title').lean();
  return NextResponse.json({ submissions });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { assignmentId, content, fileUrls } = await req.json();

  const existing = await Submission.findOne({ assignment: assignmentId, student: session.id });
  if (existing) {
    existing.content = content;
    existing.fileUrls = fileUrls || [];
    existing.submittedAt = new Date();
    await existing.save();
    return NextResponse.json({ submission: existing });
  }

  const submission = await Submission.create({ assignment: assignmentId, student: session.id, content, fileUrls: fileUrls || [] });
  return NextResponse.json({ submission }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  // Admin grades a submission
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id, grade, feedback } = await req.json();
  const submission = await Submission.findByIdAndUpdate(id, { grade, feedback }, { new: true });
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ submission });
}
