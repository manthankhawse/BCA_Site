import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ITournament extends Document {
  name: string;
  description?: string;
  type: 'swiss' | 'round_robin' | 'knockout' | 'arena';
  format: 'classical' | 'rapid' | 'blitz' | 'bullet';
  status: 'upcoming' | 'completed';
  startDate: Date;
  endDate?: Date;
  rounds: number;
  participants: {
    userId: mongoose.Types.ObjectId;
    rating: number;
    seed?: number;
    points?: number;
    tiebreak?: number;
  }[];
  standings: {
    userId: mongoose.Types.ObjectId;
    rank: number;
    points: number;
    tiebreak: number;
  }[];
  prizes?: string;
  venue?: string;
  locationType: 'online' | 'offline';
  platform?: string;
  link?: string;
  registrationLink?: string;
  entryFee?: string;
  maxParticipants?: number;
  thumbnail?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const TournamentSchema = new Schema<ITournament>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    type: { type: String, enum: ['swiss', 'round_robin', 'knockout', 'arena'], default: 'swiss' },
    format: { type: String, enum: ['classical', 'rapid', 'blitz', 'bullet'], default: 'rapid' },
    status: {
      type: String,
      enum: ['upcoming', 'completed'],
      default: 'upcoming',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    rounds: { type: Number, default: 5 },
    participants: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number },
        seed: { type: Number },
        points: { type: Number, default: 0 },
        tiebreak: { type: Number, default: 0 },
      },
    ],
    standings: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        rank: { type: Number },
        points: { type: Number },
        tiebreak: { type: Number },
      },
    ],
    prizes: { type: String },
    venue: { type: String },
    locationType: { type: String, enum: ['online', 'offline'], default: 'offline' },
    platform: { type: String },
    link: { type: String },
    registrationLink: { type: String },
    entryFee: { type: String },
    maxParticipants: { type: Number },
    thumbnail: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Tournament = models.Tournament || model<ITournament>('Tournament', TournamentSchema);
