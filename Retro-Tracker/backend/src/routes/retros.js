import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { isTeamMember } from '../middleware/authorization.js';
import { isRetroTeamMember } from '../middleware/retroAuthorization.js';
import {
  createRetro,
  getRetros,
  getRetro,
  getRetroBoard,
} from '../controllers/retroController.js';
import {
  createCard,
  updateCard,
  deleteCard,
} from '../controllers/cardController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create retro for a team (must be team member)
router.post('/teams/:teamId', isTeamMember, createRetro);

// Get all retros for a team (must be team member)
router.get('/teams/:teamId', isTeamMember, getRetros);

// Get a specific retro (must be team member of retro's team)
router.get('/:retroId', isRetroTeamMember, getRetro);

// Get retro board with cards (must be team member of retro's team)
router.get('/:retroId/board', isRetroTeamMember, getRetroBoard);

// Card routes (must be team member of retro's team)
router.post('/:retroId/cards', isRetroTeamMember, createCard);
router.put('/:retroId/cards/:cardId', isRetroTeamMember, updateCard);
router.delete('/:retroId/cards/:cardId', isRetroTeamMember, deleteCard);

export default router;

