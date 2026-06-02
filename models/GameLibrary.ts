import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IGameLibrary extends Document {
  title: string;
  white: string;
  black: string;
  whiteElo?: number;
  blackElo?: number;
  event?: string;
  site?: string;
  date?: string;
  result?: string;
  opening?: string;
  eco?: string;
  pgn: string;
  fen?: string;
  annotations?: string;
  tags: string[];
  uploadedBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  viewCount: number;
  createdAt: Date;
}

const GameLibrarySchema = new Schema<IGameLibrary>(
  {
    title: { type: String, required: true, trim: true },
    white: { type: String, required: true },
    black: { type: String, required: true },
    whiteElo: { type: Number },
    blackElo: { type: Number },
    event: { type: String },
    site: { type: String },
    date: { type: String },
    result: { type: String },
    opening: { type: String },
    eco: { type: String },
    pgn: { type: String, required: true },
    fen: { type: String },
    annotations: { type: String },
    tags: [{ type: String }],
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublic: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

GameLibrarySchema.index({ tags: 1 });
GameLibrarySchema.index({ eco: 1 });
GameLibrarySchema.index({ uploadedBy: 1 });

export const GameLibrary = models.GameLibrary || model<IGameLibrary>('GameLibrary', GameLibrarySchema);
