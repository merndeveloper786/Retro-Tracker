import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { isTeamMember } from '../middleware/authorization.js';
import { isRetroTeamMember } from '../middleware/retroAuthorization.js';
import { isActionItemTeamMember } from '../middleware/actionItemAuthorization.js';
import {
  createActionItem,
  getActionItems,
  getActionItem,
  updateActionItem,
} from '../controllers/actionItemController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create action item from a retro (must be team member of retro's team)
router.post('/retros/:retroId', isRetroTeamMember, createActionItem);

// Get all action items for a team (must be team member)
router.get('/teams/:teamId', isTeamMember, getActionItems);

// Get a specific action item (must be team member of action item's team)
router.get('/:actionItemId', isActionItemTeamMember, getActionItem);

// Update action item (must be team member of action item's team)
router.put('/:actionItemId', isActionItemTeamMember, updateActionItem);

export default router;

