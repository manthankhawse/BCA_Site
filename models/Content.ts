import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IComment {
  _id?: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  body: string;
  createdAt: Date;
}

export interface IContent extends Document {
  course: mongoose.Types.ObjectId;
  title: string;
  type: 'text' | 'pdf' | 'image' | 'video' | 'link' | 'pgn';
  body?: string; // for text/html content or PGN string
  fileUrl?: string; // R2 key or external URL
  fileKey?: string; // R2 object key for deletion
  linkUrl?: string;
  order: number;
  isPublished: boolean;
  comments: IComment[];
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ContentSchema = new Schema<IContent>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['text', 'pdf', 'image', 'video', 'link', 'pgn'], required: true },
    body: { type: String },
    fileUrl: { type: String },
    fileKey: { type: String },
    linkUrl: { type: String },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    comments: { type: [CommentSchema], default: [] }
  },
  { timestamps: true }
);

ContentSchema.index({ course: 1, order: 1 });

export const Content = models.Content || model<IContent>('Content', ContentSchema);
