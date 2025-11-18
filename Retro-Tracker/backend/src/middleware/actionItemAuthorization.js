import ActionItem from '../models/ActionItem.js';
import Team from '../models/Team.js';

// Check if user is a member of the team that owns the action item
export const isActionItemTeamMember = async (req, res, next) => {
  try {
    const actionItemId = req.params.actionItemId;
    
    if (!actionItemId) {
      return res.status(400).json({ message: 'Action item ID is required' });
    }

    const actionItem = await ActionItem.findById(actionItemId);
    if (!actionItem) {
      return res.status(404).json({ message: 'Action item not found' });
    }

    const team = await Team.findById(actionItem.team);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (!team.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this team' });
    }

    req.actionItem = actionItem;
    req.team = team;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authorization error', error: error.message });
  }
};

