import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IReview extends Document {
  name: string;
  comment: string;
  role?: string;       // e.g. "BCA Student / Parent"
  rating?: number;     // 1-5
  isDefault: boolean;  // true = original seed data
  order: number;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    name: { type: String, required: true, trim: true },
    comment: { type: String, required: true },
    role: { type: String, default: 'BCA Student / Parent' },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    isDefault: { type: Boolean, default: false },
    order: { type: Number, default: 999 },
  },
  { timestamps: true }
);

export const Review = models.Review || model<IReview>('Review', ReviewSchema);
