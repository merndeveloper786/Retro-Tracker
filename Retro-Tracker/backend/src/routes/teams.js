import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { isTeamMember, isTeamOwner } from '../middleware/authorization.js';
import {
  createTeam,
  getMyTeams,
  getTeam,
  updateTeam,
  inviteMember,
  removeMember,
} from '../controllers/teamController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all teams for the authenticated user
router.get('/', getMyTeams);

// Create a new team
router.post('/', createTeam);

// Get a specific team (must be a member)
router.get('/:teamId', isTeamMember, getTeam);

// Update team (must be owner)
router.put('/:teamId', isTeamOwner, updateTeam);

// Invite a member (must be owner)
router.post('/:teamId/members', isTeamOwner, inviteMember);

// Remove a member (must be owner)
router.delete('/:teamId/members/:memberId', isTeamOwner, removeMember);

export default router;

