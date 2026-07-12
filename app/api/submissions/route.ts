import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Submission } from '@/models/Submission';
import { Assignment } from '@/models/Assignment';
import { User } from '@/models/User';
import { Notification } from '@/models/Notification';
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

  const isResubmit = !!(await Submission.findOne({ assignment: assignmentId, student: session.id }));

  let submission;
  if (isResubmit) {
    const existing = await Submission.findOne({ assignment: assignmentId, student: session.id });
    existing!.content = content;
    existing!.fileUrls = fileUrls || [];
    existing!.submittedAt = new Date();
    await existing!.save();
    submission = existing;
  } else {
    submission = await Submission.create({ assignment: assignmentId, student: session.id, content, fileUrls: fileUrls || [] });
  }

  // Notify all admins about new/updated submission
  try {
    const assignment = await Assignment.findById(assignmentId).select('title').lean() as any;
    const admins = await User.find({ role: 'admin' }).select('_id').lean() as any[];
    const notifications = admins.map((a: any) => ({
      userId: a._id,
      type: 'submission',
      title: `${isResubmit ? 'Resubmission' : 'New Submission'}: ${assignment?.title || 'Assignment'}`,
      body: `${session.name} submitted${isResubmit ? ' (updated)' : ''}`,
      link: `/admin/assignments`,
    }));
    if (notifications.length) await Notification.insertMany(notifications);
  } catch (_) {}

  return NextResponse.json({ submission }, { status: isResubmit ? 200 : 201 });
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
