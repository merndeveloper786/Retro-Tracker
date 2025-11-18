import mongoose from 'mongoose';

const retroSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Retro name is required'],
    trim: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true,
  },
  sprintNumber: {
    type: String,
    trim: true,
  },
  dateRange: {
    start: Date,
    end: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes
retroSchema.index({ team: 1, createdAt: -1 });
retroSchema.index({ name: 'text' }); // For text search

export default mongoose.model('Retro', retroSchema);

