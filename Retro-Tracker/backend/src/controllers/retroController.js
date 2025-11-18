import Retro from '../models/Retro.js';
import Card from '../models/Card.js';

export const createRetro = async (req, res) => {
  try {
    const { name, sprintNumber, dateRange } = req.body;
    const teamId = req.params.teamId;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Retro name is required' });
    }

    const retro = await Retro.create({
      name: name.trim(),
      team: teamId,
      sprintNumber,
      dateRange,
      createdBy: req.user._id,
    });

    await retro.populate('createdBy', 'name email');
    await retro.populate('team', 'name');

    res.status(201).json({
      message: 'Retro created successfully',
      retro,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create retro', error: error.message });
  }
};

export const getRetros = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { search, startDate, endDate } = req.query;

    let query = { team: teamId };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const retros = await Retro.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ retros });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch retros', error: error.message });
  }
};

export const getRetro = async (req, res) => {
  try {
    const retro = await Retro.findById(req.params.retroId)
      .populate('createdBy', 'name email')
      .populate('team', 'name');

    if (!retro) {
      return res.status(404).json({ message: 'Retro not found' });
    }

    res.json({ retro });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch retro', error: error.message });
  }
};

export const getRetroBoard = async (req, res) => {
  try {
    const { retroId } = req.params;
    const { showDeleted = 'false' } = req.query;

    const retro = await Retro.findById(retroId)
      .populate('createdBy', 'name email')
      .populate('team', 'name');

    if (!retro) {
      return res.status(404).json({ message: 'Retro not found' });
    }

    // Build query for cards
    const cardQuery = { retro: retroId };
    if (showDeleted !== 'true') {
      cardQuery.isDeleted = false;
    }

    const cards = await Card.find(cardQuery)
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    // Organize cards by column
    const board = {
      'Went Well': cards.filter(c => c.column === 'Went Well'),
      'Needs Improvement': cards.filter(c => c.column === 'Needs Improvement'),
      'Kudos': cards.filter(c => c.column === 'Kudos'),
    };

    res.json({
      retro,
      board,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch retro board', error: error.message });
  }
};

