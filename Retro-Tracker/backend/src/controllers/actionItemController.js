import ActionItem from '../models/ActionItem.js';
import Card from '../models/Card.js';
import Retro from '../models/Retro.js';

export const createActionItem = async (req, res) => {
  try {
    const { title, description, sourceCardIds, assignedTo } = req.body;
    const { retroId } = req.params;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Action item title is required' });
    }

    // Verify retro exists and get team
    const retro = await Retro.findById(retroId);
    if (!retro) {
      return res.status(404).json({ message: 'Retro not found' });
    }

    // Verify source cards exist and belong to "Needs Improvement" column
    if (sourceCardIds && sourceCardIds.length > 0) {
      const sourceCards = await Card.find({
        _id: { $in: sourceCardIds },
        retro: retroId,
        column: 'Needs Improvement',
        isDeleted: false,
      });

      if (sourceCards.length !== sourceCardIds.length) {
        return res.status(400).json({ message: 'Some source cards are invalid or not from Needs Improvement column' });
      }
    }

    const actionItem = await ActionItem.create({
      title: title.trim(),
      description: description?.trim() || '',
      team: retro.team,
      retro: retroId,
      sourceCards: sourceCardIds || [],
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
    });

    await actionItem.populate('createdBy', 'name email');
    await actionItem.populate('assignedTo', 'name email');
    await actionItem.populate('sourceCards', 'content');
    await actionItem.populate('retro', 'name');

    res.status(201).json({
      message: 'Action item created successfully',
      actionItem,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create action item', error: error.message });
  }
};

export const getActionItems = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { status, retroId, search } = req.query;

    let query = { team: teamId };

    // Filter by status
    if (status && ['Open', 'In Progress', 'Done'].includes(status)) {
      query.status = status;
    }

    // Filter by retro
    if (retroId) {
      query.retro = retroId;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const actionItems = await ActionItem.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('retro', 'name')
      .populate('sourceCards', 'content')
      .sort({ createdAt: -1 });

    res.json({ actionItems });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch action items', error: error.message });
  }
};

export const getActionItem = async (req, res) => {
  try {
    const actionItem = await ActionItem.findById(req.params.actionItemId)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('retro', 'name')
      .populate('sourceCards', 'content');

    if (!actionItem) {
      return res.status(404).json({ message: 'Action item not found' });
    }

    res.json({ actionItem });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch action item', error: error.message });
  }
};

export const updateActionItem = async (req, res) => {
  try {
    const { title, description, status, assignedTo } = req.body;
    const { actionItemId } = req.params;

    const actionItem = await ActionItem.findById(actionItemId);
    if (!actionItem) {
      return res.status(404).json({ message: 'Action item not found' });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: 'Title cannot be empty' });
      }
      actionItem.title = title.trim();
    }

    if (description !== undefined) {
      actionItem.description = description.trim();
    }

    if (status !== undefined) {
      if (!['Open', 'In Progress', 'Done'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      actionItem.status = status;
    }

    if (assignedTo !== undefined) {
      actionItem.assignedTo = assignedTo || null;
    }

    await actionItem.save();

    await actionItem.populate('createdBy', 'name email');
    await actionItem.populate('assignedTo', 'name email');
    await actionItem.populate('retro', 'name');
    await actionItem.populate('sourceCards', 'content');

    res.json({
      message: 'Action item updated successfully',
      actionItem,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update action item', error: error.message });
  }
};

