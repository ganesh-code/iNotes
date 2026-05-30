require('dotenv').config();
const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
const Workspace = require('../models/Workspace');
const fetchuser = require('../middleware/fetchuser');

// Helper: verify user owns workspace
async function verifyWorkspaceAccess(workspaceId, userId) {
  const ws = await Workspace.findOne({ _id: workspaceId, owner: userId });
  return !!ws;
}

// GET all pages in a workspace (sidebar tree)
router.get('/workspace/:workspaceId', fetchuser, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    if (!await verifyWorkspaceAccess(workspaceId, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    // Return non-trashed pages, minimal fields for sidebar
    const pages = await Page.find({ workspace: workspaceId, isTrashed: false })
      .select('_id title icon parent isStarred order updatedAt')
      .sort({ order: 1, createdAt: 1 });
    res.json(pages);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET trashed pages in a workspace
router.get('/workspace/:workspaceId/trash', fetchuser, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    if (!await verifyWorkspaceAccess(workspaceId, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const pages = await Page.find({ workspace: workspaceId, isTrashed: true })
      .select('_id title icon trashedAt')
      .sort({ trashedAt: -1 });
    res.json(pages);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET starred pages in a workspace
router.get('/workspace/:workspaceId/starred', fetchuser, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    if (!await verifyWorkspaceAccess(workspaceId, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const pages = await Page.find({ workspace: workspaceId, isTrashed: false, isStarred: true })
      .select('_id title icon updatedAt')
      .sort({ updatedAt: -1 });
    res.json(pages);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single page (full content + ancestors for breadcrumbs)
router.get('/:id', fetchuser, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)
      .populate('createdBy', 'name avatar')
      .populate('updatedBy', 'name avatar');
    if (!page) return res.status(404).json({ error: 'Page not found' });
    if (!await verifyWorkspaceAccess(page.workspace, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Recursively find ancestors for breadcrumbs
    const getAncestors = async (parentId, list = []) => {
      if (!parentId) return list;
      const parent = await Page.findById(parentId).select('_id title icon parent');
      if (parent) {
        list.unshift({ _id: parent._id, title: parent.title, icon: parent.icon });
        return getAncestors(parent.parent, list);
      }
      return list;
    };

    const ancestors = await getAncestors(page.parent);
    
    // Convert mongoose doc to plain object to attach ancestors
    const pageObj = page.toObject();
    pageObj.ancestors = ancestors;

    res.json(pageObj);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// POST create page
router.post('/', fetchuser, async (req, res) => {
  try {
    const { workspaceId, parentId, title, icon } = req.body;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId is required' });
    if (!await verifyWorkspaceAccess(workspaceId, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get max order for sibling pages
    const siblings = await Page.find({ workspace: workspaceId, parent: parentId || null, isTrashed: false });
    const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(p => p.order)) + 1 : 0;

    const page = new Page({
      workspace: workspaceId,
      parent: parentId || null,
      title: title || 'Untitled',
      icon: icon || '',
      order: maxOrder,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      content: {
        type: 'doc',
        content: [{ type: 'paragraph' }]
      }
    });

    const saved = await page.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update page content / metadata
router.put('/:id', fetchuser, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ error: 'Page not found' });
    if (!await verifyWorkspaceAccess(page.workspace, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, icon, coverImage, coverColor, content, isStarred, order, parent } = req.body;
    if (title !== undefined) page.title = title;
    if (icon !== undefined) page.icon = icon;
    if (coverImage !== undefined) page.coverImage = coverImage;
    if (coverColor !== undefined) page.coverColor = coverColor;
    if (content !== undefined) {
      page.content = content;
      // Extract plain text excerpt from TipTap doc
      const getText = (node) => {
        if (node.type === 'text') return node.text || '';
        if (node.content) return node.content.map(getText).join(' ');
        return '';
      };
      page.excerpt = getText(content).substring(0, 300);
    }
    if (isStarred !== undefined) page.isStarred = isStarred;
    if (order !== undefined) page.order = order;
    if (parent !== undefined) page.parent = parent;

    page.updatedBy = req.user.id;
    const updated = await page.save();
    res.json(updated);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE (soft delete — move to trash)
router.delete('/:id', fetchuser, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ error: 'Page not found' });
    if (!await verifyWorkspaceAccess(page.workspace, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Also trash all children recursively
    const trashRecursive = async (pageId) => {
      const children = await Page.find({ parent: pageId, isTrashed: false });
      for (const child of children) {
        child.isTrashed = true;
        child.trashedAt = new Date();
        await child.save();
        await trashRecursive(child._id);
      }
    };

    page.isTrashed = true;
    page.trashedAt = new Date();
    await page.save();
    await trashRecursive(page._id);

    res.json({ success: true, message: 'Page moved to trash' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT restore from trash
router.put('/:id/restore', fetchuser, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ error: 'Page not found' });
    if (!await verifyWorkspaceAccess(page.workspace, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    page.isTrashed = false;
    page.trashedAt = null;
    const restored = await page.save();
    res.json({ success: true, page: restored });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE permanent delete
router.delete('/:id/permanent', fetchuser, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ error: 'Page not found' });
    if (!await verifyWorkspaceAccess(page.workspace, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Permanently delete all children too
    const deleteRecursive = async (pageId) => {
      const children = await Page.find({ parent: pageId });
      for (const child of children) {
        await deleteRecursive(child._id);
        await child.deleteOne();
      }
    };
    await deleteRecursive(page._id);
    await page.deleteOne();

    res.json({ success: true, message: 'Page permanently deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET search pages
router.get('/search/:workspaceId', fetchuser, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { q } = req.query;
    if (!await verifyWorkspaceAccess(workspaceId, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (!q || q.length < 1) return res.json([]);

    const pages = await Page.find({
      workspace: workspaceId,
      isTrashed: false,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } }
      ]
    })
    .select('_id title icon excerpt parent updatedAt')
    .populate('parent', 'title icon')
    .limit(20);

    res.json(pages);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE empty trash (permanent delete all)
router.delete('/workspace/:workspaceId/trash/empty', fetchuser, async (req, res) => {
  try {
    if (!await verifyWorkspaceAccess(req.params.workspaceId, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const result = await Page.deleteMany({
      workspace: req.params.workspaceId,
      isTrashed: true
    });
    res.json({ success: true, count: result.deletedCount });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
