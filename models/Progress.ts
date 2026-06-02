import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  completedLessons: mongoose.Types.ObjectId[];
  completedModules: mongoose.Types.ObjectId[];
  lastAccessedLessonId?: mongoose.Types.ObjectId;
  lastAccessedAt: Date;
  progressPercent: number;
  createdAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    completedModules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
    lastAccessedLessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    lastAccessedAt: { type: Date, default: Date.now },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

ProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Progress = models.Progress || model<IProgress>('Progress', ProgressSchema);
