require('dotenv').config();
const express = require('express');
const router = express.Router();
const Workspace = require('../models/Workspace');
const Page = require('../models/Page');
const fetchuser = require('../middleware/fetchuser');

// GET all workspaces for authenticated user
router.get('/', fetchuser, async (req, res) => {
  try {
    const workspaces = await Workspace.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(workspaces);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single workspace
router.get('/:id', fetchuser, async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ _id: req.params.id, owner: req.user.id });
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    res.json(workspace);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create workspace
router.post('/', fetchuser, async (req, res) => {
  try {
    const { name, icon, description, coverColor } = req.body;
    if (!name || name.trim().length < 1) {
      return res.status(400).json({ error: 'Workspace name is required' });
    }

    const workspace = new Workspace({
      name: name.trim(),
      icon: icon || '🏠',
      description: description || '',
      coverColor: coverColor || '#5E6AD2',
      owner: req.user.id,
      members: [req.user.id]
    });

    const saved = await workspace.save();

    // Auto-create a "Getting Started" page
    const starterPage = new Page({
      workspace: saved._id,
      title: 'Getting Started',
      icon: '👋',
      createdBy: req.user.id,
      updatedBy: req.user.id,
      content: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Welcome to ' + name }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'This is your new workspace. Start writing by clicking anywhere or use / to insert blocks.' }] }
        ]
      },
      excerpt: 'Welcome to ' + name + '. Start writing...'
    });
    await starterPage.save();

    res.status(201).json({ workspace: saved, starterPage });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update workspace
router.put('/:id', fetchuser, async (req, res) => {
  try {
    const { name, icon, description, coverColor } = req.body;
    const workspace = await Workspace.findOne({ _id: req.params.id, owner: req.user.id });
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    if (name) workspace.name = name.trim();
    if (icon !== undefined) workspace.icon = icon;
    if (description !== undefined) workspace.description = description;
    if (coverColor !== undefined) workspace.coverColor = coverColor;

    const updated = await workspace.save();
    res.json(updated);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE workspace (and all its pages)
router.delete('/:id', fetchuser, async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ _id: req.params.id, owner: req.user.id });
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    await Page.deleteMany({ workspace: req.params.id });
    await workspace.deleteOne();

    res.json({ success: true, message: 'Workspace and all pages deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
