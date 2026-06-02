import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { SavedAnalysis } from '@/models/SavedAnalysis';

export async function GET(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const analyses = await SavedAnalysis.find({ userId: payload.id }).sort({ createdAt: -1 });
    return NextResponse.json({ analyses });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { name, fen, pgn, notes, tags, isPublic } = await req.json();
    if (!name || !fen) return NextResponse.json({ error: 'Name and FEN required' }, { status: 400 });
    const analysis = await SavedAnalysis.create({
      userId: payload.id, name, fen, pgn, notes,
      tags: tags || [], isPublic: isPublic || false,
    });
    return NextResponse.json({ analysis }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await SavedAnalysis.findOneAndDelete({ _id: id, userId: payload.id });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
