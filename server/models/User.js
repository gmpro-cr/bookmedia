const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  location: {
    type: String,
    maxlength: 100,
    default: ''
  },
  favoriteGenres: [{
    type: String,
    enum: [
      'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Fantasy', 'Sci-Fi',
      'Biography', 'History', 'Self-Help', 'Business', 'Philosophy',
      'Indian Literature', 'Mythology', 'Poetry', 'Drama', 'Thriller',
      'Horror', 'Comedy', 'Travel', 'Food', 'Art', 'Science', 'Technology'
    ]
  }],
  currentlyReading: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    startedAt: {
      type: Date,
      default: Date.now
    }
  }],
  shelves: {
    toRead: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    }],
    read: [{
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
      },
      readAt: {
        type: Date,
        default: Date.now
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      }
    }],
    dnf: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    }]
  },
  badges: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],
  stats: {
    booksRead: {
      type: Number,
      default: 0
    },
    reviewsWritten: {
      type: Number,
      default: 0
    },
    discussionsParticipated: {
      type: Number,
      default: 0
    },
    followersCount: {
      type: Number,
      default: 0
    },
    followingCount: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update stats method
userSchema.methods.updateStats = function(type, increment = 1) {
  if (this.stats[type] !== undefined) {
    this.stats[type] += increment;
  }
  return this.save();
};

// Add book to shelf method
userSchema.methods.addToShelf = function(shelfName, bookId, additionalData = {}) {
  if (shelfName === 'read') {
    this.shelves.read.push({
      book: bookId,
      ...additionalData
    });
  } else {
    this.shelves[shelfName].push(bookId);
  }
  return this.save();
};

// Remove book from shelf method
userSchema.methods.removeFromShelf = function(shelfName, bookId) {
  if (shelfName === 'read') {
    this.shelves.read = this.shelves.read.filter(item => 
      item.book.toString() !== bookId.toString()
    );
  } else {
    this.shelves[shelfName] = this.shelves[shelfName].filter(id => 
      id.toString() !== bookId.toString()
    );
  }
  return this.save();
};

// Add badge method
userSchema.methods.addBadge = function(badgeName, description, icon) {
  this.badges.push({
    name: badgeName,
    description,
    icon
  });
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
