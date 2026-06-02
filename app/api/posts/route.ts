import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Post } from '@/models/Post';
import { Course } from '@/models/Course';
import { User } from '@/models/User';
import { Notification } from '@/models/Notification';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId');
  const batchId = searchParams.get('batchId');

  const filter: Record<string, unknown> = {};
  if (courseId) {
    filter.courseId = courseId;
  } else if (batchId) {
    filter.batchId = batchId;
  } else {
    // Community posts: no courseId and no batchId
    filter.courseId = { $exists: false };
    filter.batchId = { $exists: false };
  }

  const posts = await Post.find(filter)
    .sort({ isPinned: -1, createdAt: -1 })
    .populate('author', 'name avatar role')
    .lean();
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { title, body, type, attachments, isPinned, courseId, batchId } = await req.json();
  if (!body) return NextResponse.json({ error: 'Body is required' }, { status: 400 });

  const post = await Post.create({
    author: session.id,
    courseId: courseId || undefined,
    batchId: batchId || undefined,
    title,
    body,
    type: type || 'post',
    attachments: attachments || [],
    isPinned: (session.role === 'admin' || session.role === 'coach') ? (isPinned || false) : false,
  });

  const populated = await post.populate('author', 'name avatar role');

  // Send notifications
  try {
    if (courseId) {
      const course = await Course.findById(courseId).select('title enrolledStudents').lean() as any;
      if (course && course.enrolledStudents?.length > 0) {
        const notifications = course.enrolledStudents
          .filter((sid: any) => sid.toString() !== session.id)
          .map((studentId: any) => ({
            userId: studentId,
            type: 'new_post',
            title: `New discussion in ${course.title}`,
            body: title ? `"${title}"` : body.slice(0, 80),
            link: `/student/posts/${post._id}`,
          }));
        if (notifications.length) await Notification.insertMany(notifications);
      }
    } else if (type === 'announcement' && (session.role === 'admin' || session.role === 'coach')) {
      // Community announcement — notify all students
      const students = await User.find({ role: 'student' }).select('_id').lean() as any[];
      const notifications = students
        .filter((u: any) => u._id.toString() !== session.id)
        .map((u: any) => ({
          userId: u._id,
          type: 'announcement',
          title: title || 'New Announcement',
          body: body.slice(0, 100),
          link: `/student/community`,
        }));
      if (notifications.length) await Notification.insertMany(notifications);
    }
  } catch (_) {}

  return NextResponse.json({ post: populated }, { status: 201 });
}

