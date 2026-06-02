import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Post } from '@/models/Post';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { emoji } = await req.json();
  if (!emoji) return NextResponse.json({ error: 'emoji required' }, { status: 400 });

  await connectDB();
  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const existingIdx = post.reactions.findIndex((r: any) => r.user.toString() === session.id && r.emoji === emoji);

  if (existingIdx !== -1) {
    // Toggle off same emoji
    post.reactions.splice(existingIdx, 1);
  } else {
    // Remove any other emoji from this user, then add new
    const otherIdx = post.reactions.findIndex((r: any) => r.user.toString() === session.id);
    if (otherIdx !== -1) post.reactions.splice(otherIdx, 1);
    post.reactions.push({ user: session.id as unknown as import('mongoose').Types.ObjectId, emoji });
  }

  await post.save();
  return NextResponse.json({ reactions: post.reactions });
}
