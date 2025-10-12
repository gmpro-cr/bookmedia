const express = require('express');
const Book = require('../models/Book');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all books with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      genre, 
      language = 'English', 
      search,
      sortBy = 'createdAt',
      order = 'desc',
      isIndian
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { status: 'active' };

    // Apply filters
    if (genre) {
      query.genre = { $in: Array.isArray(genre) ? genre : [genre] };
    }

    if (language) {
      query.language = language;
    }

    if (isIndian !== undefined) {
      query.isIndian = isIndian === 'true';
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'rating':
        sortOptions = { averageRating: order === 'desc' ? -1 : 1 };
        break;
      case 'title':
        sortOptions = { title: order === 'desc' ? -1 : 1 };
        break;
      case 'author':
        sortOptions = { author: order === 'desc' ? -1 : 1 };
        break;
      case 'year':
        sortOptions = { publicationYear: order === 'desc' ? -1 : 1 };
        break;
      default:
        sortOptions = { createdAt: order === 'desc' ? -1 : 1 };
    }

    const books = await Book.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const totalBooks = await Book.countDocuments(query);

    res.json({
      books,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBooks / limit),
        totalBooks,
        hasNext: skip + books.length < totalBooks,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ 
        message: 'Book not found' 
      });
    }

    // Get reviews for this book
    const reviews = await Review.getBookReviews(req.params.id, 1, 5);

    res.json({
      book,
      reviews
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get popular books
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const books = await Book.getPopularBooks(parseInt(limit));

    res.json({ books });
  } catch (error) {
    console.error('Get popular books error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get Indian books
router.get('/indian/all', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const books = await Book.getIndianBooks(parseInt(limit));

    res.json({ books });
  } catch (error) {
    console.error('Get Indian books error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get featured books
router.get('/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const books = await Book.find({ 
      isFeatured: true, 
      status: 'active' 
    })
    .sort({ averageRating: -1 })
    .limit(parseInt(limit));

    res.json({ books });
  } catch (error) {
    console.error('Get featured books error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Search books
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    if (!q) {
      return res.status(400).json({ 
        message: 'Search query is required' 
      });
    }

    const skip = (page - 1) * limit;
    const books = await Book.searchBooks(q, { status: 'active' })
      .skip(skip)
      .limit(parseInt(limit));

    const totalBooks = await Book.countDocuments({
      $text: { $search: q },
      status: 'active'
    });

    res.json({
      books,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBooks / limit),
        totalBooks,
        hasNext: skip + books.length < totalBooks,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get books by genre
router.get('/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const skip = (page - 1) * limit;
    const books = await Book.find({ 
      genre: { $in: [genre] }, 
      status: 'active' 
    })
    .sort({ averageRating: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const totalBooks = await Book.countDocuments({ 
      genre: { $in: [genre] }, 
      status: 'active' 
    });

    res.json({
      books,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBooks / limit),
        totalBooks,
        hasNext: skip + books.length < totalBooks,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get books by genre error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get books by author
router.get('/author/:author', async (req, res) => {
  try {
    const { author } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const skip = (page - 1) * limit;
    const books = await Book.find({ 
      author: { $regex: author, $options: 'i' }, 
      status: 'active' 
    })
    .sort({ publicationYear: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const totalBooks = await Book.countDocuments({ 
      author: { $regex: author, $options: 'i' }, 
      status: 'active' 
    });

    res.json({
      books,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBooks / limit),
        totalBooks,
        hasNext: skip + books.length < totalBooks,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get books by author error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get genres list
router.get('/genres/list', async (req, res) => {
  try {
    const genres = await Book.distinct('genre', { status: 'active' });
    res.json({ genres });
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get languages list
router.get('/languages/list', async (req, res) => {
  try {
    const languages = await Book.distinct('language', { status: 'active' });
    res.json({ languages });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

module.exports = router;
