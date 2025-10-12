const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Indian Fiction', 'Mythology', 'Finance Books', 'IAS Preparation',
      'Self-Help', 'Biography', 'History', 'Science Fiction', 'Romance',
      'Mystery', 'Fantasy', 'Poetry', 'Drama', 'Non-Fiction', 'General Discussion',
      'Book Recommendations', 'Author Discussions', 'Book Reviews', 'Reading Challenges'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    default: null
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isSolution: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search and sorting
discussionSchema.index({ category: 1, createdAt: -1 });
discussionSchema.index({ author: 1 });
discussionSchema.index({ book: 1 });
discussionSchema.index({ title: 'text', content: 'text' });

// Virtual for reply count
discussionSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Virtual for like count
discussionSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Method to add reply
discussionSchema.methods.addReply = function(authorId, content) {
  this.replies.push({
    author: authorId,
    content: content
  });
  return this.save();
};

// Method to add like to discussion
discussionSchema.methods.addLike = function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to add like to reply
discussionSchema.methods.addReplyLike = function(replyId, userId) {
  const reply = this.replies.id(replyId);
  if (reply && !reply.likes.includes(userId)) {
    reply.likes.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to mark reply as solution
discussionSchema.methods.markAsSolution = function(replyId) {
  // Remove solution from other replies
  this.replies.forEach(reply => {
    reply.isSolution = false;
  });
  
  // Mark selected reply as solution
  const reply = this.replies.id(replyId);
  if (reply) {
    reply.isSolution = true;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to increment view count
discussionSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

// Static method to get discussions by category
discussionSchema.statics.getByCategory = function(category, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ 
    category: category, 
    isActive: true 
  })
  .populate('author', 'name avatar')
  .populate('book', 'title author coverImage')
  .populate('replies.author', 'name avatar')
  .sort({ isPinned: -1, createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .exec();
};

// Static method to get popular discussions
discussionSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .populate('author', 'name avatar')
    .populate('book', 'title author coverImage')
    .sort({ likeCount: -1, viewCount: -1 })
    .limit(limit)
    .exec();
};

// Static method to search discussions
discussionSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    isActive: true,
    ...filters
  };
  
  return this.find(searchQuery)
    .populate('author', 'name avatar')
    .populate('book', 'title author coverImage')
    .sort({ score: { $meta: 'textScore' } })
    .exec();
};

module.exports = mongoose.model('Discussion', discussionSchema);
