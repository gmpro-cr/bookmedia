const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Book Fair', 'Author Meet', 'Reading Club', 'Book Launch',
      'Literary Festival', 'Workshop', 'Book Discussion', 'Poetry Reading',
      'Storytelling', 'Book Exchange', 'Library Visit', 'Other'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Indian Literature', 'Mythology', 'Finance', 'IAS Preparation',
      'Fiction', 'Non-Fiction', 'Poetry', 'Drama', 'General', 'Children'
    ]
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in hours
    default: 2
  },
  location: {
    venue: {
      type: String,
      required: true,
      maxlength: 200
    },
    address: {
      type: String,
      required: true,
      maxlength: 500
    },
    city: {
      type: String,
      required: true,
      maxlength: 100
    },
    state: {
      type: String,
      required: true,
      maxlength: 100
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  onlineLink: {
    type: String,
    default: null
  },
  maxAttendees: {
    type: Number,
    default: null
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  interested: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    default: null
  },
  author: {
    name: String,
    bio: String,
    image: String
  },
  image: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  isFree: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    default: 0
  },
  requirements: {
    type: String,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCancelled: {
    type: Boolean,
    default: false
  },
  cancellationReason: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for search and filtering
eventSchema.index({ date: 1 });
eventSchema.index({ city: 1, state: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ title: 'text', description: 'text' });

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function() {
  return this.attendees.length;
});

// Virtual for interested count
eventSchema.virtual('interestedCount').get(function() {
  return this.interested.length;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  if (this.maxAttendees) {
    return this.maxAttendees - this.attendees.length;
  }
  return null;
});

// Method to add attendee
eventSchema.methods.addAttendee = function(userId) {
  if (this.maxAttendees && this.attendees.length >= this.maxAttendees) {
    throw new Error('Event is full');
  }
  
  const existingAttendee = this.attendees.find(attendee => 
    attendee.user.toString() === userId.toString()
  );
  
  if (!existingAttendee) {
    this.attendees.push({ user: userId });
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove attendee
eventSchema.methods.removeAttendee = function(userId) {
  this.attendees = this.attendees.filter(attendee => 
    attendee.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to add interested user
eventSchema.methods.addInterested = function(userId) {
  if (!this.interested.includes(userId)) {
    this.interested.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove interested user
eventSchema.methods.removeInterested = function(userId) {
  this.interested = this.interested.filter(id => 
    id.toString() !== userId.toString()
  );
  return this.save();
};

// Static method to get events by city
eventSchema.statics.getByCity = function(city, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ 
    'location.city': city, 
    isActive: true, 
    isCancelled: false,
    date: { $gte: new Date() }
  })
  .populate('organizer', 'name avatar')
  .populate('book', 'title author coverImage')
  .sort({ date: 1 })
  .skip(skip)
  .limit(limit)
  .exec();
};

// Static method to get upcoming events
eventSchema.statics.getUpcoming = function(limit = 10) {
  return this.find({ 
    isActive: true, 
    isCancelled: false,
    date: { $gte: new Date() }
  })
  .populate('organizer', 'name avatar')
  .populate('book', 'title author coverImage')
  .sort({ date: 1 })
  .limit(limit)
  .exec();
};

// Static method to get events by type
eventSchema.statics.getByType = function(type, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ 
    type: type, 
    isActive: true, 
    isCancelled: false,
    date: { $gte: new Date() }
  })
  .populate('organizer', 'name avatar')
  .populate('book', 'title author coverImage')
  .sort({ date: 1 })
  .skip(skip)
  .limit(limit)
  .exec();
};

module.exports = mongoose.model('Event', eventSchema);
