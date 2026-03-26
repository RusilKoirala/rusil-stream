// Saved list (favorites/watchlist) model
import mongoose from 'mongoose';

const SavedListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  movieId: { type: Number, required: true },
  movieTitle: { type: String },
  posterPath: { type: String },
  addedAt: { type: Date, default: Date.now }
});

SavedListSchema.index({ userId: 1, profileId: 1, movieId: 1 }, { unique: true });

export default mongoose.models.SavedList || mongoose.model('SavedList', SavedListSchema);
