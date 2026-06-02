import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IPuzzle extends Document {
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  description?: string;
  source?: string;
  title?: string;
  uploadedBy?: mongoose.Types.ObjectId;
  bookmarkedBy: mongoose.Types.ObjectId[];
  solvedBy: { userId: mongoose.Types.ObjectId; solvedAt: Date; attempts: number }[];
  createdAt: Date;
}

const PuzzleSchema = new Schema<IPuzzle>(
  {
    fen: { type: String, required: true },
    moves: [{ type: String, required: true }],
    rating: { type: Number, default: 1500 },
    themes: [{ type: String }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'], required: true },
    description: { type: String },
    source: { type: String },
    title: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    bookmarkedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    solvedBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        solvedAt: { type: Date, default: Date.now },
        attempts: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

PuzzleSchema.index({ difficulty: 1, rating: 1 });
PuzzleSchema.index({ themes: 1 });

export const Puzzle = models.Puzzle || model<IPuzzle>('Puzzle', PuzzleSchema);
