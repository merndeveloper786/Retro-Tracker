import Card from '../models/Card.js';
import Retro from '../models/Retro.js';

export const createCard = async (req, res) => {
  try {
    const { content, column } = req.body;
    const { retroId } = req.params;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Card content is required' });
    }

    if (!['Went Well', 'Needs Improvement', 'Kudos'].includes(column)) {
      return res.status(400).json({ message: 'Invalid column. Must be one of: Went Well, Needs Improvement, Kudos' });
    }

    // Verify retro exists and user has access
    const retro = await Retro.findById(retroId);
    if (!retro) {
      return res.status(404).json({ message: 'Retro not found' });
    }

    const card = await Card.create({
      content: content.trim(),
      column,
      retro: retroId,
      author: req.user._id,
    });

    await card.populate('author', 'name email');

    res.status(201).json({
      message: 'Card created successfully',
      card,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create card', error: error.message });
  }
};

export const updateCard = async (req, res) => {
  try {
    const { content } = req.body;
    const { cardId } = req.params;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Card content is required' });
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user is the author
    if (card.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own cards' });
    }

    card.content = content.trim();
    await card.save();

    await card.populate('author', 'name email');

    res.json({
      message: 'Card updated successfully',
      card,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update card', error: error.message });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user is the author
    if (card.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own cards' });
    }

    // Soft delete
    await card.softDelete();

    res.json({
      message: 'Card deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete card', error: error.message });
  }
};

