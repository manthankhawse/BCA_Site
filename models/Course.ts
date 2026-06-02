import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  thumbnail?: string;
  enrolledStudents: mongoose.Types.ObjectId[];
  coachId?: mongoose.Types.ObjectId;
  instructor?: string;
  duration?: string;
  tags?: string[];
  isPublished: boolean;
  totalLessons?: number;
  createdAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'elite'], required: true },
    thumbnail: { type: String },
    enrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    coachId: { type: Schema.Types.ObjectId, ref: 'User' },
    instructor: { type: String },
    duration: { type: String },
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: true },
    totalLessons: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Course = models.Course || model<ICourse>('Course', CourseSchema);
