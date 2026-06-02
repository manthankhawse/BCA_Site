import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Puzzle } from '@/models/Puzzle';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const difficulty = req.nextUrl.searchParams.get('difficulty');
  const random = req.nextUrl.searchParams.get('random') === 'true';

  await connectDB();
  const query = difficulty ? { difficulty } : {};

  if (random) {
    const count = await Puzzle.countDocuments(query);
    const skip = Math.floor(Math.random() * count);
    const puzzle = await Puzzle.findOne(query).skip(skip).lean();
    return NextResponse.json({ puzzle });
  }

  const puzzles = await Puzzle.find(query).limit(20).lean();
  return NextResponse.json({ puzzles });
}

// Admin: create puzzle
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const data = await req.json();
  const puzzle = await Puzzle.create(data);
  return NextResponse.json({ puzzle }, { status: 201 });
}
