import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { Tournament } from '@/models/Tournament';
import { Notification } from '@/models/Notification';
import { User } from '@/models/User';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const tournament = await Tournament.findById(id)
      .populate('participants.userId', 'name email avatar rating')
      .populate('pairings.white', 'name rating')
      .populate('pairings.black', 'name rating')
      .populate('standings.userId', 'name rating avatar')
      .populate('createdBy', 'name');
    if (!tournament) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ tournament });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await connectDB();
    const { id } = await params;
    const data = await req.json();
    const tournament = await Tournament.findByIdAndUpdate(id, data, { new: true });

    // Notify participants if status changes to 'ongoing'
    if (data.status === 'ongoing' && tournament) {
      const studentUsers = await User.find({ role: 'student' }).select('_id');
      const notifications = studentUsers.map(u => ({
        userId: u._id,
        type: 'tournament',
        title: `Tournament Started: ${tournament.name}`,
        body: `The ${tournament.name} tournament has begun! Check the pairings.`,
        link: `/student/tournaments/${id}`,
      }));
      await Notification.insertMany(notifications);
    }

    return NextResponse.json({ tournament });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await connectDB();
    const { id } = await params;
    await Tournament.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
