import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { Post } from '@/models/Post';
import { Channel } from '@/models/Channel';
import { Notification } from '@/models/Notification';
import { User } from '@/models/User';

// Add comment to post
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const { body, attachments, commentId } = await req.json();
    if (!body?.trim() && (!attachments || attachments.length === 0)) return NextResponse.json({ error: 'Comment body or attachment required' }, { status: 400 });

    const post = await Post.findById(id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const formattedAttachments = attachments?.map((url: string) => ({
      url, type: 'file', name: url.split('/').pop() || 'attachment'
    })) || [];

    if (commentId) {
      const comment = post.comments.id(commentId);
      if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      comment.replies = comment.replies || [];
      comment.replies.push({ author: payload.id, body: body || '', attachments: formattedAttachments, createdAt: new Date() });
    } else {
      post.comments.push({ author: payload.id, body: body || '', attachments: formattedAttachments, reactions: [], createdAt: new Date() });
    }

    await post.save();
    await post.populate('comments.author comments.replies.author', 'name avatar role');

    // Notify post author
    if (post && post.author.toString() !== payload.id) {
      await Notification.create({
        userId: post.author,
        type: 'announcement',
        title: commentId ? 'New reply on your comment' : 'New comment on your post',
        body: `Someone ${commentId ? 'replied to your comment' : 'commented on your post'}: "${(body || 'attachment').slice(0, 60)}..."`,
        link: `/student/community`,
      });
    }

    return NextResponse.json({ comments: post?.comments });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
