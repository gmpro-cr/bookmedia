const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  quotes: [{
    text: {
      type: String,
      maxlength: 500
    },
    pageNumber: {
      type: Number,
      min: 1
    }
  }],
  isSpoiler: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure one review per user per book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

// Index for sorting
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ helpful: -1 });

// Virtual for like count
reviewSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
reviewSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to add like
reviewSchema.methods.addLike = function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove like
reviewSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(id => id.toString() !== userId.toString());
  return this.save();
};

// Method to add comment
reviewSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
  return this.save();
};

// Method to mark as helpful/not helpful
reviewSchema.methods.markHelpful = function(isHelpful) {
  if (isHelpful) {
    this.helpful += 1;
  } else {
    this.notHelpful += 1;
  }
  return this.save();
};

// Static method to get reviews for a book
reviewSchema.statics.getBookReviews = function(bookId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ book: bookId, isPublic: true })
    .populate('user', 'name avatar')
    .populate('comments.user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
};

// Static method to get user reviews
reviewSchema.statics.getUserReviews = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ user: userId, isPublic: true })
    .populate('book', 'title author coverImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
};

module.exports = mongoose.model('Review', reviewSchema);
