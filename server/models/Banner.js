import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  // Single main image (legacy) - kept for compatibility
  imageUrl: {
    type: String
  },
  // Support multiple images as a carousel/advert window
  images: {
    type: [String],
    default: []
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Banner', bannerSchema);
