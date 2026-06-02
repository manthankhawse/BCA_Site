import mongoose, { Schema, Document, models, model } from 'mongoose';

export type LessonType = 'text' | 'video' | 'pdf' | 'image' | 'pgn' | 'board' | 'link';

export interface ILesson extends Document {
  moduleId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  title: string;
  type: LessonType;
  body?: string;       // rich text / pgn notation
  fileUrl?: string;    // R2 URL for pdf/video/image
  linkUrl?: string;    // for link type
  fen?: string;        // starting position for board type
  duration?: number;   // in minutes
  order: number;
  isPreview: boolean;
  createdAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['text', 'video', 'pdf', 'image', 'pgn', 'board', 'link'], required: true },
    body: { type: String },
    fileUrl: { type: String },
    linkUrl: { type: String },
    fen: { type: String },
    duration: { type: Number },
    order: { type: Number, default: 0 },
    isPreview: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LessonSchema.index({ moduleId: 1, order: 1 });
LessonSchema.index({ courseId: 1 });

export const Lesson = models.Lesson || model<ILesson>('Lesson', LessonSchema);
