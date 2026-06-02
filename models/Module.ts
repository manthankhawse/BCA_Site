import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IModule extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  createdAt: Date;
}

const ModuleSchema = new Schema<IModule>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ModuleSchema.index({ courseId: 1, order: 1 });

export const Module = models.Module || model<IModule>('Module', ModuleSchema);
