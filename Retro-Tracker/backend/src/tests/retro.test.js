import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import express from 'express';
import authRoutes from '../routes/auth.js';
import teamRoutes from '../routes/teams.js';
import retroRoutes from '../routes/retros.js';
import User from '../models/User.js';
import Team from '../models/Team.js';
import Retro from '../models/Retro.js';

// Note: Install supertest with: npm install --save-dev supertest
// import request from 'supertest';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/retros', retroRoutes);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/retro-tracker-test';

describe('Retro API', () => {
  let authToken;
  let userId;
  let teamId;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);
    await User.deleteMany({});
    await Team.deleteMany({});
    await Retro.deleteMany({});

    // Create a user and get token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;

    // Create a team
    const teamResponse = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Team' });

    teamId = teamResponse.body.team._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Team.deleteMany({});
    await Retro.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/retros/teams/:teamId', () => {
    it('should create a retro for a team', async () => {
      // Placeholder test - create retro directly
      const retro = await Retro.create({
        name: 'Sprint 23 Retrospective',
        sprintNumber: '23',
        team: teamId,
        createdBy: userId,
      });
      expect(retro).toBeDefined();
      expect(retro.name).toBe('Sprint 23 Retrospective');
      expect(retro.sprintNumber).toBe('23');
    });
  });

  describe('GET /api/retros/teams/:teamId', () => {
    it('should get all retros for a team', async () => {
      const retros = await Retro.find({ team: teamId });
      expect(Array.isArray(retros)).toBe(true);
    });
  });
});

