import mongoose from 'mongoose';

const actionItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Action item title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Done'],
    default: 'Open',
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true,
  },
  retro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retro',
    required: true,
    index: true,
  },
  sourceCards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
actionItemSchema.index({ team: 1, status: 1 });
actionItemSchema.index({ retro: 1 });
actionItemSchema.index({ title: 'text' }); // For text search

export default mongoose.model('ActionItem', actionItemSchema);

