import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { GameLibrary } from '@/models/GameLibrary';

export async function GET(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag');
    const eco = searchParams.get('eco');
    const search = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    const filter: Record<string, unknown> = { isPublic: true };
    if (tag) filter.tags = tag;
    if (eco) filter.eco = eco;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { white: { $regex: search, $options: 'i' } },
        { black: { $regex: search, $options: 'i' } },
        { event: { $regex: search, $options: 'i' } },
        { opening: { $regex: search, $options: 'i' } },
      ];
    }

    const [games, total] = await Promise.all([
      GameLibrary.find(filter)
        .populate('uploadedBy', 'name role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      GameLibrary.countDocuments(filter),
    ]);

    return NextResponse.json({ games, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'coach')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const data = await req.json();
    if (!data.title || !data.pgn) {
      return NextResponse.json({ error: 'Title and PGN are required' }, { status: 400 });
    }

    // Parse PGN headers
    const pgnHeaders: Record<string, string> = {};
    const headerRegex = /\[(\w+)\s+"([^"]+)"\]/g;
    let match;
    while ((match = headerRegex.exec(data.pgn)) !== null) {
      pgnHeaders[match[1]] = match[2];
    }

    const game = await GameLibrary.create({
      ...data,
      white: data.white || pgnHeaders.White || 'Unknown',
      black: data.black || pgnHeaders.Black || 'Unknown',
      event: data.event || pgnHeaders.Event,
      site: data.site || pgnHeaders.Site,
      date: data.date || pgnHeaders.Date,
      result: data.result || pgnHeaders.Result,
      eco: data.eco || pgnHeaders.ECO,
      uploadedBy: payload.id,
    });

    return NextResponse.json({ game }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
