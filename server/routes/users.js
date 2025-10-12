const express = require('express');
const User = require('../models/User');
const Book = require('../models/Book');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -email')
      .populate('currentlyReading.book', 'title author coverImage')
      .populate('shelves.toRead', 'title author coverImage')
      .populate('shelves.read.book', 'title author coverImage')
      .populate('shelves.dnf', 'title author coverImage');

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Get user's recent reviews
    const recentReviews = await Review.getUserReviews(user._id, 1, 5);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        favoriteGenres: user.favoriteGenres,
        currentlyReading: user.currentlyReading,
        shelves: user.shelves,
        stats: user.stats,
        badges: user.badges,
        createdAt: user.createdAt
      },
      recentReviews
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Add book to shelf
router.post('/shelf/:shelfName', auth, async (req, res) => {
  try {
    const { shelfName } = req.params;
    const { bookId, rating } = req.body;

    if (!bookId) {
      return res.status(400).json({ 
        message: 'Book ID is required' 
      });
    }

    const validShelves = ['toRead', 'read', 'dnf'];
    if (!validShelves.includes(shelfName)) {
      return res.status(400).json({ 
        message: 'Invalid shelf name' 
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ 
        message: 'Book not found' 
      });
    }

    // Remove from other shelves first
    await user.removeFromShelf('toRead', bookId);
    await user.removeFromShelf('read', bookId);
    await user.removeFromShelf('dnf', bookId);

    // Add to specified shelf
    const additionalData = shelfName === 'read' && rating ? { rating } : {};
    await user.addToShelf(shelfName, bookId, additionalData);

    // Update user stats
    if (shelfName === 'read') {
      await user.updateStats('booksRead', 1);
    }

    res.json({ 
      message: `Book added to ${shelfName} shelf successfully` 
    });
  } catch (error) {
    console.error('Add to shelf error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Remove book from shelf
router.delete('/shelf/:shelfName/:bookId', auth, async (req, res) => {
  try {
    const { shelfName, bookId } = req.params;

    const validShelves = ['toRead', 'read', 'dnf'];
    if (!validShelves.includes(shelfName)) {
      return res.status(400).json({ 
        message: 'Invalid shelf name' 
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    await user.removeFromShelf(shelfName, bookId);

    res.json({ 
      message: `Book removed from ${shelfName} shelf successfully` 
    });
  } catch (error) {
    console.error('Remove from shelf error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Update currently reading progress
router.put('/currently-reading/:bookId', auth, async (req, res) => {
  try {
    const { bookId } = req.params;
    const { progress } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({ 
        message: 'Progress must be between 0 and 100' 
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Find the book in currently reading
    const currentlyReadingIndex = user.currentlyReading.findIndex(
      item => item.book.toString() === bookId
    );

    if (currentlyReadingIndex === -1) {
      return res.status(404).json({ 
        message: 'Book not found in currently reading' 
      });
    }

    user.currentlyReading[currentlyReadingIndex].progress = progress;
    await user.save();

    res.json({ 
      message: 'Reading progress updated successfully' 
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get user's reviews
router.get('/:userId/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reviews = await Review.getUserReviews(req.params.userId, page, limit);

    res.json({ reviews });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get user's shelves
router.get('/:userId/shelves', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('shelves.toRead', 'title author coverImage')
      .populate('shelves.read.book', 'title author coverImage')
      .populate('shelves.dnf', 'title author coverImage');

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.json({
      shelves: {
        toRead: user.shelves.toRead,
        read: user.shelves.read,
        dnf: user.shelves.dnf
      }
    });
  } catch (error) {
    console.error('Get user shelves error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Search users
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ 
        message: 'Search query is required' 
      });
    }

    const skip = (page - 1) * limit;
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    })
    .select('-password -email')
    .sort({ 'stats.booksRead': -1 })
    .skip(skip)
    .limit(limit);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

module.exports = router;
