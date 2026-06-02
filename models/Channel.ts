import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IChannel extends Document {
  name: string;
  description?: string;
  type: 'general' | 'announcement' | 'analysis' | 'openings' | 'tournaments' | 'off-topic';
  slug: string;
  icon?: string;
  isDefault: boolean;
  allowStudentPost: boolean;
  members: mongoose.Types.ObjectId[];
  pinnedPostIds: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ChannelSchema = new Schema<IChannel>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['general', 'announcement', 'analysis', 'openings', 'tournaments', 'off-topic'],
      default: 'general',
    },
    slug: { type: String, required: true, unique: true, lowercase: true },
    icon: { type: String },
    isDefault: { type: Boolean, default: false },
    allowStudentPost: { type: Boolean, default: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    pinnedPostIds: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Channel = models.Channel || model<IChannel>('Channel', ChannelSchema);
