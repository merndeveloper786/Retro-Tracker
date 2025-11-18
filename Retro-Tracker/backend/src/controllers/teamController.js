import Team from '../models/Team.js';
import User from '../models/User.js';

export const createTeam = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const team = await Team.create({
      name: name.trim(),
      members: [{
        user: req.user._id,
        role: 'Owner',
        invitedEmail: req.user.email,
      }],
    });

    await team.populate('members.user', 'name email');

    res.status(201).json({
      message: 'Team created successfully',
      team,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create team', error: error.message });
  }
};

export const getMyTeams = async (req, res) => {
  try {
    // Find teams where user is a member (user field matches) OR where user's email matches invitedEmail
    const teams = await Team.find({
      $or: [
        { 'members.user': req.user._id },
        { 'members.invitedEmail': req.user.email.toLowerCase() }
      ]
    })
    .populate('members.user', 'name email')
    .sort({ createdAt: -1 });

    // For teams where user was invited by email but user field is null, update it
    for (const team of teams) {
      const memberWithEmail = team.members.find(
        m => m.invitedEmail.toLowerCase() === req.user.email.toLowerCase() && !m.user
      );
      
      if (memberWithEmail) {
        // Auto-link the user to the invitation
        memberWithEmail.user = req.user._id;
        await team.save();
      }
    }

    // Re-fetch to get updated data
    const updatedTeams = await Team.find({
      $or: [
        { 'members.user': req.user._id },
        { 'members.invitedEmail': req.user.email.toLowerCase() }
      ]
    })
    .populate('members.user', 'name email')
    .sort({ createdAt: -1 });

    res.json({ teams: updatedTeams });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch teams', error: error.message });
  }
};

export const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate('members.user', 'name email');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ team });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch team', error: error.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    team.name = name.trim();
    await team.save();

    await team.populate('members.user', 'name email');

    res.json({
      message: 'Team updated successfully',
      team,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update team', error: error.message });
  }
};

export const inviteMember = async (req, res) => {
  try {
    const { email, role = 'Member' } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!['Owner', 'Member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be Owner or Member' });
    }

    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user already exists
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    // Check if already a member
    const existingMember = team.members.find(
      m => m.invitedEmail.toLowerCase() === email.toLowerCase().trim()
    );
    
    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    // Add member
    const newMember = {
      user: user ? user._id : null,
      role,
      invitedEmail: email.toLowerCase().trim(),
    };

    team.members.push(newMember);
    await team.save();

    await team.populate('members.user', 'name email');

    res.status(201).json({
      message: 'Member invited successfully',
      team,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to invite member', error: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Find member by _id
    const member = team.members.find(m => m._id.toString() === memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Prevent removing the last owner
    const owners = team.members.filter(m => m.role === 'Owner');
    if (member.role === 'Owner' && owners.length === 1) {
      return res.status(400).json({ message: 'Cannot remove the last owner of the team' });
    }

    // Remove member using pull with the member's _id
    team.members.pull({ _id: memberId });
    await team.save();

    await team.populate('members.user', 'name email');

    res.json({
      message: 'Member removed successfully',
      team,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove member', error: error.message });
  }
};

