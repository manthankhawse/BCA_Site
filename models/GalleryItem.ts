import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IGalleryItem extends Document {
  url: string;          // full URL or relative path to the image
  caption?: string;
  isDefault: boolean;   // true = pre-loaded default, false = admin-added
  order: number;
  createdAt: Date;
}

const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    url: { type: String, required: true },
    caption: { type: String },
    isDefault: { type: Boolean, default: false },
    order: { type: Number, default: 999 },
  },
  { timestamps: true }
);

export const GalleryItem =
  models.GalleryItem || model<IGalleryItem>('GalleryItem', GalleryItemSchema);
