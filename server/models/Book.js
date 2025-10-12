const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  author: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true
  },
  coverImage: {
    type: String,
    default: null
  },
  genre: [{
    type: String,
    enum: [
      'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Fantasy', 'Sci-Fi',
      'Biography', 'History', 'Self-Help', 'Business', 'Philosophy',
      'Indian Literature', 'Mythology', 'Poetry', 'Drama', 'Thriller',
      'Horror', 'Comedy', 'Travel', 'Food', 'Art', 'Science', 'Technology',
      'IAS Preparation', 'Finance', 'Spirituality', 'Health', 'Parenting',
      'Education', 'Politics', 'Economics', 'Psychology', 'Sociology'
    ]
  }],
  language: {
    type: String,
    enum: ['English', 'Hindi', 'Marathi', 'Tamil', 'Bengali', 'Gujarati', 'Telugu', 'Kannada', 'Malayalam', 'Punjabi'],
    default: 'English'
  },
  publicationYear: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear() + 1
  },
  publisher: {
    type: String,
    trim: true,
    maxlength: 100
  },
  pageCount: {
    type: Number,
    min: 1
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  buyingLinks: {
    amazonIndia: {
      type: String,
      default: null
    },
    flipkart: {
      type: String,
      default: null
    },
    other: [{
      platform: String,
      url: String,
      price: Number
    }]
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  isIndian: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for search functionality
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ genre: 1 });
bookSchema.index({ language: 1 });
bookSchema.index({ averageRating: -1 });
bookSchema.index({ isIndian: 1 });

// Virtual for rating percentage
bookSchema.virtual('ratingPercentage').get(function() {
  return this.averageRating ? (this.averageRating / 5) * 100 : 0;
});

// Method to update average rating
bookSchema.methods.updateRating = function(newRating) {
  const totalScore = this.averageRating * this.totalRatings;
  this.totalRatings += 1;
  this.averageRating = (totalScore + newRating) / this.totalRatings;
  return this.save();
};

// Static method to get popular books
bookSchema.statics.getPopularBooks = function(limit = 10) {
  return this.find({ 
    isPopular: true, 
    status: 'active' 
  })
  .sort({ averageRating: -1, totalRatings: -1 })
  .limit(limit)
  .populate('reviews', 'rating user')
  .exec();
};

// Static method to get Indian books
bookSchema.statics.getIndianBooks = function(limit = 20) {
  return this.find({ 
    isIndian: true, 
    status: 'active' 
  })
  .sort({ averageRating: -1 })
  .limit(limit)
  .exec();
};

// Static method to search books
bookSchema.statics.searchBooks = function(query, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'active',
    ...filters
  };
  
  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' } })
    .exec();
};

module.exports = mongoose.model('Book', bookSchema);
