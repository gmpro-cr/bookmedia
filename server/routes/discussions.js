const express = require('express');
const Discussion = require('../models/Discussion');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a discussion
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, tags, bookId } = req.body;

    // Validation
    if (!title || !content || !category) {
      return res.status(400).json({ 
        message: 'Title, content, and category are required' 
      });
    }

    const discussion = new Discussion({
      title,
      content,
      author: req.user.userId,
      category,
      tags: tags || [],
      book: bookId || null
    });

    await discussion.save();

    // Populate the discussion for response
    await discussion.populate('author', 'name avatar');
    if (bookId) {
      await discussion.populate('book', 'title author coverImage');
    }

    res.status(201).json({
      message: 'Discussion created successfully',
      discussion
    });
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get all discussions with pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { isActive: true };

    // Apply filters
    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'replies':
        sortOptions = { replyCount: order === 'desc' ? -1 : 1 };
        break;
      case 'likes':
        sortOptions = { likeCount: order === 'desc' ? -1 : 1 };
        break;
      case 'views':
        sortOptions = { viewCount: order === 'desc' ? -1 : 1 };
        break;
      default:
        sortOptions = { createdAt: order === 'desc' ? -1 : 1 };
    }

    const discussions = await Discussion.find(query)
      .populate('author', 'name avatar')
      .populate('book', 'title author coverImage')
      .populate('replies.author', 'name avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalDiscussions = await Discussion.countDocuments(query);

    res.json({
      discussions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalDiscussions / limit),
        totalDiscussions,
        hasNext: skip + discussions.length < totalDiscussions,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get discussion by ID
router.get('/:id', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('book', 'title author coverImage')
      .populate('replies.author', 'name avatar');

    if (!discussion) {
      return res.status(404).json({ 
        message: 'Discussion not found' 
      });
    }

    // Increment view count
    await discussion.incrementView();

    res.json({ discussion });
  } catch (error) {
    console.error('Get discussion error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Update discussion
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ 
        message: 'Discussion not found' 
      });
    }

    // Check if user owns the discussion
    if (discussion.author.toString() !== req.user.userId) {
      return res.status(403).json({ 
        message: 'Not authorized to update this discussion' 
      });
    }

    // Update fields
    if (title) discussion.title = title;
    if (content) discussion.content = content;
    if (tags) discussion.tags = tags;

    await discussion.save();

    res.json({ 
      message: 'Discussion updated successfully',
      discussion 
    });
  } catch (error) {
    console.error('Update discussion error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Delete discussion
router.delete('/:id', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ 
        message: 'Discussion not found' 
      });
    }

    // Check if user owns the discussion
    if (discussion.author.toString() !== req.user.userId) {
      return res.status(403).json({ 
        message: 'Not authorized to delete this discussion' 
      });
    }

    discussion.isActive = false;
    await discussion.save();

    res.json({ 
      message: 'Discussion deleted successfully' 
    });
  } catch (error) {
    console.error('Delete discussion error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Add reply to discussion
router.post('/:id/replies', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ 
        message: 'Reply content is required' 
      });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ 
        message: 'Discussion not found' 
      });
    }

    if (discussion.isLocked) {
      return res.status(403).json({ 
        message: 'This discussion is locked' 
      });
    }

    await discussion.addReply(req.user.userId, content);

    // Populate the new reply
    await discussion.populate('replies.author', 'name avatar');

    res.json({ 
      message: 'Reply added successfully',
      discussion 
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Like/Unlike discussion
router.post('/:id/like', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ 
        message: 'Discussion not found' 
      });
    }

    const isLiked = discussion.likes.includes(req.user.userId);

    if (isLiked) {
      discussion.likes = discussion.likes.filter(id => 
        id.toString() !== req.user.userId.toString()
      );
      res.json({ 
        message: 'Discussion unliked',
        liked: false 
      });
    } else {
      discussion.likes.push(req.user.userId);
      res.json({ 
        message: 'Discussion liked',
        liked: true 
      });
    }

    await discussion.save();
  } catch (error) {
    console.error('Like discussion error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Like/Unlike reply
router.post('/:id/replies/:replyId/like', auth, async (req, res) => {
  try {
    const { replyId } = req.params;

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ 
        message: 'Discussion not found' 
      });
    }

    const reply = discussion.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ 
        message: 'Reply not found' 
      });
    }

    const isLiked = reply.likes.includes(req.user.userId);

    if (isLiked) {
      reply.likes = reply.likes.filter(id => 
        id.toString() !== req.user.userId.toString()
      );
      res.json({ 
        message: 'Reply unliked',
        liked: false 
      });
    } else {
      reply.likes.push(req.user.userId);
      res.json({ 
        message: 'Reply liked',
        liked: true 
      });
    }

    await discussion.save();
  } catch (error) {
    console.error('Like reply error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Mark reply as solution
router.post('/:id/replies/:replyId/solution', auth, async (req, res) => {
  try {
    const { replyId } = req.params;

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ 
        message: 'Discussion not found' 
      });
    }

    // Check if user owns the discussion
    if (discussion.author.toString() !== req.user.userId) {
      return res.status(403).json({ 
        message: 'Not authorized to mark solution' 
      });
    }

    await discussion.markAsSolution(replyId);

    res.json({ 
      message: 'Reply marked as solution successfully' 
    });
  } catch (error) {
    console.error('Mark solution error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get discussions by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const discussions = await Discussion.getByCategory(category, page, limit);

    res.json({ discussions });
  } catch (error) {
    console.error('Get discussions by category error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get popular discussions
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const discussions = await Discussion.getPopular(parseInt(limit));

    res.json({ discussions });
  } catch (error) {
    console.error('Get popular discussions error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get categories list
router.get('/categories/list', async (req, res) => {
  try {
    const categories = [
      'Indian Fiction', 'Mythology', 'Finance Books', 'IAS Preparation',
      'Self-Help', 'Biography', 'History', 'Science Fiction', 'Romance',
      'Mystery', 'Fantasy', 'Poetry', 'Drama', 'Non-Fiction', 'General Discussion',
      'Book Recommendations', 'Author Discussions', 'Book Reviews', 'Reading Challenges'
    ];

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

module.exports = router;
