import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IBatch extends Document {
  name: string;
  description?: string;
  coachId: mongoose.Types.ObjectId;
  studentIds: mongoose.Types.ObjectId[];
  courseIds: mongoose.Types.ObjectId[];
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  maxStrength?: number;
  createdAt: Date;
}

const BatchSchema = new Schema<IBatch>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    coachId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    courseIds: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    schedule: [
      {
        day: { type: String },
        startTime: { type: String },
        endTime: { type: String },
      },
    ],
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    maxStrength: { type: Number },
  },
  { timestamps: true }
);

export const Batch = models.Batch || model<IBatch>('Batch', BatchSchema);
