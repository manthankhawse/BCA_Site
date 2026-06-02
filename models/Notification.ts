import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'assignment' | 'new_assignment' | 'lesson' | 'content_update' | 'new_course' | 'announcement' | 'new_post' | 'tournament' | 'grade' | 'attendance' | 'system';
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['assignment', 'new_assignment', 'lesson', 'content_update', 'new_course', 'announcement', 'new_post', 'tournament', 'grade', 'attendance', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = models.Notification || model<INotification>('Notification', NotificationSchema);

