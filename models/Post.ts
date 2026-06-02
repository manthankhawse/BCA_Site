import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IReply {
  _id?: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  body: string;
  attachments?: { url: string; type: string; name?: string }[];
  createdAt: Date;
}

export interface IComment {
  _id?: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  body: string;
  attachments?: { url: string; type: string; name?: string }[];
  replies?: IReply[];
  reactions: { user: mongoose.Types.ObjectId; emoji: string }[];
  createdAt: Date;
}

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  channelId?: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  batchId?: mongoose.Types.ObjectId;
  title?: string;
  body: string;
  type: 'post' | 'announcement' | 'puzzle_challenge' | 'analysis';
  attachments: { url: string; key?: string; type: 'image' | 'pdf' | 'video' | 'pgn' }[];
  reactions: { user: mongoose.Types.ObjectId; emoji: string }[];
  comments: IComment[];
  isPinned: boolean;
  tags: string[];
  viewCount: number;
  createdAt: Date;
}

const ReplySchema = new Schema<IReply>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  attachments: [{ url: String, type: String, name: String }],
  createdAt: { type: Date, default: Date.now },
});

const CommentSchema = new Schema<IComment>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  attachments: [{ url: String, type: String, name: String }],
  replies: [ReplySchema],
  reactions: [{ user: { type: Schema.Types.ObjectId, ref: 'User' }, emoji: String }],
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    channelId: { type: Schema.Types.ObjectId, ref: 'Channel' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch' },
    title: { type: String },
    body: { type: String, required: true },
    type: { type: String, enum: ['post', 'announcement', 'puzzle_challenge', 'analysis'], default: 'post' },
    attachments: [
      {
        url: { type: String, required: true },
        key: { type: String },
        type: { type: String, enum: ['image', 'pdf', 'video', 'pgn'] },
      },
    ],
    reactions: [{ user: { type: Schema.Types.ObjectId, ref: 'User' }, emoji: String }],
    comments: [CommentSchema],
    isPinned: { type: Boolean, default: false },
    tags: [{ type: String }],
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PostSchema.index({ channelId: 1, createdAt: -1 });
PostSchema.index({ isPinned: 1 });

export const Post = models.Post || model<IPost>('Post', PostSchema);
