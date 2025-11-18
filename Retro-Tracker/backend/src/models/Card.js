import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Card content is required'],
    trim: true,
  },
  column: {
    type: String,
    enum: ['Went Well', 'Needs Improvement', 'Kudos'],
    required: true,
  },
  retro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retro',
    required: true,
    index: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
cardSchema.index({ retro: 1, column: 1, isDeleted: 1 });
cardSchema.index({ author: 1 });

// Soft delete method
cardSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

export default mongoose.model('Card', cardSchema);

