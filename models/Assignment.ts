import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IAssignment extends Document {
  course: mongoose.Types.ObjectId;
  moduleId?: mongoose.Types.ObjectId;
  lessonId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  title: string;
  description: string;
  dueDate?: Date;
  attachments: string[];
  maxPoints: number;
  rubric?: string;
  allowLateSubmission: boolean;
  submissionType: 'text' | 'file' | 'both';
  comments: {
    _id: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    body: string;
    attachments?: { url: string; type: string; name?: string }[];
    replies?: {
      author: mongoose.Types.ObjectId;
      body: string;
      attachments?: { url: string; type: string; name?: string }[];
      createdAt: Date;
    }[];
    createdAt: Date;
  }[];
  createdAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    moduleId: { type: Schema.Types.ObjectId, ref: 'Module' },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date },
    attachments: [{ type: String }],
    maxPoints: { type: Number, default: 100 },
    rubric: { type: String },
    allowLateSubmission: { type: Boolean, default: true },
    submissionType: { type: String, enum: ['text', 'file', 'both'], default: 'both' },
    comments: [
      {
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        body: String,
        attachments: [{ url: String, type: String, name: String }],
        replies: [
          {
            author: { type: Schema.Types.ObjectId, ref: 'User' },
            body: String,
            attachments: [{ url: String, type: String, name: String }],
            createdAt: { type: Date, default: Date.now },
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Assignment = models.Assignment || model<IAssignment>('Assignment', AssignmentSchema);
