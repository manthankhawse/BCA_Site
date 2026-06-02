import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Assignment } from '@/models/Assignment';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();

  const { body, attachments, commentId } = await req.json();
  if (!body?.trim() && (!attachments || attachments.length === 0)) {
    return NextResponse.json({ error: 'Comment body or attachment required' }, { status: 400 });
  }

  const assignment = await Assignment.findById(id);
  if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

  const formattedAttachments = attachments?.map((url: string) => ({
    url, type: 'file', name: url.split('/').pop() || 'attachment'
  })) || [];

  if (commentId) {
    const comment = assignment.comments.id(commentId);
    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    comment.replies = comment.replies || [];
    comment.replies.push({ author: session.id, body: body || '', attachments: formattedAttachments, createdAt: new Date() });
  } else {
    assignment.comments.push({ author: session.id, body: body || '', attachments: formattedAttachments, createdAt: new Date() });
  }
  
  await assignment.save();
  await assignment.populate('comments.author comments.replies.author', 'name role avatar');

  return NextResponse.json({ comments: assignment.comments });
}

