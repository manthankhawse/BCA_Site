import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IAttendance extends Document {
  batchId: mongoose.Types.ObjectId;
  date: Date;
  records: {
    studentId: mongoose.Types.ObjectId;
    status: 'present' | 'absent' | 'late' | 'excused';
    note?: string;
  }[];
  markedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    date: { type: Date, required: true },
    records: [
      {
        studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
          type: String,
          enum: ['present', 'absent', 'late', 'excused'],
          default: 'absent',
        },
        note: { type: String },
      },
    ],
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

AttendanceSchema.index({ batchId: 1, date: 1 }, { unique: true });

export const Attendance = models.Attendance || model<IAttendance>('Attendance', AttendanceSchema);
