import mongoose from 'mongoose';

const managerMessageSchema = new mongoose.Schema({
  type: { type: String, default: 'match' },
  newProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  matchedProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  score: { type: Number, default: 0 },
  message: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ManagerMessage', managerMessageSchema);
