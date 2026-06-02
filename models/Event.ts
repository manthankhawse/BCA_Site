import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description?: string;
  type: 'class' | 'tournament' | 'assignment_deadline' | 'exam' | 'holiday' | 'other';
  startDate: Date;
  endDate?: Date;
  allDay: boolean;
  batchId?: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  tournamentId?: mongoose.Types.ObjectId;
  assignmentId?: mongoose.Types.ObjectId;
  audience: 'all' | 'batch' | 'course';
  color?: string;
  location?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['class', 'tournament', 'assignment_deadline', 'exam', 'holiday', 'other'],
      default: 'other',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    allDay: { type: Boolean, default: false },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament' },
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment' },
    audience: { type: String, enum: ['all', 'batch', 'course'], default: 'all' },
    color: { type: String, default: '#f59e0b' },
    location: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

EventSchema.index({ startDate: 1 });

export const Event = models.Event || model<IEvent>('Event', EventSchema);
