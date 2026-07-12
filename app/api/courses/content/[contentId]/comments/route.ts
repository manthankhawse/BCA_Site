import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Content } from '@/models/Content';
import { User } from '@/models/User';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { contentId } = await params;
  const { body } = await req.json();

  if (!body || !body.trim()) {
    return NextResponse.json({ error: 'Comment body is required' }, { status: 400 });
  }

  await connectDB();

  const content = await Content.findById(contentId);
  if (!content) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }

  // Push new comment
  const newComment = {
    author: session.id,
    body: body.trim(),
    createdAt: new Date()
  };

  content.comments.push(newComment as any);
  await content.save();

  // Return populated comments
  const populated = await Content.findById(contentId)
    .populate('comments.author', 'name role')
    .lean();

  return NextResponse.json({ comments: populated?.comments || [] });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { contentId } = await params;
  const { searchParams } = new URL(req.url);
  const commentId = searchParams.get('commentId');

  if (!commentId) {
    return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
  }

  await connectDB();

  const content = await Content.findById(contentId);
  if (!content) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }

  const commentIndex = content.comments.findIndex((c: any) => c._id.toString() === commentId);
  if (commentIndex === -1) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }

  const comment = content.comments[commentIndex];

  // Only allow admin or the comment author to delete it
  if (session.role !== 'admin' && comment.author.toString() !== session.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  content.comments.splice(commentIndex, 1);
  await content.save();

  const populated = await Content.findById(contentId)
    .populate('comments.author', 'name role')
    .lean();

  return NextResponse.json({ comments: populated?.comments || [] });
}
