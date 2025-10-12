const express = require('express');
const Review = require('../models/Review');
const Book = require('../models/Book');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a review
router.post('/', auth, async (req, res) => {
  try {
    const { bookId, rating, title, content, quotes, isSpoiler } = req.body;

    // Validation
    if (!bookId || !rating || !title || !content) {
      return res.status(400).json({ 
        message: 'Book ID, rating, title, and content are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ 
        message: 'Book not found' 
      });
    }

    // Check if user already reviewed this book
    const existingReview = await Review.findOne({ 
      user: req.user.userId, 
      book: bookId 
    });

    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this book' 
      });
    }

    // Create review
    const review = new Review({
      user: req.user.userId,
      book: bookId,
      rating,
      title,
      content,
      quotes: quotes || [],
      isSpoiler: isSpoiler || false
    });

    await review.save();

    // Update book rating
    await book.updateRating(rating);

    // Update user stats
    const user = await User.findById(req.user.userId);
    await user.updateStats('reviewsWritten', 1);

    // Populate the review for response
    await review.populate('user', 'name avatar');
    await review.populate('book', 'title author coverImage');

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get reviews for a book
router.get('/book/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.getBookReviews(bookId, page, limit);

    res.json({ reviews });
  } catch (error) {
    console.error('Get book reviews error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get user's reviews
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.getUserReviews(userId, page, limit);

    res.json({ reviews });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get review by ID
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('book', 'title author coverImage')
      .populate('comments.user', 'name avatar');

    if (!review) {
      return res.status(404).json({ 
        message: 'Review not found' 
      });
    }

    res.json({ review });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const { rating, title, content, quotes, isSpoiler } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ 
        message: 'Review not found' 
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.userId) {
      return res.status(403).json({ 
        message: 'Not authorized to update this review' 
      });
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (title) review.title = title;
    if (content) review.content = content;
    if (quotes) review.quotes = quotes;
    if (isSpoiler !== undefined) review.isSpoiler = isSpoiler;

    await review.save();

    // If rating changed, update book average
    if (rating !== undefined) {
      const book = await Book.findById(review.book);
      await book.updateRating(rating);
    }

    res.json({ 
      message: 'Review updated successfully',
      review 
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ 
        message: 'Review not found' 
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.userId) {
      return res.status(403).json({ 
        message: 'Not authorized to delete this review' 
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Review deleted successfully' 
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Like/Unlike review
router.post('/:id/like', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ 
        message: 'Review not found' 
      });
    }

    const isLiked = review.likes.includes(req.user.userId);

    if (isLiked) {
      await review.removeLike(req.user.userId);
      res.json({ 
        message: 'Review unliked',
        liked: false 
      });
    } else {
      await review.addLike(req.user.userId);
      res.json({ 
        message: 'Review liked',
        liked: true 
      });
    }
  } catch (error) {
    console.error('Like review error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Add comment to review
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ 
        message: 'Comment content is required' 
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ 
        message: 'Review not found' 
      });
    }

    await review.addComment(req.user.userId, content);

    // Populate the new comment
    await review.populate('comments.user', 'name avatar');

    res.json({ 
      message: 'Comment added successfully',
      review 
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Mark review as helpful/not helpful
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const { isHelpful } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ 
        message: 'Review not found' 
      });
    }

    await review.markHelpful(isHelpful);

    res.json({ 
      message: 'Feedback recorded successfully',
      helpful: review.helpful,
      notHelpful: review.notHelpful
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get recent reviews
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const reviews = await Review.find({ isPublic: true })
      .populate('user', 'name avatar')
      .populate('book', 'title author coverImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ reviews });
  } catch (error) {
    console.error('Get recent reviews error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

module.exports = router;
