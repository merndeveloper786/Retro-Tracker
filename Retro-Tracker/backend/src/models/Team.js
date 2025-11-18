import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allow null for pending invitations
  },
  role: {
    type: String,
    enum: ['Owner', 'Member'],
    default: 'Member',
    required: true,
  },
  invitedEmail: {
    type: String,
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true }); // Enable _id for members so we can remove them

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
  },
  members: [teamMemberSchema],
}, {
  timestamps: true,
});

// Indexes
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ createdAt: -1 });

// Method to check if user is owner
teamSchema.methods.isOwner = function(userId) {
  const member = this.members.find(m => m.user && m.user.toString() === userId.toString());
  return member && member.role === 'Owner';
};

// Method to check if user is member (by user ID or email)
teamSchema.methods.isMember = function(userId, userEmail = null) {
  return this.members.some(m => {
    const userMatch = m.user && m.user.toString() === userId.toString();
    const emailMatch = userEmail && m.invitedEmail.toLowerCase() === userEmail.toLowerCase();
    return userMatch || emailMatch;
  });
};

// Method to get member role
teamSchema.methods.getMemberRole = function(userId) {
  const member = this.members.find(m => m.user && m.user.toString() === userId.toString());
  return member ? member.role : null;
};

export default mongoose.model('Team', teamSchema);

