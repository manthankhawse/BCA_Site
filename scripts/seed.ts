import { connectDB } from '../lib/mongodb';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Module } from '../models/Module';
import { Lesson } from '../models/Lesson';
import { Batch } from '../models/Batch';
import bcrypt from 'bcryptjs';

const SEED_PASSWORD = 'password123';

async function seed() {
  await connectDB();
  console.log('🌱 Connected to MongoDB');

  // Clear existing data (optional, remove in production)
  console.log('🗑️ Clearing existing data...');
  await User.deleteMany({});
  await Course.deleteMany({});
  await Module.deleteMany({});
  await Lesson.deleteMany({});
  await Batch.deleteMany({});

  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

  // 1. Create Users
  console.log('👥 Creating users...');
  
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@bca.com',
    password: hashedPassword,
    role: 'admin',
    rating: 2000,
  });

  const coach1 = await User.create({
    name: 'Magnus Carlsen',
    email: 'magnus@bca.com',
    password: hashedPassword,
    role: 'coach',
    rating: 2882,
    specialization: ['Endgames', 'Positional Play'],
    isActive: true,
  });

  const coach2 = await User.create({
    name: 'Hikaru Nakamura',
    email: 'hikaru@bca.com',
    password: hashedPassword,
    role: 'coach',
    rating: 2789,
    specialization: ['Tactics', 'Speed Chess'],
    isActive: true,
  });

  const student1 = await User.create({
    name: 'John Doe',
    email: 'john@bca.com',
    password: hashedPassword,
    role: 'student',
    rating: 1200,
  });

  const student2 = await User.create({
    name: 'Jane Smith',
    email: 'jane@bca.com',
    password: hashedPassword,
    role: 'student',
    rating: 1450,
  });

  // 2. Create Courses
  console.log('📚 Creating courses...');
  
  const course1 = await Course.create({
    title: 'Beginner Chess Fundamentals',
    description: 'Master the basics of chess: piece movements, simple tactics, and opening principles.',
    level: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?auto=format&fit=crop&q=80&w=800',
    instructor: 'Magnus Carlsen',
    totalLessons: 3,
  });

  const course2 = await Course.create({
    title: 'Advanced Endgame Strategy',
    description: 'Learn how to convert advantages into wins with precise endgame technique.',
    level: 'advanced',
    thumbnail: 'https://images.unsplash.com/photo-1560174038-da43ac74f01b?auto=format&fit=crop&q=80&w=800',
    instructor: 'Hikaru Nakamura',
    totalLessons: 2,
  });

  // 3. Create Modules & Lessons for Course 1
  console.log('📖 Creating modules and lessons...');
  
  const mod1 = await Module.create({
    courseId: course1._id,
    title: 'Module 1: The Board and Pieces',
    description: 'Learn how to set up the board and move each piece.',
    order: 1,
  });

  await Lesson.create({
    courseId: course1._id,
    moduleId: mod1._id,
    title: 'Introduction to the Chessboard',
    type: 'text',
    body: 'The chessboard consists of 64 squares in an 8x8 grid. Always set up the board so that a light square is in the bottom right corner ("light on right").\n\nThe files (columns) are labeled a-h, and the ranks (rows) are labeled 1-8.',
    order: 1,
    duration: 10,
    isPreview: true,
  });

  await Lesson.create({
    courseId: course1._id,
    moduleId: mod1._id,
    title: 'How the Knight Moves',
    type: 'board',
    body: 'The knight moves in an "L" shape: two squares in one direction and then one square perpendicular. It is the only piece that can jump over other pieces.',
    fen: '8/8/8/4N3/8/8/8/8 w - - 0 1',
    order: 2,
    duration: 15,
  });

  const mod2 = await Module.create({
    courseId: course1._id,
    title: 'Module 2: Basic Tactics',
    order: 2,
  });

  await Lesson.create({
    courseId: course1._id,
    moduleId: mod2._id,
    title: 'The Fork',
    type: 'pgn',
    body: '[Event "Fork Example"]\n[White "Player 1"]\n[Black "Player 2"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. O-O Nf6 5. d3 d6 6. Bg5 h6 7. Bh4 g5 8. Bg3 Bg4 9. Nbd2 Nh5 10. c3 Qf6 11. a4 a6 12. b4 Ba7 13. b5 Nd8 14. bxa6 bxa6 15. Bxa6 Ne6 16. Bb5+ Kf8 17. d4',
    order: 1,
    duration: 20,
  });

  // 4. Create Batches
  console.log('🏫 Creating batches...');
  
  await Batch.create({
    name: 'Summer Bootcamp 2026',
    description: 'Intensive 4-week training for beginners to reach 1500 Elo.',
    coachId: coach1._id,
    courseIds: [course1._id],
    studentIds: [student1._id, student2._id],
    schedule: [
      { day: 'Monday', startTime: '18:00', endTime: '19:30' },
      { day: 'Wednesday', startTime: '18:00', endTime: '19:30' }
    ],
    isActive: true,
  });

  await Batch.create({
    name: 'Elite Tactics Squad',
    description: 'Advanced calculation and tactical vision training.',
    coachId: coach2._id,
    courseIds: [course2._id],
    studentIds: [student2._id],
    schedule: [
      { day: 'Saturday', startTime: '10:00', endTime: '12:00' }
    ],
    isActive: true,
  });

  // Add enrolled courses to students
  await User.findByIdAndUpdate(student1._id, { $push: { enrolledCourses: course1._id } });
  await User.findByIdAndUpdate(student2._id, { $push: { enrolledCourses: { $each: [course1._id, course2._id] } } });

  console.log('✅ Seeding completed successfully!');
  console.log('Credentials:');
  console.log('Admin: admin@bca.com / password123');
  console.log('Coach: magnus@bca.com / password123');
  console.log('Student: john@bca.com / password123');
  
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});
