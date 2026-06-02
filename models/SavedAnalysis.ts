import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ISavedAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  fen: string;
  pgn?: string;
  notes?: string;
  tags?: string[];
  isPublic: boolean;
  createdAt: Date;
}

const SavedAnalysisSchema = new Schema<ISavedAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    fen: { type: String, required: true },
    pgn: { type: String },
    notes: { type: String },
    tags: [{ type: String }],
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SavedAnalysisSchema.index({ userId: 1, createdAt: -1 });

export const SavedAnalysis = models.SavedAnalysis || model<ISavedAnalysis>('SavedAnalysis', SavedAnalysisSchema);
