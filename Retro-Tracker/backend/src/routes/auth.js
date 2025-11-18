import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { checkDBConnection } from '../middleware/dbConnection.js';

const router = express.Router();

// Check database connection for all auth routes
router.use(checkDBConnection);

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);

export default router;

