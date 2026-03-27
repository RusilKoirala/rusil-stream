// Watch history model
import mongoose from 'mongoose';

const WatchHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  movieId: { type: Number, required: true },
  movieTitle: { type: String },
  posterPath: { type: String },
  startedAt: { type: Date, default: Date.now },
  lastPlayedAt: { type: Date, default: Date.now },
  lastPositionSec: { type: Number, default: 0 },
  durationSec: { type: Number, default: 0 },
  watchedPercentage: { type: Number, default: 0 },
  status: { type: String, enum: ['watching', 'completed', 'paused'], default: 'watching' }
});

WatchHistorySchema.index({ userId: 1, profileId: 1, movieId: 1 }, { unique: true });

export default mongoose.models.WatchHistory || mongoose.model('WatchHistory', WatchHistorySchema);
