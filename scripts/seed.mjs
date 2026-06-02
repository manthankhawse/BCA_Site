#!/usr/bin/env node
// Run: node scripts/seed.mjs
// Seeds admin user + sample courses + chess puzzles

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://bca_admin:bca_secret123@localhost:27017/bca_erp?authSource=admin';

// ---- Inline schemas for seed script ----
const UserSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: String, avatar: String, enrolledCourses: [mongoose.Schema.Types.ObjectId],
  rating: Number, bio: String,
}, { timestamps: true });

const CourseSchema = new mongoose.Schema({
  title: String, description: String, level: String, thumbnail: String,
  enrolledStudents: [mongoose.Schema.Types.ObjectId], instructor: String,
  duration: String, isPublished: Boolean,
}, { timestamps: true });

const PuzzleSchema = new mongoose.Schema({
  fen: String, moves: [String], rating: Number, themes: [String],
  difficulty: String, description: String, source: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
const Puzzle = mongoose.models.Puzzle || mongoose.model('Puzzle', PuzzleSchema);

async function seed() {
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected!');

  // Seed admin
  const adminExists = await User.findOne({ email: 'admin@bca.com' });
  if (!adminExists) {
    const hashed = await bcrypt.hash('Admin@123', 12);
    await User.create({
      name: 'Admin',
      email: 'admin@bca.com',
      password: hashed,
      role: 'admin',
      rating: 2400,
      bio: 'Brilliant Chess Academy Administrator',
    });
    console.log('✅ Admin created: admin@bca.com / Admin@123');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // Seed sample courses
  const coursesExist = await Course.countDocuments();
  if (coursesExist === 0) {
    await Course.insertMany([
      {
        title: 'Beginner Training',
        description: 'Learn chess from scratch. Covers laws of chess, basic tactics, openings, and endgames. Perfect for all ages.',
        level: 'beginner',
        instructor: 'FM Arjun Sharma',
        duration: '8 weeks',
        isPublished: true,
      },
      {
        title: 'Intermediate Training',
        description: 'Structured course for players aiming for FIDE ratings. Strategy, calculation, and tournament prep.',
        level: 'intermediate',
        instructor: 'IM Priya Menon',
        duration: '12 weeks',
        isPublished: true,
      },
      {
        title: 'Advanced Training',
        description: 'Professional-level training under IMs/GMs. Deep openings, endgame mastery, psychology, and competitive preparation.',
        level: 'advanced',
        instructor: 'GM Rajesh Kumar',
        duration: '16 weeks',
        isPublished: true,
      },
      {
        title: 'Online Training',
        description: 'Flexible online sessions with expert tutors. Interactive lessons and tools for all levels.',
        level: 'beginner',
        instructor: 'BCA Team',
        duration: 'Self-paced',
        isPublished: true,
      },
    ]);
    console.log('✅ Sample courses seeded');
  } else {
    console.log('ℹ️  Courses already exist');
  }

  // Seed chess puzzles
  const puzzlesExist = await Puzzle.countDocuments();
  if (puzzlesExist === 0) {
    await Puzzle.insertMany([
      {
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        moves: ['f3g5'],
        rating: 1200,
        themes: ['fork', 'tactics'],
        difficulty: 'easy',
        description: 'Find the fork! White to move.',
        source: 'BCA Puzzle Set',
      },
      {
        fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1',
        moves: ['e6e7', 'e8d8', 'e5e6'],
        rating: 1000,
        themes: ['endgame', 'pawn'],
        difficulty: 'easy',
        description: 'King and Pawn Endgame - push to promote!',
        source: 'BCA Puzzle Set',
      },
      {
        fen: '2rr2k1/pp3ppp/2n1pq2/8/3P4/2PB1N2/PP3PPP/R2QR1K1 b - - 0 1',
        moves: ['c6d4', 'c3d4', 'c8c1'],
        rating: 1600,
        themes: ['sacrifice', 'tactics', 'combination'],
        difficulty: 'medium',
        description: 'Black sacrifices a knight for a crushing attack.',
        source: 'BCA Puzzle Set',
      },
      {
        fen: 'r4rk1/1pp2ppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP2PPP/R4RK1 w - - 0 10',
        moves: ['g5f6', 'g7f6', 'c4f7'],
        rating: 1800,
        themes: ['bishop', 'exchange', 'opening'],
        difficulty: 'hard',
        description: 'Famous Exchange Sacrifice in the Ruy Lopez structure.',
        source: 'BCA Puzzle Set',
      },
      {
        fen: '3r1rk1/1b2qppp/pn2p3/1p6/3QP3/1BN2N2/PPP3PP/R4R1K w - - 0 20',
        moves: ['d4d8', 'f8d8', 'f3e5'],
        rating: 1500,
        themes: ['queen', 'sacrifice', 'tactics'],
        difficulty: 'medium',
        description: 'Queen sacrifice leading to a decisive material advantage.',
        source: 'BCA Puzzle Set',
      },
      {
        fen: 'r1b1k2r/2ppbppp/p1n1pn2/qp2P3/3P1B2/2NB1N2/PPP2PPP/R2QK2R w KQkq - 0 9',
        moves: ['d3b5'],
        rating: 1400,
        themes: ['pin', 'bishop'],
        difficulty: 'medium',
        description: 'Pin the knight to win material.',
        source: 'BCA Puzzle Set',
      },
      {
        fen: '6k1/5p1p/4p1p1/3p4/8/1r3N1P/5PP1/6K1 b - - 0 1',
        moves: ['b3f3', 'g2f3', 'g6g5'],
        rating: 1900,
        themes: ['endgame', 'rook', 'pawn'],
        difficulty: 'hard',
        description: 'Active rook creates decisive passed pawn threats.',
        source: 'BCA Puzzle Set',
      },
      {
        fen: 'r1bqr1k1/ppp2pbp/2np1np1/4p3/2PPP3/2N1BN1P/PP3PP1/R2QKB1R w KQ - 0 9',
        moves: ['d4e5', 'd6e5', 'f3e5'],
        rating: 2000,
        themes: ['center', 'tactics', 'knight'],
        difficulty: 'expert',
        description: 'King\'s Indian Attack: central break wins material.',
        source: 'BCA Puzzle Set',
      },
      {
        fen: '8/8/3k4/8/8/3K4/3Q4/8 w - - 0 1',
        moves: ['d2d6'],
        rating: 800,
        themes: ['checkmate', 'queen', 'endgame'],
        difficulty: 'easy',
        description: 'Queen and King vs King - find the quickest path to checkmate.',
        source: 'BCA Puzzle Set',
      },
      {
        fen: 'r3k2r/ppp2ppp/2n1b3/2bpp1B1/4P3/2NP1N2/PPP2PPP/R2QK2R w KQkq - 0 9',
        moves: ['g5f6', 'g7f6', 'd1h5'],
        rating: 2100,
        themes: ['attack', 'kingside', 'bishop'],
        difficulty: 'expert',
        description: 'Sacrificial attack to expose the king.',
        source: 'BCA Puzzle Set',
      },
    ]);
    console.log('✅ Chess puzzles seeded (10 puzzles)');
  } else {
    console.log('ℹ️  Puzzles already exist');
  }

  await mongoose.disconnect();
  console.log('🏁 Seed complete!');
}

seed().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });
