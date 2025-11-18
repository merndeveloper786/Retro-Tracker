import Team from '../models/Team.js';

// Check if user is a member of the team
export const isTeamMember = async (req, res, next) => {
  try {
    const teamId = req.params.teamId || req.body.team || req.query.team;
    
    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check membership by user ID or email
    if (!team.isMember(req.user._id, req.user.email)) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this team' });
    }

    // Auto-link user if they were invited by email
    const memberWithEmail = team.members.find(
      m => m.invitedEmail.toLowerCase() === req.user.email.toLowerCase() && !m.user
    );
    
    if (memberWithEmail) {
      memberWithEmail.user = req.user._id;
      await team.save();
    }

    req.team = team;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authorization error', error: error.message });
  }
};

// Check if user is the owner of the team
export const isTeamOwner = async (req, res, next) => {
  try {
    const teamId = req.params.teamId || req.body.team;
    
    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (!team.isOwner(req.user._id)) {
      return res.status(403).json({ message: 'Access denied. Only team owners can perform this action' });
    }

    req.team = team;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authorization error', error: error.message });
  }
};

// Check if user owns the resource (for cards, etc.)
export const isResourceOwner = (resourceUserIdField = 'author') => {
  return (req, res, next) => {
    const resource = req.resource || req.card || req.actionItem;
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const resourceUserId = resource[resourceUserIdField];
    if (!resourceUserId || resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only modify your own resources' });
    }

    next();
  };
};

