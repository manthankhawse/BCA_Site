import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ICategory {
  label: string;
  items: string[];
}

export interface IAchiever extends Document {
  name: string;
  title: string;
  photo: string; // R2 public URL
  categories: ICategory[];
  order: number;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    label: { type: String, required: true },
    items: [{ type: String }],
  },
  { _id: false }
);

const AchieverSchema = new Schema<IAchiever>(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    photo: { type: String, required: true },
    categories: [CategorySchema],
    order: { type: Number, default: 999 },
  },
  { timestamps: true }
);

export const Achiever = models.Achiever || model<IAchiever>('Achiever', AchieverSchema);
