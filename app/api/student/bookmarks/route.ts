import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { User } from '@/models/User';

// GET bookmarks
export async function GET(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const user = await User.findById(payload.id)
      .populate('bookmarks.lessons', 'title type courseId moduleId')
      .populate('bookmarks.puzzles', 'title difficulty rating themes')
      .populate('bookmarks.games', 'title white black opening eco');
    return NextResponse.json({ bookmarks: user?.bookmarks || {} });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST — add bookmark
export async function POST(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { type, id } = await req.json(); // type: 'lessons' | 'puzzles' | 'games'
    if (!type || !id) return NextResponse.json({ error: 'type and id required' }, { status: 400 });

    await User.findByIdAndUpdate(payload.id, {
      $addToSet: { [`bookmarks.${type}`]: id },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE — remove bookmark
export async function DELETE(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    if (!type || !id) return NextResponse.json({ error: 'type and id required' }, { status: 400 });

    await User.findByIdAndUpdate(payload.id, {
      $pull: { [`bookmarks.${type}`]: id },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
