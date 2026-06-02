import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'coach' | 'student';
  avatar?: string;
  phone?: string;
  bio?: string;
  rating?: number;
  // Coach-specific
  specialization?: string[];
  coachBatches?: mongoose.Types.ObjectId[];
  // Student-specific
  enrolledCourses: mongoose.Types.ObjectId[];
  batchIds?: mongoose.Types.ObjectId[];
  achievements?: { title: string; awardedAt: Date; icon?: string }[];
  puzzleStats?: {
    solved: number;
    attempted: number;
    streak: number;
    lastSolvedAt?: Date;
    ratingHistory?: { rating: number; date: Date }[];
  };
  bookmarks?: {
    lessons?: mongoose.Types.ObjectId[];
    puzzles?: mongoose.Types.ObjectId[];
    games?: mongoose.Types.ObjectId[];
  };
  joinedAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'coach', 'student'], default: 'student' },
    avatar: { type: String },
    phone: { type: String },
    bio: { type: String },
    rating: { type: Number, default: 1000 },
    specialization: [{ type: String }],
    coachBatches: [{ type: Schema.Types.ObjectId, ref: 'Batch' }],
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    batchIds: [{ type: Schema.Types.ObjectId, ref: 'Batch' }],
    achievements: [
      {
        title: { type: String },
        awardedAt: { type: Date, default: Date.now },
        icon: { type: String },
      },
    ],
    puzzleStats: {
      solved: { type: Number, default: 0 },
      attempted: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      lastSolvedAt: { type: Date },
      ratingHistory: [{ rating: Number, date: Date }],
    },
    bookmarks: {
      lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
      puzzles: [{ type: Schema.Types.ObjectId, ref: 'Puzzle' }],
      games: [{ type: Schema.Types.ObjectId, ref: 'GameLibrary' }],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>('User', UserSchema);
