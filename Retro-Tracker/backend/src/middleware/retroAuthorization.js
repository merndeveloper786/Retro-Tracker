import Retro from '../models/Retro.js';
import Team from '../models/Team.js';

// Check if user is a member of the team that owns the retro
export const isRetroTeamMember = async (req, res, next) => {
  try {
    const retroId = req.params.retroId;
    
    if (!retroId) {
      return res.status(400).json({ message: 'Retro ID is required' });
    }

    const retro = await Retro.findById(retroId).populate('team');
    if (!retro) {
      return res.status(404).json({ message: 'Retro not found' });
    }

    const team = await Team.findById(retro.team._id || retro.team);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (!team.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this team' });
    }

    req.retro = retro;
    req.team = team;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authorization error', error: error.message });
  }
};

